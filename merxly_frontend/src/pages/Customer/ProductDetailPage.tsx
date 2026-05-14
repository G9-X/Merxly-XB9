import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import {
  HeartIcon,
  ArrowsRightLeftIcon,
  LinkIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { getProductByIdCustomer } from '../../services/productService';
import {
  ProductMediaGallery,
  ProductRating,
  ProductVariantSelector,
  ProductActions,
  ProductReviewSection,
} from '../../components/customer/productDetail';
import { AddToCartModal } from '../../components/cart';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import type { ProductVariantForCustomerDto } from '../../types/models/productVariant';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isAddingToCart } = useCart();
  const {
    wishlist,
    addToWishlist,
    removeWishlistItem,
    isAddingToWishlist,
    isRemovingWishlistItem,
  } = useWishlist();

  // Fetch product details
  const { data: productData, isLoading } = useQuery({
    queryKey: ['product-detail', id],
    queryFn: () => getProductByIdCustomer(id!),
    enabled: !!id,
  });

  const product = productData?.data;

  // Track selected variant
  const [selectedVariant, setSelectedVariant] = useState<
    ProductVariantForCustomerDto | undefined
  >();

  useEffect(() => {
    if (product?.variants && !selectedVariant) {
      setSelectedVariant(product.variants.find((v) => v.isActive));
    }
  }, [product?.variants, selectedVariant]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addedQuantity, setAddedQuantity] = useState(0);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [copySuccess, setCopySuccess] = useState(false);

  // Check if the selected variant is in the wishlist
  const isInWishlist = useMemo(() => {
    if (!wishlist || !selectedVariant || !product) return false;

    return wishlist.wishlistItems.some(
      (item) =>
        item.productId === product.id &&
        item.productVariantId === selectedVariant.id,
    );
  }, [wishlist, selectedVariant, product]);

  const handleAddToCart = async (quantity: number) => {
    if (!selectedVariant) return;

    try {
      await addToCart({
        productVariantId: selectedVariant.id,
        quantity,
      });
      setAddedQuantity(quantity);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleBuyNow = async (quantity: number) => {
    if (!selectedVariant || !product) return;

    // Construct a CartItemDto-like object for checkout display
    const checkoutItem = {
      id: '', // Temporary ID (not used in checkout backend call)
      productVariantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productImagePublicId:
        selectedVariant.productVariantMedia.find((m) => m.isMain)
          ?.mediaPublicId || null,
      priceAtAdd: selectedVariant.price,
      quantity,
      stockQuantity: selectedVariant.stockQuantity,
      isAvailable: true,
      selectedAttributes: product.productAttributes.reduce(
        (acc, attr) => {
          const selectedAttrValue = selectedVariant.productAttributeValues.find(
            (pav) =>
              attr.productAttributeValues.some(
                (av) => av.id === pav.productAttributeValueId,
              ),
          );
          if (selectedAttrValue) {
            const attrValue = attr.productAttributeValues.find(
              (av) => av.id === selectedAttrValue.productAttributeValueId,
            );
            if (attrValue) {
              acc[attr.name] = attrValue.value;
            }
          }
          return acc;
        },
        {} as Record<string, string>,
      ),
      storeId: product.storeId,
      storeName: product.storeName,
      createdAt: new Date().toISOString(),
    };

    // Navigate to checkout with the constructed item
    navigate('/checkout', {
      state: { selectedItems: [checkoutItem] },
    });
  };

  const handleWishlistToggle = async () => {
    if (!selectedVariant || !product) return;

    try {
      if (isInWishlist) {
        // Find the wishlist item and remove it
        const wishlistItem = wishlist?.wishlistItems.find(
          (item) =>
            item.productId === product.id &&
            item.productVariantId === selectedVariant.id,
        );
        if (wishlistItem) {
          await removeWishlistItem(wishlistItem.id);
        }
      } else {
        // Add to wishlist
        await addToWishlist({
          productId: product.id,
          productVariantId: selectedVariant.id,
        });
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='px-4 md:px-8 lg:px-20 py-6 md:py-12'>
        <div className='flex items-center justify-center py-20'>
          <p className='text-neutral-500'>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className='px-4 md:px-8 lg:px-20 py-6 md:py-12'>
        <div className='flex flex-col items-center justify-center py-20'>
          <p className='text-neutral-500 mb-4'>Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className='px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer'
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const handleCategoryClick = () => {
    navigate(`/products?categoryId=${product.categoryId}`);
  };

  const variantMedia =
    selectedVariant?.productVariantMedia.sort(
      (a, b) => a.displayOrder - b.displayOrder,
    ) || [];

  return (
    <div className='px-4 md:px-8 lg:px-20 py-6 md:py-12'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12'>
        {/* Left Column - Media Gallery */}
        <div>
          <ProductMediaGallery media={variantMedia} />
        </div>

        {/* Right Column - Product Info */}
        <div className='space-y-2'>
          {/* Rating Section */}
          <ProductRating
            averageRating={product.averageRating}
            reviewCount={product.reviewCount}
          />

          {/* Category */}
          <div className='text-sm text-neutral-600'>
            <span>Category: </span>
            <button
              onClick={handleCategoryClick}
              className='text-primary-600 hover:text-primary-700 font-medium underline cursor-pointer'
            >
              {product.categoryName}
            </button>
          </div>

          {/* Product Name */}
          <h1 className='text-xl mt-4 md:text-2xl lg:text-3xl font-bold text-neutral-900'>
            {product.name}
          </h1>

          {/* Price */}
          {selectedVariant && (
            <div className='text-2xl mt-4 md:text-3xl font-bold text-primary-600'>
              ₫
              {(selectedVariant.price * currentQuantity).toLocaleString(
                'vi-VN',
              )}
            </div>
          )}

          {/* Divider */}
          <div className='border-t border-neutral-200' />

          {/* Variant Selector */}
          {product.productAttributes.length > 0 && (
            <ProductVariantSelector
              productAttributes={product.productAttributes}
              variants={product.variants}
              onVariantChange={setSelectedVariant}
            />
          )}

          {/* Divider */}
          <div className='border-t border-neutral-200' />

          {/* Action Buttons */}
          {selectedVariant && (
            <ProductActions
              price={selectedVariant.price}
              stockQuantity={selectedVariant.stockQuantity}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onQuantityChange={setCurrentQuantity}
              isAddingToCart={isAddingToCart}
            />
          )}

          {/* Wishlist, Compare, and Share Section */}
          <div className='flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-neutral-200 gap-4'>
            {/* Left Side - Wishlist & Compare */}
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
              <button
                onClick={handleWishlistToggle}
                disabled={isAddingToWishlist || isRemovingWishlistItem}
                className='cursor-pointer flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {isInWishlist ? (
                  <HeartIconSolid className='h-5 w-5 text-red-500' />
                ) : (
                  <HeartIcon className='h-5 w-5' />
                )}
                <span>
                  {isInWishlist ? 'Added to Wishlist' : 'Add to Wishlist'}
                </span>
              </button>
              <button className='cursor-pointer flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors'>
                <ArrowsRightLeftIcon className='h-5 w-5' />
                <span>Add to Compare</span>
              </button>
            </div>

            {/* Right Side - Share */}
            <div className='flex items-center gap-3 justify-center md:justify-end'>
              <span className='text-sm font-medium text-neutral-700'>
                Share:
              </span>
              <button
                onClick={handleCopyLink}
                className='cursor-pointer p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors relative'
                title={copySuccess ? 'Link copied!' : 'Copy link'}
              >
                <LinkIcon className='h-5 w-5' />
                {copySuccess && (
                  <span className='absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-neutral-900 rounded whitespace-nowrap'>
                    Copied!
                  </span>
                )}
              </button>
              <button className='cursor-pointer p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'>
                <ShareIcon className='h-5 w-5' />
              </button>
              <button className='cursor-pointer p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'>
                <svg
                  className='h-5 w-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                </svg>
              </button>
              <button className='cursor-pointer p-2 text-neutral-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors'>
                <svg
                  className='h-5 w-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
                </svg>
              </button>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className='pt-6 border-t border-neutral-200'>
              <h3 className='text-lg font-semibold text-neutral-900 mb-3'>
                Description
              </h3>
              <div
                className='text-neutral-700 prose prose-sm max-w-none'
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
              />
            </div>
          )}

          {/* Store Info */}
          <div className='pt-6 border-t border-neutral-200'>
            <h3 className='text-lg font-semibold text-neutral-900 mb-3'>
              Store Information
            </h3>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-600 font-bold'>
                {product.storeName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className='font-medium text-neutral-900'>
                  {product.storeName}
                  {product.storeIsVerified && (
                    <span className='ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded'>
                      Verified
                    </span>
                  )}
                </p>
                <p className='text-sm text-neutral-500'>
                  {product.totalSold.toLocaleString()} products sold
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      {product.reviewCount > 0 && (
        <ProductReviewSection
          productId={product.id}
          averageRating={product.averageRating}
          reviewCount={product.reviewCount}
        />
      )}

      {/* Add to Cart Modal */}
      {selectedVariant && product && (
        <AddToCartModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          variantData={{
            imagePublicId:
              selectedVariant.productVariantMedia.find((m) => m.isMain)
                ?.mediaPublicId || null,
            name: product.name,
            price: selectedVariant.price,
            quantity: addedQuantity,
            selectedAttributes: product.productAttributes.reduce(
              (acc, attr) => {
                const selectedAttrValue =
                  selectedVariant.productAttributeValues.find((pav) =>
                    attr.productAttributeValues.some(
                      (av) => av.id === pav.productAttributeValueId,
                    ),
                  );
                if (selectedAttrValue) {
                  const attrValue = attr.productAttributeValues.find(
                    (av) => av.id === selectedAttrValue.productAttributeValueId,
                  );
                  if (attrValue) {
                    acc[attr.name] = attrValue.value;
                  }
                }
                return acc;
              },
              {} as Record<string, string>,
            ),
          }}
        />
      )}
    </div>
  );
};
