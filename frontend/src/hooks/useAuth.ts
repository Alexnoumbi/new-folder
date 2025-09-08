import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setUser, logout, clearError } from '../store/slices/authSlice';

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  return {
    ...auth,
    isAuthenticated: true, // Toujours authentifié
    setUser: (user: any) => dispatch(setUser(user)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  };
};
