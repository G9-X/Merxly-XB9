import { BarChart } from '@mui/x-charts';

const orderStatusData = [
  { status: 'Pending', count: 12 },
  { status: 'Processing', count: 28 },
  { status: 'Shipped', count: 45 },
  { status: 'Delivered', count: 156 },
  { status: 'Cancelled', count: 8 },
];

export const OrdersChart = () => {
  return (
    <div className='bg-white rounded-lg border border-neutral-200 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-neutral-900'>
          Orders by Status
        </h3>
        <p className='text-sm text-neutral-600'>Current month breakdown</p>
      </div>
      <BarChart
        xAxis={[
          {
            scaleType: 'band',
            data: orderStatusData.map((d) => d.status),
          },
        ]}
        series={[
          {
            data: orderStatusData.map((d) => d.count),
            label: 'Orders',
            color: '#7c3aed',
          },
        ]}
        height={300}
        margin={{ left: 50, right: 20, top: 20, bottom: 50 }}
      />
    </div>
  );
};
