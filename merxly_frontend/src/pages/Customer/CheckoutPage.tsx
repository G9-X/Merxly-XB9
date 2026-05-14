import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import {
  ShippingSection,
  PaymentSection,
  OrderSummary,
} from '../../components/checkout';
import { useAddresses } from '../../hooks/useAddresses';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { useCheckout } from '../../hooks/useCheckout';
import { useCart } from '../../hooks/useCart';
import type { CartItemDto } from '../../types/models/cart';
import type { CustomerAddressDto } from '../../types/models/address';
import type { PaymentMethodDto } from '../../types/models/paymentMethod';
import { toast } from 'react-toastify';

export const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const { addresses, isLoading: isLoadingAddresses } = useAddresses();
  const { paymentMethods, isLoading: isLoadingPaymentMethods } =
    usePaymentMethods();
  const { processCheckout, isProcessing } = useCheckout();
  const { removeCartItem } = useCart();

  // Get selected items from navigation state
  const selectedItems = (location.state?.selectedItems as CartItemDto[]) || [];

  // State
  const [selectedAddress, setSelectedAddress] =
    useState<CustomerAddressDto | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodDto | null>(null);
  const [storeNotes, setStoreNotes] = useState<Record<string, string>>({});
  const [pendingClientSecret, setPendingClientSecret] = useState<string | null>(
    null,
  );
  const [pendingOrder, setPendingOrder] = useState<unknown>(null);

  // Redirect if no items
  useEffect(() => {
    if (selectedItems.length === 0) {
      navigate('/cart');
    }
  }, [selectedItems, navigate]);

  // Set default address and payment method
  useEffect(() => {
    if (!isLoadingAddresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddress(defaultAddress);
    }
  }, [addresses, isLoadingAddresses, selectedAddress]);

  useEffect(() => {
    if (
      !isLoadingPaymentMethods &&
      paymentMethods.length > 0 &&
      !selectedPaymentMethod
    ) {
      const defaultPayment =
        paymentMethods.find((p) => p.isDefault) || paymentMethods[0];
      setSelectedPaymentMethod(defaultPayment);
    }
  }, [paymentMethods, isLoadingPaymentMethods, selectedPaymentMethod]);

  const handleStoreNoteChange = (storeId: string, note: string) => {
    setStoreNotes((prev) => ({
      ...prev,
      [storeId]: note,
    }));
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPaymentMethod || !stripe) {
      toast.error('Please select a shipping address and payment method.');
      return;
    }

    try {
      let clientSecret = pendingClientSecret;
      let order = pendingOrder;

      if (!clientSecret) {
        const checkoutRequest = {
          items: selectedItems.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
          })),
          shippingAddressId: selectedAddress.id,
          paymentMethodId: selectedPaymentMethod.id,
          storeNotes: Object.keys(storeNotes).length > 0 ? storeNotes : null,
        };

        const response = await processCheckout(checkoutRequest);

        if (!response.data) {
          toast.error('Checkout failed. Please try again.');
          return;
        }

        clientSecret = response.data.clientSecret;
        order = response.data.order;
        setPendingClientSecret(clientSecret);
        setPendingOrder(order);
      }

      // Confirm payment with Stripe (reuses existing PaymentIntent on retry)
      const { error } = await stripe.confirmCardPayment(clientSecret);

      if (error) {
        toast.error(`Payment failed: ${error.message}`);
        return;
      }

      // Payment succeeded — clear pending state
      setPendingClientSecret(null);
      setPendingOrder(null);

      // Remove only the checked out items from cart (skip items from Buy Now with empty IDs)
      const cartItemsToRemove = selectedItems.filter((item) => item.id);
      if (cartItemsToRemove.length > 0) {
        await Promise.all(
          cartItemsToRemove.map((item) => removeCartItem(item.id)),
        );
      }

      // Navigate to order confirmation
      navigate('/order-confirmation', {
        state: { order },
        replace: true,
      });
    } catch (error) {
      toast.error(
        `Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  if (isLoadingAddresses || isLoadingPaymentMethods) {
    return (
      <div className='px-4 md:px-8 lg:px-20 py-6 md:py-12'>
        <div className='flex items-center justify-center py-20'>
          <p className='text-neutral-500'>Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='px-4 md:px-8 lg:px-20 py-6 md:py-12'>
      <h1 className='text-xl md:text-2xl font-bold text-neutral-900 mb-6 md:mb-8'>
        Checkout
      </h1>

      <div
        className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isProcessing ? 'blur-sm pointer-events-none' : ''}`}
      >
        {/* Left: Shipping & Payment */}
        <div className='lg:col-span-2 space-y-6'>
          <ShippingSection
            selectedAddress={selectedAddress}
            onSelectAddress={setSelectedAddress}
          />

          <PaymentSection
            selectedPaymentMethod={selectedPaymentMethod}
            onSelectPaymentMethod={setSelectedPaymentMethod}
          />
        </div>

        {/* Right: Order Summary */}
        <div className='lg:col-span-1'>
          <OrderSummary
            items={selectedItems}
            storeNotes={storeNotes}
            onStoreNoteChange={handleStoreNoteChange}
            onPlaceOrder={handlePlaceOrder}
            isPlacingOrder={isProcessing}
          />
        </div>
      </div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='flex flex-col items-center gap-4'>
            <ArrowPathIcon className='h-12 w-12 text-primary-600 animate-spin' />
            <p className='text-lg font-medium text-neutral-900'>
              Processing your order...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
