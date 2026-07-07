import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { homePathFor, type Feature } from './permissions';

/**
 * Route guard by feature. Renders nested routes only when the signed-in role
 * may access `feature`; otherwise redirects to the role's home page. Assumes
 * it sits inside <RequireAuth /> (authentication is checked first).
 */
export function RequireRole({ feature }: { feature: Feature }) {
  const { can, role } = useAuth();
  if (!can(feature)) {
    return <Navigate to={homePathFor(role)} replace />;
  }
  return <Outlet />;
}
