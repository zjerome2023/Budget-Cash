import { Link } from 'react-router-dom';

export default function LoginPrompt({
  message = 'Please log in to perform this action.',
}) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p>{message}</p>
      <Link
        to="/login"
        className="mt-2 inline-block font-medium text-indigo-600 hover:underline"
      >
        Go to login
      </Link>
    </div>
  );
}
