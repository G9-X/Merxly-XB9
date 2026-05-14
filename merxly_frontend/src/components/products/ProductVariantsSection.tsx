import { useState, forwardRef, useImperativeHandle } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  Bars3Icon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { VariantMediaModal } from './VariantMediaModal';
import type { CreateProductVariantMediaDto } from '../../types/models/productVariantMedia';
import { getMediaThumbnailUrl } from '../../utils/cloudinaryHelpers';

// Internal types
interface AttributeValue {
  id: string;
  value: string;
}

interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
}

interface Variant {
  id: string;
  attributeValues: Record<string, string>; // attributeId -> valueId
  price: number;
  available: number;
  sku: string;
  media?: CreateProductVariantMediaDto[];
}

interface ProductVariantsSectionProps {
  attributes: Attribute[];
  variants: Variant[];
  groupBy: string | null;
  onAttributesChange: (attributes: Attribute[]) => void;
  onVariantsChange: (variants: Variant[]) => void;
  onGroupByChange: (groupBy: string | null) => void;
  onDeleteAttributeValue?: (valueId: string) => void;
  onDeleteAttribute?: (attributeId: string) => void;
  onMarkedForDeletionChange?: (markedIds: string[]) => void;
  isEditMode?: boolean;
}

export interface ProductVariantsSectionRef {
  resetMarkedForDeletion: () => void;
}

export const ProductVariantsSection = forwardRef<
  ProductVariantsSectionRef,
  ProductVariantsSectionProps
>(
  (
    {
      attributes,
      variants,
      groupBy,
      onAttributesChange,
      onVariantsChange,
      onGroupByChange,
      onDeleteAttributeValue,
      onDeleteAttribute,
      onMarkedForDeletionChange,
      isEditMode = false,
    },
    ref,
  ) => {
    const [editingAttributeId, setEditingAttributeId] = useState<string | null>(
      null,
    );
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
      new Set(),
    );
    const [validationErrors, setValidationErrors] = useState<{
      name?: string;
      values?: string;
      duplicateName?: boolean;
      duplicateValues?: Set<string>;
    }>({});
    const [draggedAttrIndex, setDraggedAttrIndex] = useState<number | null>(
      null,
    );
    const [draggedValueIndex, setDraggedValueIndex] = useState<number | null>(
      null,
    );
    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
      null,
    );
    const [selectedVariants, setSelectedVariants] = useState<Set<string>>(
      new Set(),
    );
    const [markedForDeletion, setMarkedForDeletion] = useState<Set<string>>(
      new Set(),
    );
    const [editingField, setEditingField] = useState<{
      variantId: string;
      field: 'price' | 'available';
      value: string;
    } | null>(null);

    // Expose reset method to parent via ref
    useImperativeHandle(ref, () => ({
      resetMarkedForDeletion: () => {
        setMarkedForDeletion(new Set());
        onMarkedForDeletionChange?.([]);
      },
    }));

    // Generate variants based on attributes (Cartesian product)
    const generateVariants = (attrs: Attribute[]): Variant[] => {
      const validAttrs = attrs.filter(
        (attr) => attr.name && attr.values.some((v) => v.value),
      );

      if (validAttrs.length === 0) return [];

      // Get valid values for each attribute
      const validValuesByAttr = validAttrs.map((attr) => ({
        attrId: attr.id,
        values: attr.values.filter((v) => v.value),
      }));

      // Cartesian product
      const cartesian = (
        arr: Array<{ attrId: string; values: AttributeValue[] }>,
      ): Array<Record<string, string>> => {
        if (arr.length === 0) return [{}];
        const [first, ...rest] = arr;
        const restProduct = cartesian(rest);
        return first.values.flatMap((val) =>
          restProduct.map((prod) => ({
            [first.attrId]: val.id,
            ...prod,
          })),
        );
      };

      const combinations = cartesian(validValuesByAttr);

      return combinations.map((combo) => {
        // Check if variant already exists
        const existing = variants.find((v) => {
          return Object.keys(combo).every(
            (attrId) => v.attributeValues[attrId] === combo[attrId],
          );
        });

        if (existing) {
          return existing;
        }

        return {
          id: `variant-${Date.now()}-${Math.random()}`,
          attributeValues: combo,
          price: 0,
          available: 0,
          sku: '',
        };
      });
    };

    // Add new attribute
    const handleAddAttribute = () => {
      if (attributes.length >= 3) return;

      const newAttr: Attribute = {
        id: `attr-${Date.now()}`,
        name: '',
        values: [{ id: `val-${Date.now()}`, value: '' }],
      };

      onAttributesChange([...attributes, newAttr]);
      setEditingAttributeId(newAttr.id);
    };

    // Update attribute name
    const handleUpdateAttributeName = (id: string, name: string) => {
      const updated = attributes.map((attr) =>
        attr.id === id ? { ...attr, name } : attr,
      );
      onAttributesChange(updated);

      // Regenerate variants
      const newVariants = generateVariants(updated);
      onVariantsChange(newVariants);

      // Set default group by if needed
      if (
        updated.filter((a) => a.name && a.values.some((v) => v.value)).length >=
          2 &&
        !groupBy
      ) {
        onGroupByChange(updated.find((a) => a.name)?.id || null);
      }
    };

    // Update attribute value
    const handleUpdateAttributeValue = (
      attributeId: string,
      valueId: string,
      value: string,
    ) => {
      const updated = attributes.map((attr) => {
        if (attr.id === attributeId) {
          const updatedValues = attr.values.map((v) =>
            v.id === valueId ? { ...v, value } : v,
          );

          // Auto-add new empty value if this is the last one and has value
          const lastValue = updatedValues[updatedValues.length - 1];
          if (lastValue.id === valueId && value) {
            updatedValues.push({ id: `val-${Date.now()}`, value: '' });
          }

          return { ...attr, values: updatedValues };
        }
        return attr;
      });

      onAttributesChange(updated);

      // Regenerate variants
      const newVariants = generateVariants(updated);
      onVariantsChange(newVariants);

      // Set default group by if needed
      if (
        updated.filter((a) => a.name && a.values.some((v) => v.value)).length >=
          2 &&
        !groupBy
      ) {
        onGroupByChange(updated.find((a) => a.name)?.id || null);
      }
    };

    // Delete attribute value
    const handleDeleteAttributeValue = (
      attributeId: string,
      valueId: string,
    ) => {
      // In edit mode, check if this is an existing value (not a new one with 'val-new-' prefix)
      // If it's existing, track it for deletion on save
      if (
        isEditMode &&
        !valueId.startsWith('val-new-') &&
        onDeleteAttributeValue
      ) {
        onDeleteAttributeValue(valueId);
      }

      const updated = attributes.map((attr) => {
        if (attr.id === attributeId) {
          const filtered = attr.values.filter((v) => v.id !== valueId);
          // Keep at least one empty value
          if (filtered.length === 0) {
            filtered.push({ id: `val-${Date.now()}`, value: '' });
          }
          return { ...attr, values: filtered };
        }
        return attr;
      });

      onAttributesChange(updated);

      // Regenerate variants
      const newVariants = generateVariants(updated);
      onVariantsChange(newVariants);
    };

    // Delete attribute
    const handleDeleteAttribute = (id: string) => {
      // Track deletion for backend if in edit mode and attribute exists
      if (isEditMode && !id.startsWith('attr-') && onDeleteAttribute) {
        onDeleteAttribute(id);
      }

      const updated = attributes.filter((attr) => attr.id !== id);
      onAttributesChange(updated);

      // Regenerate variants
      const newVariants = generateVariants(updated);
      onVariantsChange(newVariants);

      // Reset group by if needed
      if (groupBy === id) {
        onGroupByChange(updated.find((a) => a.name)?.id || null);
      }

      setEditingAttributeId(null);
    };

    // Drag handlers for attributes
    const handleAttrDragStart = (index: number) => {
      setDraggedAttrIndex(index);
    };

    const handleAttrDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const handleAttrDrop = (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (draggedAttrIndex === null || draggedAttrIndex === targetIndex) return;

      const reordered = [...attributes];
      const [draggedAttr] = reordered.splice(draggedAttrIndex, 1);
      reordered.splice(targetIndex, 0, draggedAttr);

      onAttributesChange(reordered);
      setDraggedAttrIndex(null);

      // Update groupBy if needed
      if (groupBy) {
        const validAttrs = reordered.filter(
          (a) => a.name && a.values.some((v) => v.value),
        );
        if (validAttrs.length >= 2) {
          onGroupByChange(validAttrs[0].id);
        }
      }

      // Regenerate variants with new order
      const newVariants = generateVariants(reordered);
      onVariantsChange(newVariants);
    };

    // Drag handlers for option values
    const handleValueDragStart = (index: number) => {
      setDraggedValueIndex(index);
    };

    const handleValueDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const handleValueDrop = (
      e: React.DragEvent,
      attributeId: string,
      targetIndex: number,
    ) => {
      e.preventDefault();
      if (draggedValueIndex === null || draggedValueIndex === targetIndex)
        return;

      const updated = attributes.map((attr) => {
        if (attr.id === attributeId) {
          const reordered = [...attr.values];
          const [draggedValue] = reordered.splice(draggedValueIndex, 1);
          reordered.splice(targetIndex, 0, draggedValue);
          return { ...attr, values: reordered };
        }
        return attr;
      });

      onAttributesChange(updated);
      setDraggedValueIndex(null);

      // Regenerate variants with new value order
      const newVariants = generateVariants(updated);
      onVariantsChange(newVariants);
    };

    // Done editing attribute
    const handleDoneEditing = () => {
      if (!editingAttributeId) return;

      const currentAttr = attributes.find((a) => a.id === editingAttributeId);
      if (!currentAttr) return;

      const errors: typeof validationErrors = {};

      // Validate attribute name
      const trimmedName = currentAttr.name.trim();
      if (!trimmedName) {
        errors.name = 'Attribute name is required';
      } else {
        // Check for duplicate attribute names (case-insensitive)
        const isDuplicateName = attributes.some(
          (attr) =>
            attr.id !== currentAttr.id &&
            attr.name.trim().toLowerCase() === trimmedName.toLowerCase(),
        );
        if (isDuplicateName) {
          errors.duplicateName = true;
          errors.name = 'Attribute name must be unique';
        }
      }

      // Validate option values
      const validValues = currentAttr.values.filter((v) => v.value.trim());
      if (validValues.length === 0) {
        errors.values = 'At least one option value is required';
      } else {
        // Check for duplicate values (case-insensitive)
        const valueCounts = new Map<string, string[]>();
        currentAttr.values.forEach((val) => {
          const trimmed = val.value.trim().toLowerCase();
          if (trimmed) {
            if (!valueCounts.has(trimmed)) {
              valueCounts.set(trimmed, []);
            }
            valueCounts.get(trimmed)!.push(val.id);
          }
        });

        const duplicateValueIds = new Set<string>();
        valueCounts.forEach((ids) => {
          if (ids.length > 1) {
            ids.forEach((id) => duplicateValueIds.add(id));
          }
        });

        if (duplicateValueIds.size > 0) {
          errors.duplicateValues = duplicateValueIds;
          errors.values = 'Option values must be unique';
        }
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Clear validation errors and close editor
      setValidationErrors({});
      setEditingAttributeId(null);
    };

    // Update variant field
    const handleUpdateVariant = (
      id: string,
      field: 'price' | 'available' | 'sku',
      value: string | number,
    ) => {
      const updated = variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v,
      );
      onVariantsChange(updated);
    };

    // Handle input change for price and available (allows empty during edit)
    const handleInputChange = (
      variantId: string,
      field: 'price' | 'available',
      value: string,
    ) => {
      setEditingField({ variantId, field, value });
    };

    // Handle input blur (convert empty to 0)
    const handleInputBlur = (
      variantId: string,
      field: 'price' | 'available',
    ) => {
      if (
        editingField?.variantId === variantId &&
        editingField?.field === field
      ) {
        const numValue =
          field === 'price'
            ? parseFloat(editingField.value) || 0
            : parseInt(editingField.value) || 0;
        handleUpdateVariant(variantId, field, numValue);
        setEditingField(null);
      }
    };

    // Get display value for input (use editing value if currently editing, otherwise actual value)
    const getInputValue = (
      variantId: string,
      field: 'price' | 'available',
      actualValue: number,
    ): string => {
      if (
        editingField?.variantId === variantId &&
        editingField?.field === field
      ) {
        return editingField.value;
      }
      return actualValue.toString();
    };

    // Toggle group expansion
    const toggleGroupExpansion = (groupKey: string) => {
      const newExpanded = new Set(expandedGroups);
      if (newExpanded.has(groupKey)) {
        newExpanded.delete(groupKey);
      } else {
        newExpanded.add(groupKey);
      }
      setExpandedGroups(newExpanded);
    };

    // Get attribute value by ids
    const getAttributeValue = (attrId: string, valueId: string): string => {
      const attr = attributes.find((a) => a.id === attrId);
      return attr?.values.find((v) => v.id === valueId)?.value || '';
    };

    // Build variant display name
    const getVariantName = (variant: Variant): string => {
      return attributes
        .map((attr) => {
          const valueId = variant.attributeValues[attr.id];
          if (!valueId) return '';
          return getAttributeValue(attr.id, valueId);
        })
        .filter(Boolean)
        .join(' / ');
    };

    // Check if should show variants table
    const shouldShowVariants =
      attributes.some((a) => a.name && a.values.some((v) => v.value)) &&
      variants.length > 0;

    // Check if should show grouping
    const shouldShowGrouping =
      attributes.filter((a) => a.name && a.values.some((v) => v.value))
        .length >= 2;

    // Group variants
    const groupedVariants: Record<
      string,
      { variants: Variant[]; groupLabel: string }
    > = {};

    if (shouldShowGrouping && groupBy) {
      variants.forEach((variant) => {
        const groupValueId = variant.attributeValues[groupBy];

        // Skip if groupValueId is undefined
        if (!groupValueId) {
          return;
        }

        const groupLabel = getAttributeValue(groupBy, groupValueId);

        if (!groupedVariants[groupValueId]) {
          groupedVariants[groupValueId] = { variants: [], groupLabel };
        }
        groupedVariants[groupValueId].variants.push(variant);
      });
    }

    // Calculate aggregated values for group
    const getGroupPrice = (variantsInGroup: Variant[]): string => {
      const prices = variantsInGroup.map((v) => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min === max) return min.toString();
      return `${min} – ${max}`;
    };

    const getGroupAvailable = (variantsInGroup: Variant[]): number => {
      return variantsInGroup.reduce((sum, v) => sum + v.available, 0);
    };

    // Media handlers
    const handleOpenMediaModal = (variantId: string) => {
      setSelectedVariantId(variantId);
      setMediaModalOpen(true);
    };

    const handleSaveMedia = (files: CreateProductVariantMediaDto[]) => {
      if (!selectedVariantId) return;

      const updated = variants.map((v) =>
        v.id === selectedVariantId ? { ...v, media: files } : v,
      );
      onVariantsChange(updated);
    };

    const getVariantMedia = (
      variantId: string,
    ): CreateProductVariantMediaDto[] => {
      return variants.find((v) => v.id === variantId)?.media || [];
    };

    const getMainMediaPreview = (variantId: string): string | null => {
      const media = getVariantMedia(variantId);
      const mainMedia = media.find((m) => m.isMain);

      if (!mainMedia) return null;

      return getMediaThumbnailUrl(mainMedia.mediaPublicId, mainMedia.mediaType);
    };

    // Checkbox selection handlers
    const handleToggleVariant = (variantId: string) => {
      const newSelected = new Set(selectedVariants);
      if (newSelected.has(variantId)) {
        newSelected.delete(variantId);
      } else {
        newSelected.add(variantId);
      }
      setSelectedVariants(newSelected);
    };

    const handleToggleGroup = (groupVariants: Variant[]) => {
      const groupIds = groupVariants.map((v) => v.id);
      const allSelected = groupIds.every((id) => selectedVariants.has(id));
      const newSelected = new Set(selectedVariants);

      if (allSelected) {
        // Deselect all in group
        groupIds.forEach((id) => newSelected.delete(id));
      } else {
        // Select all in group
        groupIds.forEach((id) => newSelected.add(id));
      }
      setSelectedVariants(newSelected);
    };

    const handleToggleAll = () => {
      const allIds = variants.map((v) => v.id);
      const allSelected = allIds.every((id) => selectedVariants.has(id));

      if (allSelected) {
        setSelectedVariants(new Set());
      } else {
        setSelectedVariants(new Set(allIds));
      }
    };

    const isGroupIndeterminate = (groupVariants: Variant[]): boolean => {
      const groupIds = groupVariants.map((v) => v.id);
      const selectedCount = groupIds.filter((id) =>
        selectedVariants.has(id),
      ).length;
      return selectedCount > 0 && selectedCount < groupIds.length;
    };

    const isGroupChecked = (groupVariants: Variant[]): boolean => {
      const groupIds = groupVariants.map((v) => v.id);
      return (
        groupIds.length > 0 && groupIds.every((id) => selectedVariants.has(id))
      );
    };

    const isAllIndeterminate = (): boolean => {
      const allIds = variants.map((v) => v.id);
      const selectedCount = allIds.filter((id) =>
        selectedVariants.has(id),
      ).length;
      return selectedCount > 0 && selectedCount < allIds.length;
    };

    const isAllChecked = (): boolean => {
      return (
        variants.length > 0 && variants.every((v) => selectedVariants.has(v.id))
      );
    };

    const handleMarkForDeletion = () => {
      const newMarked = new Set(markedForDeletion);
      selectedVariants.forEach((id) => newMarked.add(id));
      setMarkedForDeletion(newMarked);
      setSelectedVariants(new Set());
      onMarkedForDeletionChange?.(Array.from(newMarked));
    };

    const handleUndoDeletion = (variantId: string) => {
      const newMarked = new Set(markedForDeletion);
      newMarked.delete(variantId);
      setMarkedForDeletion(newMarked);
      onMarkedForDeletionChange?.(Array.from(newMarked));
    };

    const isGroupFullyMarkedForDeletion = (
      groupVariants: Variant[],
    ): boolean => {
      return (
        groupVariants.length > 0 &&
        groupVariants.every((v) => markedForDeletion.has(v.id))
      );
    };

    return (
      <div className='bg-white rounded-lg border border-neutral-200 p-6'>
        <h2 className='text-base font-semibold text-neutral-900 mb-4'>
          Variants
        </h2>

        {/* Attributes Section */}
        <div className='space-y-3 mb-6'>
          {attributes.map((attr, attrIndex) => (
            <div
              key={attr.id}
              draggable={editingAttributeId !== attr.id}
              onDragStart={() => handleAttrDragStart(attrIndex)}
              onDragOver={handleAttrDragOver}
              onDrop={(e) => handleAttrDrop(e, attrIndex)}
            >
              {editingAttributeId === attr.id ? (
                // Attribute Editor Panel
                <div className='border border-neutral-300 rounded-lg p-4 bg-neutral-50'>
                  <div className='mb-4'>
                    <label className='block text-sm font-medium text-neutral-700 mb-1'>
                      Option name
                    </label>
                    <input
                      type='text'
                      value={attr.name}
                      onChange={(e) => {
                        handleUpdateAttributeName(attr.id, e.target.value);
                        setValidationErrors({});
                      }}
                      placeholder='e.g., Color, Size'
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        validationErrors.name
                          ? 'border-red-500'
                          : 'border-neutral-300'
                      }`}
                    />
                    {validationErrors.name && (
                      <p className='mt-1 text-xs text-red-600'>
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div className='mb-4'>
                    <label className='block text-sm font-medium text-neutral-700 mb-2'>
                      Option values
                    </label>
                    <div className='space-y-2'>
                      {attr.values.map((val, valIndex) => (
                        <div
                          key={val.id}
                          draggable={val.value !== ''}
                          onDragStart={() => handleValueDragStart(valIndex)}
                          onDragOver={handleValueDragOver}
                          onDrop={(e) => handleValueDrop(e, attr.id, valIndex)}
                          className='flex items-center gap-2'
                        >
                          <Bars3Icon
                            className={`w-4 h-4 shrink-0 ${
                              val.value
                                ? 'text-neutral-400 cursor-move'
                                : 'text-neutral-300'
                            }`}
                          />
                          <input
                            type='text'
                            value={val.value}
                            onChange={(e) => {
                              handleUpdateAttributeValue(
                                attr.id,
                                val.id,
                                e.target.value,
                              );
                              setValidationErrors({});
                            }}
                            placeholder='Enter value'
                            className={`flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              validationErrors.duplicateValues?.has(val.id)
                                ? 'border-red-500'
                                : 'border-neutral-300'
                            }`}
                          />
                          {attr.values.filter((v) => v.value).length > 1 &&
                            val.value && (
                              <button
                                type='button'
                                onClick={() =>
                                  handleDeleteAttributeValue(attr.id, val.id)
                                }
                                className='cursor-pointer p-2 text-neutral-400 hover:text-red-600 transition-colors'
                              >
                                <TrashIcon className='w-4 h-4' />
                              </button>
                            )}
                        </div>
                      ))}
                    </div>
                    {validationErrors.values && (
                      <p className='mt-1 text-xs text-red-600'>
                        {validationErrors.values}
                      </p>
                    )}
                  </div>

                  <div className='flex items-center justify-between'>
                    <button
                      type='button'
                      onClick={() => handleDeleteAttribute(attr.id)}
                      className='cursor-pointer px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors'
                    >
                      Delete
                    </button>
                    <button
                      type='button'
                      onClick={handleDoneEditing}
                      className='cursor-pointer px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium transition-colors'
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                // Attribute Summary Card
                <button
                  type='button'
                  onClick={() => setEditingAttributeId(attr.id)}
                  className='w-full border border-neutral-200 rounded-lg p-4 text-left hover:border-neutral-300 hover:bg-neutral-50 transition-colors cursor-move'
                >
                  <div className='flex items-center gap-2 mb-2'>
                    <Bars3Icon className='w-4 h-4 text-neutral-400' />
                    <span className='text-sm font-semibold text-neutral-900'>
                      {attr.name || 'Unnamed option'}
                    </span>
                  </div>
                  <div className='flex flex-wrap gap-2 pl-6'>
                    {attr.values
                      .filter((v) => v.value)
                      .map((val) => (
                        <span
                          key={val.id}
                          className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700'
                        >
                          {val.value}
                        </span>
                      ))}
                  </div>
                </button>
              )}
            </div>
          ))}

          {/* Add Attribute Button */}
          {attributes.length < 3 && (
            <button
              type='button'
              onClick={handleAddAttribute}
              className='cursor-pointer w-full px-4 py-3 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-600 hover:border-neutral-400 hover:text-neutral-700 font-medium transition-colors'
            >
              {attributes.length === 0
                ? 'Add options like color or size'
                : 'Add another option'}
            </button>
          )}
        </div>

        {/* Variants Table */}
        {shouldShowVariants && (
          <div className='border border-neutral-200 rounded-lg overflow-hidden'>
            {/* Group By Selector and Bulk Actions */}
            {(shouldShowGrouping || selectedVariants.size > 0) && (
              <div className='px-4 py-3 border-b border-neutral-200 flex items-center justify-between'>
                {shouldShowGrouping ? (
                  <div>
                    <label className='text-sm font-medium text-neutral-700 mr-3'>
                      Group by:
                    </label>
                    <select
                      value={groupBy || ''}
                      onChange={(e) => onGroupByChange(e.target.value || null)}
                      className='px-3 py-1.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                    >
                      {attributes
                        .filter((a) => a.name && a.values.some((v) => v.value))
                        .map((attr) => (
                          <option key={attr.id} value={attr.id}>
                            {attr.name}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <div></div>
                )}
                {selectedVariants.size > 0 && (
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      className='cursor-pointer px-3 py-1.5 text-sm border border-neutral-300 rounded-md font-medium text-neutral-700 hover:bg-neutral-100 transition-colors'
                    >
                      Bulk edit
                    </button>
                    <button
                      type='button'
                      onClick={handleMarkForDeletion}
                      className='cursor-pointer px-3 py-1.5 text-sm border border-error-600 rounded-md text-error-600 font-medium hover:bg-error-600 hover:text-white transition-colors'
                    >
                      Delete variants
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Table Header */}
            <div className='grid grid-cols-[auto_auto_1fr_120px_120px_150px] gap-4 px-4 py-3 bg-neutral-100 border-b border-neutral-200 text-xs font-semibold text-neutral-700'>
              <div className='w-6 flex items-center'>
                <input
                  type='checkbox'
                  className='rounded cursor-pointer'
                  checked={isAllChecked()}
                  ref={(el) => {
                    if (el) el.indeterminate = isAllIndeterminate();
                  }}
                  onChange={handleToggleAll}
                />
              </div>
              <div>Variant</div>
              <div className='w-12'></div>
              <div>Price</div>
              <div>Available</div>
              <div>SKU</div>
            </div>

            {/* Table Body */}
            <div className='divide-y divide-neutral-100'>
              {shouldShowGrouping && groupBy
                ? // Grouped view
                  Object.entries(groupedVariants).map(
                    ([
                      groupValueId,
                      { variants: groupVariants, groupLabel },
                    ]) => {
                      const isExpanded = expandedGroups.has(groupValueId);

                      return (
                        <div key={groupValueId}>
                          {/* Group Header Row */}
                          <div
                            className={`grid grid-cols-[auto_1fr_120px_120px_150px] gap-4 px-4 py-3 hover:bg-neutral-100 ${
                              isGroupChecked(groupVariants) ||
                              isGroupIndeterminate(groupVariants)
                                ? 'bg-neutral-50'
                                : 'bg-white'
                            }`}
                          >
                            <div className='w-6 flex items-center'>
                              {!isGroupFullyMarkedForDeletion(
                                groupVariants,
                              ) && (
                                <input
                                  type='checkbox'
                                  className='rounded cursor-pointer'
                                  checked={isGroupChecked(groupVariants)}
                                  ref={(el) => {
                                    if (el)
                                      el.indeterminate =
                                        isGroupIndeterminate(groupVariants);
                                  }}
                                  onChange={() =>
                                    handleToggleGroup(groupVariants)
                                  }
                                />
                              )}
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-sm font-semibold text-neutral-900'>
                                {groupLabel}
                              </span>
                              <button
                                type='button'
                                onClick={() =>
                                  toggleGroupExpansion(groupValueId)
                                }
                                className='cursor-pointer text-xs text-primary-600 hover:text-primary-700 text-left mt-1 flex items-center gap-1'
                              >
                                <span>{groupVariants.length} variants</span>
                                {isExpanded ? (
                                  <ChevronUpIcon className='w-3 h-3' />
                                ) : (
                                  <ChevronDownIcon className='w-3 h-3' />
                                )}
                              </button>
                            </div>
                            {isGroupFullyMarkedForDeletion(groupVariants) ? (
                              <div className='col-span-3 flex items-center text-sm text-error-600 font-medium'>
                                {isEditMode
                                  ? `${groupVariants.length} variant(s) will be
                                deleted`
                                  : ''}
                              </div>
                            ) : (
                              <>
                                <div className='relative flex items-center'>
                                  <span className='absolute left-3 text-md text-neutral-500'>
                                    ₫
                                  </span>
                                  <input
                                    type='text'
                                    value={getGroupPrice(groupVariants)}
                                    readOnly
                                    className='w-full pl-7 pr-2 py-1.5 border border-neutral-200 rounded text-sm bg-neutral-50 text-neutral-700 cursor-default'
                                  />
                                </div>

                                <div className='flex items-center'>
                                  <input
                                    type='number'
                                    value={getGroupAvailable(groupVariants)}
                                    disabled
                                    className='w-full px-2 py-1.5 border border-neutral-200 rounded text-sm bg-neutral-50 text-neutral-400'
                                  />
                                </div>
                                <div className='flex items-center'>
                                  <input
                                    type='text'
                                    disabled
                                    className='w-full px-2 py-1.5 border border-neutral-200 rounded text-sm bg-neutral-50'
                                  />
                                </div>
                              </>
                            )}
                          </div>

                          {/* Child Rows */}
                          {isExpanded &&
                            groupVariants.map((variant) => (
                              <div
                                key={variant.id}
                                className={`grid grid-cols-[auto_auto_1fr_120px_120px_150px] gap-4 px-4 py-3 hover:bg-neutral-100 ${
                                  selectedVariants.has(variant.id) ||
                                  markedForDeletion.has(variant.id)
                                    ? 'bg-neutral-50'
                                    : 'bg-white'
                                }`}
                              >
                                {markedForDeletion.has(variant.id) ? (
                                  <>
                                    <div className='w-6 flex items-center pl-4'></div>
                                    <div className='flex items-center pl-4'>
                                      <button
                                        type='button'
                                        onClick={() =>
                                          handleOpenMediaModal(variant.id)
                                        }
                                        className='cursor-pointer w-12 h-12 flex items-center justify-center border border-neutral-300 rounded hover:bg-neutral-100 transition-colors overflow-hidden bg-neutral-50'
                                      >
                                        {getMainMediaPreview(variant.id) ? (
                                          <img
                                            src={
                                              getMainMediaPreview(variant.id)!
                                            }
                                            alt='Variant media'
                                            className='w-full h-full object-contain'
                                          />
                                        ) : (
                                          <PhotoIcon className='w-5 h-5 text-neutral-400' />
                                        )}
                                      </button>
                                    </div>
                                    <div className='text-sm text-neutral-700 pl-4 flex items-center'>
                                      {getVariantName(variant)}
                                    </div>
                                    <div className='col-span-3 flex items-center gap-1 text-sm text-error-600 font-medium'>
                                      <span>
                                        {isEditMode
                                          ? 'This variant will be deleted'
                                          : 'This variant will not be created'}
                                      </span>
                                      <span>·</span>
                                      <button
                                        type='button'
                                        onClick={() =>
                                          handleUndoDeletion(variant.id)
                                        }
                                        className='cursor-pointer text-primary-600 hover:text-primary-700 underline font-medium'
                                      >
                                        Undo
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className='w-6 flex items-center pl-4'>
                                      <input
                                        type='checkbox'
                                        className='rounded cursor-pointer'
                                        checked={selectedVariants.has(
                                          variant.id,
                                        )}
                                        onChange={() =>
                                          handleToggleVariant(variant.id)
                                        }
                                      />
                                    </div>
                                    <div className='flex items-center pl-4'>
                                      <button
                                        type='button'
                                        onClick={() =>
                                          handleOpenMediaModal(variant.id)
                                        }
                                        className='cursor-pointer w-12 h-12 flex items-center justify-center border border-neutral-300 rounded hover:bg-neutral-100 transition-colors overflow-hidden bg-neutral-50'
                                      >
                                        {getMainMediaPreview(variant.id) ? (
                                          <img
                                            src={
                                              getMainMediaPreview(variant.id)!
                                            }
                                            alt='Variant media'
                                            className='w-full h-full object-contain'
                                          />
                                        ) : (
                                          <PhotoIcon className='w-5 h-5 text-neutral-400' />
                                        )}
                                      </button>
                                    </div>
                                    <div className='text-sm text-neutral-700 pl-4 flex items-center'>
                                      {getVariantName(variant)}
                                    </div>
                                    <div className='relative flex items-center'>
                                      <span className='absolute left-3 text-md text-neutral-500'>
                                        ₫
                                      </span>
                                      <input
                                        type='number'
                                        value={getInputValue(
                                          variant.id,
                                          'price',
                                          variant.price,
                                        )}
                                        onChange={(e) =>
                                          handleInputChange(
                                            variant.id,
                                            'price',
                                            e.target.value,
                                          )
                                        }
                                        onBlur={() =>
                                          handleInputBlur(variant.id, 'price')
                                        }
                                        className='w-full pl-7 pr-2 py-1.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                                      />
                                    </div>
                                    <div className='flex items-center'>
                                      <input
                                        type='number'
                                        value={getInputValue(
                                          variant.id,
                                          'available',
                                          variant.available,
                                        )}
                                        onChange={(e) =>
                                          handleInputChange(
                                            variant.id,
                                            'available',
                                            e.target.value,
                                          )
                                        }
                                        onBlur={() =>
                                          handleInputBlur(
                                            variant.id,
                                            'available',
                                          )
                                        }
                                        className='w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                                      />
                                    </div>
                                    <div className='flex items-center'>
                                      <input
                                        type='text'
                                        value={variant.sku}
                                        onChange={(e) =>
                                          handleUpdateVariant(
                                            variant.id,
                                            'sku',
                                            e.target.value,
                                          )
                                        }
                                        className='w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                        </div>
                      );
                    },
                  )
                : // Flat view (single attribute or no grouping)
                  variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`grid grid-cols-[auto_auto_1fr_120px_120px_150px] gap-4 px-4 py-3 hover:bg-neutral-100 ${
                        selectedVariants.has(variant.id) ||
                        markedForDeletion.has(variant.id)
                          ? 'bg-neutral-50'
                          : ''
                      }`}
                    >
                      {markedForDeletion.has(variant.id) ? (
                        <>
                          <div className='w-6 flex items-center'></div>
                          <div className='flex items-center'>
                            <button
                              type='button'
                              onClick={() => handleOpenMediaModal(variant.id)}
                              className='cursor-pointer w-12 h-12 flex items-center justify-center border border-neutral-300 rounded hover:bg-neutral-100 transition-colors overflow-hidden bg-neutral-50'
                            >
                              {getMainMediaPreview(variant.id) ? (
                                <img
                                  src={getMainMediaPreview(variant.id)!}
                                  alt='Variant media'
                                  className='w-full h-full object-contain'
                                />
                              ) : (
                                <PhotoIcon className='w-5 h-5 text-neutral-400' />
                              )}
                            </button>
                          </div>
                          <div className='text-sm text-neutral-700 flex items-center'>
                            {getVariantName(variant)}
                          </div>
                          <div className='col-span-3 flex items-center gap-1 text-sm text-error-600 font-medium'>
                            <span>
                              {isEditMode
                                ? 'This variant will be deleted'
                                : 'This variant will not be created'}
                            </span>
                            <span>·</span>
                            <button
                              type='button'
                              onClick={() => handleUndoDeletion(variant.id)}
                              className='cursor-pointer text-primary-600 hover:text-primary-700 underline font-medium'
                            >
                              Undo
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className='w-6 flex items-center'>
                            <input
                              type='checkbox'
                              className='rounded cursor-pointer'
                              checked={selectedVariants.has(variant.id)}
                              onChange={() => handleToggleVariant(variant.id)}
                            />
                          </div>
                          <div className='flex items-center'>
                            <button
                              type='button'
                              onClick={() => handleOpenMediaModal(variant.id)}
                              className='cursor-pointer w-12 h-12 flex items-center justify-center border border-neutral-300 rounded hover:bg-neutral-100 transition-colors overflow-hidden bg-neutral-50'
                            >
                              {getMainMediaPreview(variant.id) ? (
                                <img
                                  src={getMainMediaPreview(variant.id)!}
                                  alt='Variant media'
                                  className='w-full h-full object-contain'
                                />
                              ) : (
                                <PhotoIcon className='w-5 h-5 text-neutral-400' />
                              )}
                            </button>
                          </div>
                          <div className='text-sm text-neutral-700 flex items-center'>
                            {getVariantName(variant)}
                          </div>
                          <div className='relative flex items-center'>
                            <span className='absolute left-3 text-sm text-neutral-500'>
                              ₫
                            </span>
                            <input
                              type='number'
                              value={getInputValue(
                                variant.id,
                                'price',
                                variant.price,
                              )}
                              onChange={(e) =>
                                handleInputChange(
                                  variant.id,
                                  'price',
                                  e.target.value,
                                )
                              }
                              onBlur={() =>
                                handleInputBlur(variant.id, 'price')
                              }
                              className='w-full pl-7 pr-2 py-1.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                            />
                          </div>
                          <div className='flex items-center'>
                            <input
                              type='number'
                              value={getInputValue(
                                variant.id,
                                'available',
                                variant.available,
                              )}
                              onChange={(e) =>
                                handleInputChange(
                                  variant.id,
                                  'available',
                                  e.target.value,
                                )
                              }
                              onBlur={() =>
                                handleInputBlur(variant.id, 'available')
                              }
                              className='w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                            />
                          </div>
                          <div className='flex items-center'>
                            <input
                              type='text'
                              value={variant.sku}
                              onChange={(e) =>
                                handleUpdateVariant(
                                  variant.id,
                                  'sku',
                                  e.target.value,
                                )
                              }
                              className='w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
            </div>
          </div>
        )}

        {/* Media Upload Modal */}
        <VariantMediaModal
          isOpen={mediaModalOpen}
          onClose={() => {
            setMediaModalOpen(false);
            setSelectedVariantId(null);
          }}
          onSave={handleSaveMedia}
          initialFiles={
            selectedVariantId ? getVariantMedia(selectedVariantId) : []
          }
        />
      </div>
    );
  },
);
