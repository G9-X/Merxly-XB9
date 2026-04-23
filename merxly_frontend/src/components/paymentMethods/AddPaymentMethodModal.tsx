import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createSetupIntent } from '../../services/paymentMethodService';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(null);

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentMethodId: string) => Promise<void>;
}

const PaymentMethodForm = ({
  onSuccess,
  onClose,
}: {
  onSuccess: (paymentMethodId: string) => Promise<void>;
  onClose: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Validate and submit the form
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Validation failed');
        setIsProcessing(false);
        return;
      }

      // Confirm the setup intent
      const { error: stripeError, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'An error occurred');
        setIsProcessing(false);
        return;
      }

      if (setupIntent && setupIntent.payment_method) {
        // Pass the setup intent ID to backend (it will extract payment method)
        await onSuccess(setupIntent.id);
        // Success - modal will be closed by parent component
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4 md:space-y-6'>
      <div>
        <label className='block text-xs md:text-sm font-medium text-neutral-700 mb-2'>
          Payment Information
        </label>
        <div className='border border-neutral-300 rounded-lg p-3 md:p-4 bg-white'>
          <PaymentElement />
        </div>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-2 md:p-3'>
          <p className='text-xs md:text-sm text-red-600'>{error}</p>
        </div>
      )}

      <div className='flex flex-col-reverse sm:flex-row items-center justify-end gap-2 md:gap-3 pt-3 md:pt-4 border-t border-neutral-200'>
        <button
          type='button'
          onClick={onClose}
          className='cursor-pointer w-full sm:w-auto px-4 md:px-6 py-2 text-sm md:text-base border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={!stripe || isProcessing}
          className='cursor-pointer w-full sm:w-auto px-4 md:px-6 py-2 text-sm md:text-base bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isProcessing ? 'Processing...' : 'Add Payment Method'}
        </button>
      </div>
    </form>
  );
};

export const AddPaymentMethodModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddPaymentMethodModalProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch setup intent when modal opens
      const fetchSetupIntent = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await createSetupIntent();
          setClientSecret(response.data);
        } catch (err) {
          setError('Failed to initialize payment form. Please try again.');
          console.error('Failed to create setup intent:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSetupIntent();
    } else {
      // Reset state when modal closes
      setClientSecret(null);
      setError(null);
    }
  }, [isOpen]);

  const handleSuccess = async (setupIntentId: string) => {
    await onSuccess(setupIntentId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className='fixed inset-0 z-50 bg-black/50 transition-opacity'
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className='fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 pointer-events-none'>
        <div
          className='bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col pointer-events-auto'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-neutral-200'>
            <h2 className='text-base md:text-lg font-semibold text-neutral-900'>
              Add Payment Method
            </h2>
            <button
              type='button'
              onClick={onClose}
              className='cursor-pointer p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors'
            >
              <XMarkIcon className='w-5 h-5' />
            </button>
          </div>

          {/* Body */}
          <div className='px-4 md:px-6 py-3 md:py-4 overflow-y-auto flex-1 modal-scrollbar-hide'>
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-2 md:p-3 mb-3 md:mb-4'>
                <p className='text-xs md:text-sm text-red-600'>{error}</p>
              </div>
            )}
            {isLoading && (
              <div className='flex items-center justify-center py-6 md:py-8'>
                <div className='text-xs md:text-sm text-neutral-500'>
                  Loading...
                </div>
              </div>
            )}
            {clientSecret && !isLoading && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                  },
                }}
              >
                <PaymentMethodForm
                  onSuccess={handleSuccess}
                  onClose={onClose}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
