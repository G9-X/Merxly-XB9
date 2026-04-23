import { LineChart } from '@mui/x-charts';

const revenueData = [
  { month: 'Jan', revenue: 12000, orders: 45 },
  { month: 'Feb', revenue: 15000, orders: 52 },
  { month: 'Mar', revenue: 13500, orders: 48 },
  { month: 'Apr', revenue: 18000, orders: 65 },
  { month: 'May', revenue: 21000, orders: 72 },
  { month: 'Jun', revenue: 24000, orders: 85 },
  { month: 'Jul', revenue: 22000, orders: 78 },
  { month: 'Aug', revenue: 26000, orders: 92 },
  { month: 'Sep', revenue: 28000, orders: 98 },
  { month: 'Oct', revenue: 31000, orders: 110 },
  { month: 'Nov', revenue: 33000, orders: 118 },
  { month: 'Dec', revenue: 35000, orders: 125 },
];

export const RevenueChart = () => {
  return (
    <div className='bg-white rounded-lg border border-neutral-200 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-neutral-900'>
          Revenue Overview
        </h3>
        <p className='text-sm text-neutral-600'>Monthly revenue and orders</p>
      </div>
      <LineChart
        xAxis={[
          {
            scaleType: 'point',
            data: revenueData.map((d) => d.month),
          },
        ]}
        series={[
          {
            data: revenueData.map((d) => d.revenue),
            label: 'Revenue ($)',
            color: '#7c3aed',
            curve: 'natural',
          },
        ]}
        height={300}
        margin={{ left: 70, right: 20, top: 20, bottom: 30 }}
        sx={{
          '.MuiLineElement-root': {
            strokeWidth: 2,
          },
          '.MuiMarkElement-root': {
            scale: '0.8',
            fill: '#7c3aed',
            strokeWidth: 2,
          },
        }}
      />
    </div>
  );
};
