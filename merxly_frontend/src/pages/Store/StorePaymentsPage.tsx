import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import { PaymentStats } from '../../components/store/payments/PaymentStats';
import { StripeAccountCard } from '../../components/store/payments/StripeAccountCard';
import { TransactionsList } from '../../components/store/payments/TransactionsList';
import { useStoreStripeConnect } from '../../hooks/useStoreStripeConnect';
import { useStoreTransactions } from '../../hooks/useStoreTransactions';
import { StoreTransferStatus } from '../../types/enums';

export const StorePaymentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const {
    account,
    accountStatus,
    isLoading,
    connectStripe,
    continueOnboarding,
    refreshStatus,
    disconnect,
    isConnecting,
    isContinuingOnboarding,
    isRefreshing,
    isDisconnecting,
  } = useStoreStripeConnect();

  // Fetch transactions with pagination
  const { data: transactionsResponse, isLoading: isLoadingTransactions } =
    useStoreTransactions({ pageNumber, pageSize });

  const transactions = useMemo(
    () => transactionsResponse?.data?.items ?? [],
    [transactionsResponse?.data?.items]
  );

  // Calculate stats from transactions
  const stats = useMemo(() => {
    const completedTransactions = transactions.filter(
      (t) => t.status === StoreTransferStatus.Completed
    );
    const pendingTransactions = transactions.filter(
      (t) =>
        t.status === StoreTransferStatus.Pending ||
        t.status === StoreTransferStatus.Processing
    );

    const totalEarnings = completedTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const pendingPayout = pendingTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const commissionPaid = transactions.reduce(
      (sum, t) => sum + t.commission,
      0
    );
    const availableBalance = completedTransactions
      .filter((t) => t.transferredAt)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalEarnings,
      pendingPayout,
      commissionPaid,
      availableBalance,
    };
  }, [transactions]);

  // Handle return from Stripe onboarding
  useEffect(() => {
    const onboardingStatus = searchParams.get('onboarding');
    if (onboardingStatus === 'success' || onboardingStatus === 'refresh') {
      // Refresh account status after returning from Stripe
      refreshStatus();
      // Clean up URL params
      setSearchParams({});
    }
  }, [searchParams, refreshStatus, setSearchParams]);

  const handleConnect = async (
    email: string,
    country: string,
    businessType: string
  ) => {
    try {
      const result = await connectStripe({ email, country, businessType });
      if (result.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = result.onboardingUrl;
      }
    } catch (error) {
      console.error('Failed to connect Stripe:', error);
    }
  };

  const handleContinueOnboarding = async () => {
    try {
      const url = await continueOnboarding();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to continue onboarding:', error);
    }
  };

  const handleRefreshStatus = async () => {
    try {
      await refreshStatus();
    } catch (error) {
      console.error('Failed to refresh status:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };
  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex items-center gap-3'>
        <div className='p-2 bg-primary-50 rounded-lg'>
          <BanknotesIcon className='h-6 w-6 text-primary-600' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Payments</h1>
          <p className='text-sm text-neutral-600'>
            Manage earnings, payouts, and payment settings
          </p>
        </div>
      </div>

      {/* Payment Stats */}
      <PaymentStats
        totalEarnings={stats.totalEarnings}
        pendingPayout={stats.pendingPayout}
        commissionPaid={stats.commissionPaid}
        availableBalance={stats.availableBalance}
        isLoading={isLoadingTransactions}
      />

      {/* Stripe Account Card */}
      <StripeAccountCard
        isConnected={!!account?.stripeConnectAccountId}
        accountId={account?.stripeConnectAccountId || undefined}
        email={undefined}
        commissionRate={account?.commissionRate || 0}
        accountStatus={
          accountStatus?.status || account?.stripeAccountStatus || null
        }
        isLoading={isLoading}
        onConnect={handleConnect}
        onContinueOnboarding={handleContinueOnboarding}
        onRefreshStatus={handleRefreshStatus}
        onDisconnect={handleDisconnect}
        isConnecting={isConnecting}
        isContinuingOnboarding={isContinuingOnboarding}
        isRefreshing={isRefreshing}
        isDisconnecting={isDisconnecting}
      />

      {/* Transactions List */}
      <TransactionsList
        transactions={transactions}
        isLoading={isLoadingTransactions}
      />

      {/* Pagination */}
      {!isLoadingTransactions && transactionsResponse?.data && (
        <div className='flex items-center justify-between text-sm text-neutral-600'>
          <span>
            Showing {transactions.length} of{' '}
            {transactionsResponse.data.totalCount} transactions
          </span>
          <div className='flex items-center gap-2'>
            <span>
              Page {transactionsResponse.data.pageNumber} of{' '}
              {transactionsResponse.data.totalPages}
            </span>
            <div className='flex gap-2'>
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={transactionsResponse.data.pageNumber === 1}
                className='cursor-pointer px-3 py-1 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50'
              >
                Previous
              </button>
              <button
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={
                  transactionsResponse.data.pageNumber >=
                  transactionsResponse.data.totalPages
                }
                className='cursor-pointer px-3 py-1 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50'
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
