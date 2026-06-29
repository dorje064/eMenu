import { Navigate, Route, Routes } from 'react-router-dom';
import { MenuPage } from '../pages/MenuPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
