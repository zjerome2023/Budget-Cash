import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-indigo-600">Login</h1>
      <p className="mt-2 text-gray-600">
        Sign in to manage your expenses. Auth forms arrive in the next step.
      </p>
      <p className="mt-6 text-sm text-gray-500">
        No account?{' '}
        <Link to="/register" className="font-medium text-indigo-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
