import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-indigo-600">Register</h1>
      <p className="mt-2 text-gray-600">
        Create an account to start tracking spending. Registration form coming soon.
      </p>
      <p className="mt-6 text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
