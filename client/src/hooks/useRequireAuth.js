import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import LoginPrompt from '../components/LoginPrompt';

export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function requireAuth(onAuthed, message) {
    if (!isAuthenticated) {
      navigate('/login', {
        replace: false,
        state: { from: { pathname: window.location.pathname }, message },
      });
      return false;
    }
    onAuthed();
    return true;
  }

  return { isAuthenticated, requireAuth, LoginPrompt };
}
