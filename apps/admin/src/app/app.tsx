import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '../auth/RequireAuth';
import { DashboardLayout } from '../components/DashboardLayout';
import { CategoriesPage } from '../pages/CategoriesPage';
import { DashboardHome } from '../pages/DashboardHome';
import { LoginPage } from '../pages/LoginPage';
import { MenuPage } from '../pages/MenuPage';
import { TablesPage } from '../pages/TablesPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/tables" element={<TablesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
