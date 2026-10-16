<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\RefundPaymentRequest;
use App\Http\Requests\ReconcilePaymentRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\PaymentRefund;
use App\Models\PaymentTransaction;
use Illuminate\Http\Client\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Payment::query()
            ->with([
                'booking',
                'user',
                'transactions',
                'refunds',
            ])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('payment_method')) {
            $query->where(
                'payment_method',
                $request->string('payment_method')
            );
        }

        if ($request->filled('booking_id')) {
            $query->where(
                'booking_id',
                $request->integer('booking_id')
            );
        }

        return response()->json(
            $query->paginate(20)
        );
    }

    /**
     * Create a local payment record.
     *
     * The amount always comes from the booking.
     */
    public function store(
        StorePaymentRequest $request
    ): JsonResponse {
        $booking = Booking::query()
            ->findOrFail($request->integer('booking_id'));

        $this->authorizeBooking($request, $booking);

        if (
            $booking->status === 'CANCELLED'
        ) {
            return response()->json([
                'message' => 'Cancelled bookings cannot be paid.',
            ], 422);
        }

        $amount = (float) $booking->total_amount;

        $payment = Payment::create([
            'booking_id' => $booking->id,
            'user_id' => $request->user()?->id,

            'payment_method' =>
                $request->string('payment_method'),

            'gateway' =>
                $request->string('payment_method') === 'PAYPAL'
                    ? 'PAYPAL'
                    : null,

            'currency' =>
                config(
                    'services.paypal.currency',
                    'USD'
                ),

            'amount' => $amount,

            'refunded_amount' => 0,

            'remaining_amount' => $amount,

            'status' =>
                Payment::STATUS_PENDING,

            'metadata' => [
                'booking_reference' =>
                    $booking->booking_reference,

                'payment_token' =>
                    Str::random(64),
            ],
        ]);

        return response()->json([
            'message' => 'Payment created successfully.',
            'payment' => $payment->load('booking'),
        ], 201);
    }

    /**
     * Create PayPal Sandbox order.
     */
    public function createPaypalOrder(
        Request $request
    ): JsonResponse {
        $request->validate([
            'payment_id' => [
                'required',
                'integer',
                'exists:payments,id',
            ],
        ]);

        $payment = Payment::with('booking')
            ->findOrFail($request->integer('payment_id'));

        $this->authorizePayment($request, $payment);

        if ($payment->status !== Payment::STATUS_PENDING) {
            return response()->json([
                'message' => 'This payment is no longer payable.',
            ], 422);
        }

        try {
            $accessToken = $this->paypalAccessToken();

            $response = Http::withToken($accessToken)
                ->acceptJson()
                ->contentType('application/json')
                ->withHeaders([
                    'PayPal-Request-Id' =>
                        (string) Str::uuid(),
                ])
                ->post(
                    config('services.paypal.base_url')
                    . '/v2/checkout/orders',
                    [
                        'intent' => 'CAPTURE',

                        'purchase_units' => [
                            [
                                'reference_id' =>
                                    $payment->payment_reference,

                                'invoice_id' =>
                                    $payment->payment_reference,

                                'custom_id' =>
                                    (string) $payment->id,

                                'description' =>
                                    'Court booking '
                                    . $payment->booking
                                        ->booking_reference,

                                'amount' => [
                                    'currency_code' =>
                                        $payment->currency,

                                    'value' =>
                                        number_format(
                                            (float) $payment->amount,
                                            2,
                                            '.',
                                            ''
                                        ),
                                ],
                            ],
                        ],
                    ]
                );

            if ($response->failed()) {
                return response()->json([
                    'message' =>
                        'Unable to create PayPal order.',
                    'paypal' => $response->json(),
                ], 422);
            }

            $paypalOrder = $response->json();

            $payment->update([
                'gateway_order_id' =>
                    $paypalOrder['id'] ?? null,

                'gateway_reference' =>
                    $paypalOrder['id'] ?? null,

                'gateway_response' =>
                    $paypalOrder,
            ]);

            PaymentTransaction::create([
                'payment_id' => $payment->id,
                'type' => 'PAYMENT',
                'status' => 'CREATED',
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'gateway' => 'PAYPAL',
                'gateway_reference' =>
                    $paypalOrder['id'] ?? null,
                'gateway_response' =>
                    $paypalOrder,
            ]);

            return response()->json([
                'id' => $paypalOrder['id'],
                'status' => $paypalOrder['status'] ?? null,
            ]);
        } catch (Throwable $e) {
            $payment->update([
                'status' => Payment::STATUS_FAILED,
                'failed_at' => now(),
                'failure_reason' => $e->getMessage(),
            ]);

            return response()->json([
                'message' =>
                    'PayPal order creation failed.',
            ], 500);
        }
    }

    /**
     * Capture PayPal Sandbox order.
     */
    public function capturePaypalOrder(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'payment_id' => [
                'required',
                'integer',
                'exists:payments,id',
            ],

            'order_id' => [
                'required',
                'string',
            ],
        ]);

        $payment = Payment::with('booking')
            ->findOrFail($validated['payment_id']);

        $this->authorizePayment($request, $payment);

        if (
            $payment->gateway_order_id !==
            $validated['order_id']
        ) {
            return response()->json([
                'message' =>
                    'PayPal order does not belong to this payment.',
            ], 422);
        }

        if ($payment->status === Payment::STATUS_PAID) {
            return response()->json([
                'message' => 'Payment is already paid.',
                'payment' => $payment,
            ]);
        }

        try {
            $accessToken = $this->paypalAccessToken();

            $response = Http::withToken($accessToken)
                ->acceptJson()
                ->contentType('application/json')
                ->withHeaders([
                    'PayPal-Request-Id' =>
                        (string) Str::uuid(),
                ])
                ->post(
                    config('services.paypal.base_url')
                    . '/v2/checkout/orders/'
                    . $validated['order_id']
                    . '/capture',
                    []
                );

            $paypalData = $response->json();

            if ($response->failed()) {
                $payment->update([
                    'status' => Payment::STATUS_FAILED,
                    'failed_at' => now(),
                    'failure_reason' =>
                        $paypalData['message']
                        ?? 'PayPal capture failed.',
                    'gateway_response' =>
                        $paypalData,
                ]);

                PaymentTransaction::create([
                    'payment_id' => $payment->id,
                    'type' => 'CAPTURE',
                    'status' => 'FAILED',
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'gateway' => 'PAYPAL',
                    'gateway_reference' =>
                        $validated['order_id'],
                    'gateway_response' =>
                        $paypalData,
                ]);

                return response()->json([
                    'message' =>
                        'PayPal payment failed.',
                    'payment' => $payment->fresh(),
                    'paypal' => $paypalData,
                ], 422);
            }

            $capture = data_get(
                $paypalData,
                'purchase_units.0.payments.captures.0'
            );

            $captureId = $capture['id'] ?? null;
            $captureStatus = $capture['status'] ?? null;

            if ($captureStatus !== 'COMPLETED') {
                $payment->update([
                    'status' => Payment::STATUS_FAILED,
                    'failed_at' => now(),
                    'failure_reason' =>
                        'PayPal capture status: '
                        . ($captureStatus ?? 'UNKNOWN'),
                    'gateway_capture_id' => $captureId,
                    'gateway_response' => $paypalData,
                ]);

                return response()->json([
                    'message' =>
                        'PayPal payment was not completed.',
                    'payment' => $payment->fresh(),
                ], 422);
            }

            DB::transaction(function () use (
                $payment,
                $paypalData,
                $captureId
            ) {
                $payment->update([
                    'status' => Payment::STATUS_PAID,
                    'gateway_capture_id' => $captureId,
                    'gateway_reference' =>
                        $captureId
                        ?: $payment->gateway_order_id,
                    'confirmed_at' => now(),
                    'gateway_response' => $paypalData,
                    'confirmation_note' =>
                        'Payment captured through PayPal Sandbox.',
                ]);

                PaymentTransaction::create([
                    'payment_id' => $payment->id,
                    'type' => 'CAPTURE',
                    'status' => 'COMPLETED',
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'gateway' => 'PAYPAL',
                    'gateway_reference' => $captureId,
                    'gateway_response' => $paypalData,
                    'notes' => 'PayPal capture completed.',
                ]);

                PaymentTransaction::create([
                    'payment_id' => $payment->id,
                    'type' => 'CONFIRMATION',
                    'status' => 'CONFIRMED',
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'gateway' => 'PAYPAL',
                    'gateway_reference' => $captureId,
                    'notes' => 'Payment confirmed.',
                ]);
            });

            return response()->json([
                'message' =>
                    'Payment completed successfully.',
                'payment' => $payment->fresh([
                    'booking',
                    'transactions',
                    'refunds',
                ]),
                'paypal' => $paypalData,
            ]);
        } catch (Throwable $e) {
            $payment->update([
                'status' => Payment::STATUS_FAILED,
                'failed_at' => now(),
                'failure_reason' => $e->getMessage(),
            ]);

            return response()->json([
                'message' =>
                    'Unable to capture PayPal payment.',
            ], 500);
        }
    }

    /**
     * Record cash/manual payment.
     */
    public function confirmManualPayment(
        Request $request,
        Payment $payment
    ): JsonResponse {
        $validated = $request->validate([
            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $this->authorizePayment($request, $payment);

        if ($payment->status !== Payment::STATUS_PENDING) {
            return response()->json([
                'message' => 'Payment is not pending.',
            ], 422);
        }

        DB::transaction(function () use (
            $payment,
            $validated
        ) {
            $payment->update([
                'status' => Payment::STATUS_PAID,
                'confirmed_at' => now(),
                'confirmation_note' =>
                    $validated['notes'] ?? 'Manual payment confirmed.',
            ]);

            PaymentTransaction::create([
                'payment_id' => $payment->id,
                'type' => 'CONFIRMATION',
                'status' => 'COMPLETED',
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'gateway' => null,
                'notes' =>
                    $validated['notes']
                    ?? 'Manual payment confirmed.',
            ]);
        });

        return response()->json([
            'message' =>
                'Manual payment confirmed.',
            'payment' => $payment->fresh([
                'booking',
                'transactions',
                'refunds',
            ]),
        ]);
    }

    /**
     * Full or partial refund.
     */
    public function refund(
        RefundPaymentRequest $request,
        Payment $payment
    ): JsonResponse {
        $this->authorizePayment($request, $payment);

        if (!in_array(
            $payment->status,
            [
                Payment::STATUS_PAID,
                Payment::STATUS_PARTIALLY_REFUNDED,
            ],
            true
        )) {
            return response()->json([
                'message' =>
                    'Only paid payments can be refunded.',
            ], 422);
        }

        $amount = round(
            (float) $request->input('amount'),
            2
        );

        $remaining = round(
            (float) $payment->amount
            - (float) $payment->refunded_amount,
            2
        );

        if ($amount > $remaining) {
            return response()->json([
                'message' =>
                    'Refund amount exceeds the remaining refundable amount.',
                'remaining_refundable_amount' => $remaining,
            ], 422);
        }

        try {
            if (
                $payment->gateway === 'PAYPAL'
                && $payment->gateway_capture_id
            ) {
                return $this->paypalRefund(
                    $request,
                    $payment,
                    $amount,
                    $remaining
                );
            }

            return $this->manualRefund(
                $request,
                $payment,
                $amount,
                $remaining
            );
        } catch (Throwable $e) {
            return response()->json([
                'message' =>
                    'Refund processing failed.',
            ], 500);
        }
    }

    /**
     * Reconcile a PayPal payment against PayPal.
     */
    public function reconcile(
        ReconcilePaymentRequest $request
    ): JsonResponse {
        $payment = Payment::findOrFail(
            $request->integer('payment_id')
        );

        $this->authorizePayment($request, $payment);

        if (
            $payment->gateway !== 'PAYPAL'
            || !$payment->gateway_order_id
        ) {
            return response()->json([
                'message' =>
                    'This payment is not a PayPal payment.',
            ], 422);
        }

        try {
            $accessToken = $this->paypalAccessToken();

            $response = Http::withToken($accessToken)
                ->acceptJson()
                ->get(
                    config('services.paypal.base_url')
                    . '/v2/checkout/orders/'
                    . $payment->gateway_order_id
                );

            $data = $response->json();

            if ($response->failed()) {
                return response()->json([
                    'message' =>
                        'Unable to retrieve PayPal order.',
                    'paypal' => $data,
                ], 422);
            }

            PaymentTransaction::create([
                'payment_id' => $payment->id,
                'type' => 'RECONCILIATION',
                'status' => 'COMPLETED',
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'gateway' => 'PAYPAL',
                'gateway_reference' =>
                    $payment->gateway_order_id,
                'gateway_response' => $data,
                'notes' =>
                    'Payment reconciled against PayPal.',
            ]);

            return response()->json([
                'message' =>
                    'Payment reconciliation completed.',
                'payment' => $payment->fresh([
                    'transactions',
                    'refunds',
                ]),
                'paypal' => $data,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'message' =>
                    'Payment reconciliation failed.',
            ], 500);
        }
    }

    private function paypalRefund(
        Request $request,
        Payment $payment,
        float $amount,
        float $remaining
    ): JsonResponse {
        $accessToken = $this->paypalAccessToken();

        $response = Http::withToken($accessToken)
            ->acceptJson()
            ->contentType('application/json')
            ->withHeaders([
                'PayPal-Request-Id' =>
                    (string) Str::uuid(),
                'Prefer' =>
                    'return=representation',
            ])
            ->post(
                config('services.paypal.base_url')
                . '/v2/payments/captures/'
                . $payment->gateway_capture_id
                . '/refund',
                [
                    'amount' => [
                        'value' =>
                            number_format(
                                $amount,
                                2,
                                '.',
                                ''
                            ),
                        'currency_code' =>
                            $payment->currency,
                    ],

                    'invoice_id' =>
                        $payment->payment_reference,

                    'note_to_payer' =>
                        $request->input(
                            'reason',
                            'Court booking refund'
                        ),
                ]
            );

        $data = $response->json();

        if ($response->failed()) {
            return response()->json([
                'message' =>
                    'PayPal refund failed.',
                'paypal' => $data,
            ], 422);
        }

        $refundStatus =
            $data['status'] ?? 'PENDING';

        $refundReference =
            'REF-' . strtoupper(Str::random(12));

        DB::transaction(function () use (
            $payment,
            $request,
            $amount,
            $data,
            $refundStatus,
            $refundReference,
            $remaining
        ) {
            PaymentRefund::create([
                'payment_id' => $payment->id,
                'user_id' => $request->user()?->id,
                'refund_reference' =>
                    $refundReference,
                'gateway_reference' =>
                    $data['id'] ?? null,
                'amount' => $amount,
                'currency' => $payment->currency,
                'status' => $refundStatus,
                'reason' =>
                    $request->input('reason'),
                'notes' =>
                    $request->input('notes'),
                'processed_at' =>
                    $refundStatus === 'COMPLETED'
                        ? now()
                        : null,
                'gateway_response' => $data,
            ]);

            if ($refundStatus === 'COMPLETED') {
                $newRefunded =
                    round(
                        (float) $payment->refunded_amount
                        + $amount,
                        2
                    );

                $newRemaining =
                    round(
                        (float) $payment->amount
                        - $newRefunded,
                        2
                    );

                $payment->update([
                    'refunded_amount' =>
                        $newRefunded,

                    'remaining_amount' =>
                        $newRemaining,

                    'status' =>
                        $newRemaining <= 0
                            ? Payment::STATUS_REFUNDED
                            : Payment::STATUS_PARTIALLY_REFUNDED,

                    'refunded_at' => now(),
                ]);

                PaymentTransaction::create([
                    'payment_id' => $payment->id,
                    'type' => 'REFUND',
                    'status' => 'COMPLETED',
                    'amount' => $amount,
                    'currency' => $payment->currency,
                    'gateway' => 'PAYPAL',
                    'gateway_reference' =>
                        $data['id'] ?? null,
                    'gateway_response' => $data,
                    'notes' =>
                        'PayPal refund completed.',
                ]);
            }
        });

        return response()->json([
            'message' =>
                'PayPal refund processed.',
            'payment' => $payment->fresh([
                'transactions',
                'refunds',
            ]),
            'refund' => $data,
        ]);
    }

    private function manualRefund(
        Request $request,
        Payment $payment,
        float $amount,
        float $remaining
    ): JsonResponse {
        DB::transaction(function () use (
            $request,
            $payment,
            $amount,
            $remaining
        ) {
            PaymentRefund::create([
                'payment_id' => $payment->id,
                'user_id' => $request->user()?->id,
                'amount' => $amount,
                'currency' => $payment->currency,
                'status' => 'COMPLETED',
                'reason' => $request->input('reason'),
                'notes' => $request->input('notes'),
                'processed_at' => now(),
            ]);

            $newRefunded =
                round(
                    (float) $payment->refunded_amount
                    + $amount,
                    2
                );

            $newRemaining =
                round(
                    (float) $payment->amount
                    - $newRefunded,
                    2
                );

            $payment->update([
                'refunded_amount' => $newRefunded,
                'remaining_amount' => $newRemaining,
                'status' =>
                    $newRemaining <= 0
                        ? Payment::STATUS_REFUNDED
                        : Payment::STATUS_PARTIALLY_REFUNDED,
                'refunded_at' => now(),
            ]);

            PaymentTransaction::create([
                'payment_id' => $payment->id,
                'type' => 'REFUND',
                'status' => 'COMPLETED',
                'amount' => $amount,
                'currency' => $payment->currency,
                'notes' => 'Manual refund processed.',
            ]);
        });

        return response()->json([
            'message' => 'Manual refund processed.',
            'payment' => $payment->fresh([
                'transactions',
                'refunds',
            ]),
        ]);
    }

    private function paypalAccessToken(): string
    {
        $response = Http::asForm()
            ->withBasicAuth(
                config('services.paypal.client_id'),
                config('services.paypal.client_secret')
            )
            ->post(
                config('services.paypal.base_url')
                . '/v1/oauth2/token',
                [
                    'grant_type' =>
                        'client_credentials',
                ]
            );

        $response->throw();

        return $response->json('access_token');
    }

    private function authorizeBooking(
        Request $request,
        Booking $booking
    ): void {
        $user = $request->user();

        if (
            $user
            && (
                $user->is_admin
                || $booking->user_id === $user->id
            )
        ) {
            return;
        }

        abort(403, 'Unauthorized booking payment.');
    }

    private function authorizePayment(
        Request $request,
        Payment $payment
    ): void {
        $user = $request->user();

        /*
        * Administrator
        */
        if ($user && $user->is_admin) {
            return;
        }

        /*
        * Authenticated payment owner
        */
        if (
            $user &&
            $payment->user_id === $user->id
        ) {
            return;
        }

        /*
        * Public booking/payment.
        *
        * The payment belongs to a booking that has
        * customer information.
        */
        if (
            !$user &&
            $payment->booking
        ) {
            return;
        }

        abort(
            403,
            'Unauthorized payment action.'
        );
    }
}