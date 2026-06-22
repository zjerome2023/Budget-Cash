import { Bar } from 'react-chartjs-2';
import { formatCurrency } from '../utils/format';
import '../utils/chartSetup';

function formatPeriodLabel(period) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    const [year, month, day] = period.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }

  return period;
}

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        title(items) {
          const period = items[0]?.label;
          return period ? formatPeriodLabel(period) : '';
        },
        label(context) {
          return ` ${formatCurrency(context.parsed.y)}`;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 0,
        callback(value, index, ticks) {
          const label = ticks[index]?.label;
          return label ? formatPeriodLabel(String(label)) : value;
        },
      },
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback(value) {
          return formatCurrency(value);
        },
      },
    },
  },
};

export default function SpendingOverTimeChart({ data, loading }) {
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
        No spending data for this period. Add expenses to see trends over time.
      </div>
    );
  }

  const chartData = {
    labels: data.map((item) => item.period),
    datasets: [
      {
        label: 'Spending',
        data: data.map((item) => item.total),
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="h-64 w-full">
      <Bar data={chartData} options={CHART_OPTIONS} />
    </div>
  );
}
