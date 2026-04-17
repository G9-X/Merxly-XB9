import { Input } from '../ui/Input';
import { ProductCategorySelector } from './ProductCategorySelector';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useEffect, useRef } from 'react';

interface ProductBasicInfoProps {
  productName: string;
  description: string;
  categoryId: string | null;
  onProductNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (categoryId: string) => void;
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'link',
];

export const ProductBasicInfo = ({
  productName,
  description,
  categoryId,
  onProductNameChange,
  onDescriptionChange,
  onCategoryChange,
}: ProductBasicInfoProps) => {
  const quillRef = useRef<ReactQuill>(null);

  // Sync ReactQuill editor content when description prop changes
  // This ensures the editor updates when loading product data in edit mode
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const currentContent = editor.root.innerHTML;
      // Only update if content differs to avoid unnecessary re-renders
      if (currentContent !== description) {
        editor.root.innerHTML = description;
      }
    }
  }, [description]);

  return (
    <div className='bg-white rounded-lg border border-neutral-200 p-6'>
      <h2 className='text-base font-semibold text-neutral-900 mb-4'>
        Basic Information
      </h2>

      <div className='space-y-4'>
        <Input
          label='Product Name'
          value={productName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onProductNameChange(e.target.value)}
          placeholder='e.g. Classic T-Shirt'
        />

        <div>
          <label className='block text-sm font-medium text-neutral-700 mb-1'>
            Description
          </label>
          <ReactQuill
            ref={quillRef}
            theme='snow'
            value={description}
            onChange={onDescriptionChange}
            modules={quillModules}
            formats={quillFormats}
            className='bg-white'
          />
        </div>

        <ProductCategorySelector
          selectedCategoryId={categoryId}
          onSelectCategory={onCategoryChange}
        />
      </div>
    </div>
  );
};
