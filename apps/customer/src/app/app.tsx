import { Navigate, Route, Routes } from 'react-router-dom';
import { MenuPage } from '../pages/MenuPage';
import { MyOrdersPage } from '../pages/MyOrdersPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/orders" element={<MyOrdersPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
