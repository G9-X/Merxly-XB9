import { PieChart } from '@mui/x-charts';

const categoryData = [
  { id: 0, value: 35000, label: 'Electronics' },
  { id: 1, value: 28000, label: 'Accessories' },
  { id: 2, value: 18000, label: 'Audio' },
  { id: 3, value: 15000, label: 'Computers' },
  { id: 4, value: 12000, label: 'Gaming' },
];

export const CategoryPerformance = () => {
  return (
    <div className='bg-white rounded-lg border border-neutral-200 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-neutral-900'>
          Sales by Category
        </h3>
        <p className='text-sm text-neutral-600'>Revenue distribution</p>
      </div>
      <div className='flex items-center justify-center'>
        <PieChart
          series={[
            {
              data: categoryData,
            },
          ]}
          height={300}
          margin={{ top: 20, bottom: 80, left: 20, right: 20 }}
        />
      </div>
      <div className='mt-4 pt-4 border-t border-neutral-200'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-neutral-600'>Total Revenue</span>
          <span className='font-bold text-neutral-900'>
            $
            {categoryData
              .reduce((sum, cat) => sum + cat.value, 0)
              .toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
