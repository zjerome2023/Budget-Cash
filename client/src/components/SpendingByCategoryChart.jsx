import { Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../utils/format';
import '../utils/chartSetup';

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 12,
        padding: 16,
      },
    },
    tooltip: {
      callbacks: {
        label(context) {
          const value = context.parsed ?? 0;
          return ` ${formatCurrency(value)}`;
        },
      },
    },
  },
};

export default function SpendingByCategoryChart({ data, loading }) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        Loading chart…
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-gray-300 px-4 text-center text-sm text-gray-500">
        No spending data for this period. Add expenses to see category breakdown.
      </div>
    );
  }

  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        data: data.map((item) => item.total),
        backgroundColor: data.map((item) => item.color || '#6B7280'),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div className="h-64 w-full">
      <Doughnut data={chartData} options={CHART_OPTIONS} />
    </div>
  );
}
