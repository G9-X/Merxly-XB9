import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../services/cartService';
import type { UpdateCartItemDto } from '../types/models/cart';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

export const useCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const {
    data: cartData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: isAuthenticated,
  });

  const addToCartMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: ({
      cartItemId,
      dto,
    }: {
      cartItemId: string;
      dto: UpdateCartItemDto;
    }) => updateCartItem(cartItemId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeCartItemMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      toast.success('Cart cleared');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return {
    cart: cartData?.data,
    isLoading,
    error,
    addToCart: addToCartMutation.mutateAsync,
    updateCartItem: updateCartItemMutation.mutateAsync,
    removeCartItem: removeCartItemMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCartItem: updateCartItemMutation.isPending,
    isRemovingCartItem: removeCartItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
};
