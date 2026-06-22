import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <Link to="/dashboard" className="text-lg font-semibold text-indigo-600">
              Budget Tracker
            </Link>
            <div className="flex gap-4 text-sm font-medium">
              <Link to="/login" className="hover:text-indigo-600">
                Login
              </Link>
              <Link to="/register" className="hover:text-indigo-600">
                Register
              </Link>
              <Link to="/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-4xl px-6 py-10">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
