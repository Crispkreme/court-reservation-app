<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOutstandingPaymentRequest;
use App\Http\Requests\UpdateOutstandingPaymentRequest;
use App\Models\OutstandingPayment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OutstandingPaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = OutstandingPayment::query()
            ->with([
                'transaction',
                'booking',
                'user',
            ])
            ->latest('due_date');

        $this->applyFilters($query, $request);

        $perPage = min(
            max((int) $request->input('per_page', 15), 1),
            100
        );

        $payments = $query->paginate($perPage);

        return response()->json([
            'data' => $payments->items(),
            'current_page' => $payments->currentPage(),
            'last_page' => $payments->lastPage(),
            'per_page' => $payments->perPage(),
            'total' => $payments->total(),
            'summary' => $this->buildSummary($request),
        ]);
    }

    public function store(
        StoreOutstandingPaymentRequest $request
    ): JsonResponse {
        $data = $request->validated();

        $data['paid_amount'] = $data['paid_amount'] ?? 0;

        $data['outstanding_amount'] =
            $data['outstanding_amount']
            ?? max(
                (float) $data['original_amount']
                    - (float) $data['paid_amount'],
                0
            );

        if ((float) $data['outstanding_amount'] <= 0) {
            $data['status'] = 'paid';
            $data['resolved_at'] ??= now();
        } elseif ((float) $data['paid_amount'] > 0) {
            $data['status'] = 'partially_paid';
        }

        $payment = OutstandingPayment::create($data);

        return response()->json([
            'message' => 'Outstanding payment created successfully.',
            'data' => $payment->load([
                'transaction',
                'booking',
                'user',
            ]),
        ], 201);
    }

    public function show(
        OutstandingPayment $outstandingPayment
    ): JsonResponse {
        return response()->json(
            $outstandingPayment->load([
                'transaction',
                'booking',
                'user',
            ])
        );
    }

    public function update(
        UpdateOutstandingPaymentRequest $request,
        OutstandingPayment $outstandingPayment
    ): JsonResponse {
        $data = $request->validated();

        $data['paid_amount'] = $data['paid_amount'] ?? 0;

        $data['outstanding_amount'] =
            $data['outstanding_amount']
            ?? max(
                (float) $data['original_amount']
                    - (float) $data['paid_amount'],
                0
            );

        if ((float) $data['outstanding_amount'] <= 0) {
            $data['status'] = 'paid';
            $data['resolved_at'] ??= now();
        } elseif ((float) $data['paid_amount'] > 0) {
            $data['status'] = 'partially_paid';
            $data['resolved_at'] = null;
        }

        $outstandingPayment->update($data);

        return response()->json([
            'message' => 'Outstanding payment updated successfully.',
            'data' => $outstandingPayment->fresh()->load([
                'transaction',
                'booking',
                'user',
            ]),
        ]);
    }

    public function destroy(
        OutstandingPayment $outstandingPayment
    ): JsonResponse {
        $outstandingPayment->delete();

        return response()->json([
            'message' => 'Outstanding payment deleted successfully.',
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        return response()->json(
            $this->buildSummary($request)
        );
    }

    public function followUp(
        Request $request,
        OutstandingPayment $outstandingPayment
    ): JsonResponse {
        $validated = $request->validate([
            'follow_up_status' => [
                'required',
                'in:pending,contacted,promised,escalated,resolved',
            ],

            'next_follow_up_at' => [
                'nullable',
                'date',
            ],

            'follow_up_notes' => [
                'nullable',
                'string',
            ],
        ]);

        $outstandingPayment->update([
            'follow_up_status' => $validated['follow_up_status'],
            'last_follow_up_at' => now(),
            'next_follow_up_at' =>
                $validated['next_follow_up_at'] ?? null,
            'follow_up_notes' =>
                $validated['follow_up_notes'] ?? null,
            'resolved_at' =>
                $validated['follow_up_status'] === 'resolved'
                    ? now()
                    : $outstandingPayment->resolved_at,
        ]);

        return response()->json([
            'message' => 'Follow-up information updated successfully.',
            'data' => $outstandingPayment->fresh()->load([
                'transaction',
                'booking',
                'user',
            ]),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = OutstandingPayment::query()
            ->with([
                'transaction',
                'booking',
                'user',
            ])
            ->latest('due_date');

        $this->applyFilters($query, $request);

        $filename =
            'outstanding-payments-' .
            now()->format('Y-m-d-His') .
            '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'ID',
                'Transaction',
                'Booking',
                'Customer',
                'Due Date',
                'Original Amount',
                'Paid Amount',
                'Outstanding Amount',
                'Status',
                'Aging Days',
                'Aging Bucket',
                'Follow-up Status',
                'Last Follow-up',
                'Next Follow-up',
                'Notes',
            ]);

            $query->chunkById(500, function ($payments) use ($handle) {
                foreach ($payments as $payment) {
                    fputcsv($handle, [
                        $payment->id,
                        $payment->transaction_id,
                        $payment->booking_id,
                        $payment->user?->name
                            ?? $payment->user?->email
                            ?? '',
                        optional($payment->due_date)->format('Y-m-d'),
                        number_format(
                            (float) $payment->original_amount,
                            2,
                            '.',
                            ''
                        ),
                        number_format(
                            (float) $payment->paid_amount,
                            2,
                            '.',
                            ''
                        ),
                        number_format(
                            (float) $payment->outstanding_amount,
                            2,
                            '.',
                            ''
                        ),
                        $payment->status,
                        $payment->aging_days,
                        $payment->aging_bucket,
                        $payment->follow_up_status,
                        optional($payment->last_follow_up_at)
                            ?->format('Y-m-d H:i:s'),
                        optional($payment->next_follow_up_at)
                            ?->format('Y-m-d H:i:s'),
                        $payment->follow_up_notes,
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function applyFilters(
        $query,
        Request $request
    ): void {
        if ($request->filled('user_id')) {
            $query->where(
                'user_id',
                $request->integer('user_id')
            );
        }

        if ($request->filled('booking_id')) {
            $query->where(
                'booking_id',
                $request->integer('booking_id')
            );
        }

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->input('status')
            );
        }

        if ($request->filled('follow_up_status')) {
            $query->where(
                'follow_up_status',
                $request->input('follow_up_status')
            );
        }

        if ($request->filled('date_from')) {
            $query->whereDate(
                'due_date',
                '>=',
                $request->input('date_from')
            );
        }

        if ($request->filled('date_to')) {
            $query->whereDate(
                'due_date',
                '<=',
                $request->input('date_to')
            );
        }

        if ($request->filled('aging_bucket')) {
            $bucket = $request->input('aging_bucket');

            $today = Carbon::today();

            match ($bucket) {
                '0-7' => $query
                    ->whereDate(
                        'due_date',
                        '>=',
                        $today->copy()->subDays(7)
                    )
                    ->whereDate(
                        'due_date',
                        '<=',
                        $today
                    ),

                '8-30' => $query
                    ->whereDate(
                        'due_date',
                        '>=',
                        $today->copy()->subDays(30)
                    )
                    ->whereDate(
                        'due_date',
                        '<=',
                        $today->copy()->subDays(8)
                    ),

                '31-60' => $query
                    ->whereDate(
                        'due_date',
                        '>=',
                        $today->copy()->subDays(60)
                    )
                    ->whereDate(
                        'due_date',
                        '<=',
                        $today->copy()->subDays(31)
                    ),

                '61-90' => $query
                    ->whereDate(
                        'due_date',
                        '>=',
                        $today->copy()->subDays(90)
                    )
                    ->whereDate(
                        'due_date',
                        '<=',
                        $today->copy()->subDays(61)
                    ),

                '90+' => $query->whereDate(
                    'due_date',
                    '<',
                    $today->copy()->subDays(90)
                ),

                default => null,
            };
        }
    }

    private function buildSummary(Request $request): array
    {
        $query = OutstandingPayment::query()
            ->outstanding();

        $this->applyFilters($query, $request);

        $payments = $query->get();

        $today = Carbon::today();

        $bucketAmounts = [
            '0-7' => 0,
            '8-30' => 0,
            '31-60' => 0,
            '61-90' => 0,
            '90+' => 0,
        ];

        $bucketCounts = [
            '0-7' => 0,
            '8-30' => 0,
            '31-60' => 0,
            '61-90' => 0,
            '90+' => 0,
        ];

        foreach ($payments as $payment) {
            $days = 0;

            if ($payment->due_date) {
                $dueDate = Carbon::parse($payment->due_date);

                if ($dueDate->lt($today)) {
                    $days = $dueDate->diffInDays($today);
                }
            }

            $bucket = match (true) {
                $days <= 7 => '0-7',
                $days <= 30 => '8-30',
                $days <= 60 => '31-60',
                $days <= 90 => '61-90',
                default => '90+',
            };

            $amount = (float) $payment->outstanding_amount;

            $bucketAmounts[$bucket] += $amount;
            $bucketCounts[$bucket]++;
        }

        return [
            'total_records' => $payments->count(),

            'total_original' => round(
                (float) $payments->sum('original_amount'),
                2
            ),

            'total_paid' => round(
                (float) $payments->sum('paid_amount'),
                2
            ),

            'total_outstanding' => round(
                (float) $payments->sum('outstanding_amount'),
                2
            ),

            'buckets' => [
                '0-7' => [
                    'count' => $bucketCounts['0-7'],
                    'amount' => round($bucketAmounts['0-7'], 2),
                ],

                '8-30' => [
                    'count' => $bucketCounts['8-30'],
                    'amount' => round($bucketAmounts['8-30'], 2),
                ],

                '31-60' => [
                    'count' => $bucketCounts['31-60'],
                    'amount' => round($bucketAmounts['31-60'], 2),
                ],

                '61-90' => [
                    'count' => $bucketCounts['61-90'],
                    'amount' => round($bucketAmounts['61-90'], 2),
                ],

                '90+' => [
                    'count' => $bucketCounts['90+'],
                    'amount' => round($bucketAmounts['90+'], 2),
                ],
            ],
        ];
    }
}