import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { CartTotals, StoreCartSection } from '../../components/cart';
import { Modal } from '../../components/ui/Modal';
import type { StoreCartGroup } from '../../types/models/cart';

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, isLoading, updateCartItem, removeCartItem, clearCart } =
    useCart();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showClearModal, setShowClearModal] = useState(false);

  // Default select all items when cart loads
  useEffect(() => {
    if (
      cart?.cartItems &&
      cart.cartItems.length > 0 &&
      selectedItems.size === 0
    ) {
      // Only select available items
      const availableItemIds = cart.cartItems
        .filter((item) => item.isAvailable)
        .map((item) => item.id);
      setSelectedItems(new Set(availableItemIds));
    }
  }, [cart?.cartItems]);

  // Auto-deselect items that become unavailable
  useEffect(() => {
    if (cart?.cartItems) {
      const unavailableItemIds = cart.cartItems
        .filter((item) => !item.isAvailable && selectedItems.has(item.id))
        .map((item) => item.id);

      if (unavailableItemIds.length > 0) {
        const newSelected = new Set(selectedItems);
        unavailableItemIds.forEach((id) => newSelected.delete(id));
        setSelectedItems(newSelected);
      }
    }
  }, [cart?.cartItems]);

  // Group cart items by store
  const storeGroups = useMemo<StoreCartGroup[]>(() => {
    if (!cart?.cartItems) return [];

    const groupsMap = new Map<string, StoreCartGroup>();

    cart.cartItems.forEach((item) => {
      if (!groupsMap.has(item.storeId)) {
        groupsMap.set(item.storeId, {
          storeId: item.storeId,
          storeName: item.storeName,
          items: [],
          storeSubtotal: 0,
        });
      }

      const group = groupsMap.get(item.storeId)!;
      group.items.push(item);
      group.storeSubtotal += item.priceAtAdd * item.quantity;
    });

    return Array.from(groupsMap.values());
  }, [cart?.cartItems]);

  // Calculate subtotal for selected items only
  const selectedSubtotal = useMemo(() => {
    if (!cart?.cartItems) return 0;
    return cart.cartItems
      .filter((item) => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
  }, [cart?.cartItems, selectedItems]);

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && cart?.cartItems) {
      setSelectedItems(
        new Set(
          cart.cartItems
            .filter((item) => item.isAvailable)
            .map((item) => item.id),
        ),
      );
    } else {
      setSelectedItems(new Set());
    }
  };

  const availableItems = cart?.cartItems.filter((item) => item.isAvailable) || [];
  const isAllSelected =
    availableItems.length > 0
      ? availableItems.every((item) => selectedItems.has(item.id))
      : false;

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateCartItem({ cartItemId: itemId, dto: { quantity } });
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeCartItem(itemId);
      // Remove from selection if it was selected
      const newSelected = new Set(selectedItems);
      newSelected.delete(itemId);
      setSelectedItems(newSelected);
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    }
  };

  const handleClearAll = () => {
    setShowClearModal(true);
  };

  const handleClearConfirm = async () => {
    try {
      await clearCart();
      setSelectedItems(new Set());
      setShowClearModal(false);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const handleClearModalClose = () => {
    setShowClearModal(false);
  };

  if (isLoading) {
    return (
      <div className='px-4 md:px-8 lg:px-20 py-6 md:py-12'>
        <div className='flex items-center justify-center py-20'>
          <p className='text-neutral-500'>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='px-4 md:px-8 lg:px-20 py-6 md:py-12'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left: Cart Items (2 columns wide on desktop) */}
        <div className='lg:col-span-2'>
          {/* Header with Select All and Clear */}
          <div className='bg-white border border-neutral-200 rounded-t-lg px-4 md:px-6 py-3 md:py-4 flex items-center justify-between'>
            <div className='flex items-center gap-2 md:gap-3'>
              <input
                type='checkbox'
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className='w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-600 cursor-pointer'
              />
              <h1 className='text-lg md:text-xl font-semibold text-neutral-900'>
                Shopping Cart
              </h1>
            </div>
            {cart && cart.cartItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className='cursor-pointer px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors'
              >
                Clear All
              </button>
            )}
          </div>

          {/* Cart Items Grouped by Store */}
          <div className='bg-neutral-50 border-x border-b border-neutral-200 rounded-b-lg p-3 md:p-4'>
            {storeGroups.length === 0 ? (
              <div className='bg-white rounded-lg border border-neutral-200 px-4 py-12 text-center text-neutral-500'>
                Your cart is empty
              </div>
            ) : (
              storeGroups.map((group) => (
                <StoreCartSection
                  key={group.storeId}
                  group={group}
                  selectedItems={selectedItems}
                  onSelectItem={handleSelectItem}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Cart Totals */}
        <div className='lg:col-span-1'>
          <CartTotals
            subtotal={selectedSubtotal}
            selectedItemsCount={selectedItems.size}
            onCheckout={() => {
              const selectedCartItems = cart?.cartItems.filter((item) =>
                selectedItems.has(item.id),
              );
              navigate('/checkout', {
                state: { selectedItems: selectedCartItems },
              });
            }}
          />
        </div>
      </div>

      {/* Clear Cart Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={handleClearModalClose}
        onDone={handleClearConfirm}
        title='Clear Cart'
        doneLabel='Clear All'
        cancelLabel='Cancel'
      >
        <div className='space-y-4'>
          <p className='text-neutral-600'>
            Are you sure you want to clear your entire cart? This action cannot
            be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};
