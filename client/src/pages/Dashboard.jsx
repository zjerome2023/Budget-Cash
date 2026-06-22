import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-indigo-600">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Your expense summary, charts, and transaction list will appear here.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-md bg-indigo-50 p-4">
          <p className="text-sm font-medium text-indigo-800">Total spent</p>
          <p className="mt-1 text-2xl font-semibold text-indigo-600">—</p>
        </div>
        <div className="rounded-md bg-indigo-50 p-4">
          <p className="text-sm font-medium text-indigo-800">Transactions</p>
          <p className="mt-1 text-2xl font-semibold text-indigo-600">—</p>
        </div>
        <div className="rounded-md bg-indigo-50 p-4">
          <p className="text-sm font-medium text-indigo-800">Top category</p>
          <p className="mt-1 text-2xl font-semibold text-indigo-600">—</p>
        </div>
      </div>
      <p className="mt-6 text-sm text-gray-500">
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Log in
        </Link>{' '}
        to sync with the API.
      </p>
    </div>
  );
}
