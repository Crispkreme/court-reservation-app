<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    /**
     * Display transaction history.
     *
     * Customers only see their own transactions.
     * Administrators can see all transactions.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Transaction::query()
            ->with([
                'booking',
                'user:id,name,email',
            ])
            ->latest('transaction_date')
            ->latest('id');

        /*
         * Customer:
         * only show their own transactions.
         */
        if (!$user->is_admin) {
            $query->where('user_id', $user->id);
        }

        /*
         * Administrator filters.
         */
        if ($user->is_admin) {
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->integer('user_id'));
            }

            if ($request->filled('booking_id')) {
                $query->where(
                    'booking_id',
                    $request->integer('booking_id')
                );
            }

            if ($request->filled('payment_status')) {
                $query->where(
                    'payment_status',
                    $request->string('payment_status')
                );
            }

            if ($request->filled('refund_status')) {
                $query->where(
                    'refund_status',
                    $request->string('refund_status')
                );
            }

            if ($request->filled('payment_method')) {
                $query->where(
                    'payment_method',
                    $request->string('payment_method')
                );
            }

            if ($request->filled('from_date')) {
                $query->whereDate(
                    'transaction_date',
                    '>=',
                    $request->date('from_date')
                );
            }

            if ($request->filled('to_date')) {
                $query->whereDate(
                    'transaction_date',
                    '<=',
                    $request->date('to_date')
                );
            }
        }

        if ($request->filled('search')) {
            $search = $request->string('search');

            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                    ->orWhere('gateway_reference', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = min(
            max((int) $request->input('per_page', 15), 1),
            100
        );

        $transactions = $query->paginate($perPage);

        return response()->json($transactions);
    }

    /**
     * Show a single transaction.
     */
    public function show(
        Request $request,
        Transaction $transaction
    ): JsonResponse {
        $user = $request->user();

        if (!$user->is_admin && $transaction->user_id !== $user->id) {
            return response()->json([
                'message' => 'You are not authorized to view this transaction.',
            ], 403);
        }

        $transaction->load([
            'booking',
            'user:id,name,email',
        ]);

        return response()->json($transaction);
    }

    /**
     * Create a transaction.
     *
     * Restricted to administrators.
     */
    public function store(
        StoreTransactionRequest $request
    ): JsonResponse {
        $data = $request->validated();

        $data['transaction_id'] ??= 'TXN-' . strtoupper(
            Str::random(12)
        );

        $data['currency'] ??= 'PHP';

        $data['refund_amount'] ??= 0;

        $data['refund_status'] ??= 'none';

        $data['transaction_date'] ??= now();

        /*
         * Automatically determine refund status
         * when a refund amount is supplied.
         */
        if ((float) $data['refund_amount'] > 0) {
            if (
                (float) $data['refund_amount']
                >= (float) $data['amount']
            ) {
                $data['refund_status'] = 'processed';
                $data['payment_status'] = 'refunded';
            } else {
                $data['refund_status'] = 'processed';
                $data['payment_status'] = 'partially_refunded';
            }

            $data['refunded_at'] ??= now();
        }

        $transaction = Transaction::create($data);

        $transaction->load([
            'booking',
            'user:id,name,email',
        ]);

        return response()->json([
            'message' => 'Transaction created successfully.',
            'transaction' => $transaction,
        ], 201);
    }

    /**
     * Update a transaction.
     *
     * Restricted to administrators.
     */
    public function update(
        StoreTransactionRequest $request,
        Transaction $transaction
    ): JsonResponse {
        $data = $request->validated();

        unset($data['transaction_id']);

        $transaction->update($data);

        $transaction->refresh();

        $transaction->load([
            'booking',
            'user:id,name,email',
        ]);

        return response()->json([
            'message' => 'Transaction updated successfully.',
            'transaction' => $transaction,
        ]);
    }

    /**
     * Delete a transaction.
     *
     * Restricted to administrators.
     */
    public function destroy(
        Request $request,
        Transaction $transaction
    ): JsonResponse {
        abort_unless(
            $request->user()->is_admin,
            403,
            'Only administrators can delete transactions.'
        );

        $transaction->delete();

        return response()->json([
            'message' => 'Transaction deleted successfully.',
        ]);
    }
}