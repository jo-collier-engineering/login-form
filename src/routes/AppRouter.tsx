import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BlobLayout from "../layouts/BlobLayout/BlobLayout";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<BlobLayout />}>
        <Route index element={<Navigate to="/credentials" replace />} />
        <Route path="credentials" element={<div>Credentials Page Placeholder</div>} />
        <Route path="forgot-password" element={<div>Forgot Password Page Placeholder</div>} />
        <Route path="dashboard" element={<div>Dashboard Page Placeholder</div>} />
        <Route path="*" element={<Navigate to="/credentials" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;