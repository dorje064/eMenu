import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '../auth/RequireAuth';
import { RequireRole } from '../auth/RequireRole';
import { DashboardLayout } from '../components/DashboardLayout';
import { CategoriesPage } from '../pages/CategoriesPage';
import { DashboardHome } from '../pages/DashboardPage';
import { ExpensesPage } from '../pages/ExpensesPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { MenuPage } from '../pages/MenuPage';
import { OrdersPage } from '../pages/OrdersPage';
import { StaffPage } from '../pages/StaffPage';
import { TablesPage } from '../pages/TablesPage';
import { UnseenOrdersProvider } from '../notifications/UnseenOrdersContext';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route
          element={
            <UnseenOrdersProvider>
              <DashboardLayout />
            </UnseenOrdersProvider>
          }
        >
          {/* Open to every authenticated role. */}
          <Route path="/orders" element={<OrdersPage />} />

          {/* Role-gated areas. A user without access is redirected to their
              role's home page by RequireRole. */}
          <Route element={<RequireRole feature="dashboard" />}>
            <Route path="/" element={<DashboardHome />} />
          </Route>
          <Route element={<RequireRole feature="menu" />}>
            <Route path="/menu" element={<MenuPage />} />
          </Route>
          <Route element={<RequireRole feature="categories" />}>
            <Route path="/categories" element={<CategoriesPage />} />
          </Route>
          <Route element={<RequireRole feature="expenses" />}>
            <Route path="/expenses" element={<ExpensesPage />} />
          </Route>
          <Route element={<RequireRole feature="inventory" />}>
            <Route path="/inventory" element={<InventoryPage />} />
          </Route>
          <Route element={<RequireRole feature="tables" />}>
            <Route path="/tables" element={<TablesPage />} />
          </Route>
          <Route element={<RequireRole feature="staff" />}>
            <Route path="/staff" element={<StaffPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
