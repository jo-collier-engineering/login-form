import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CredentialsPage from "../pages/CredentialsPage/CredentialsPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage/ForgotPasswordPage";
import LandingPage from "../pages/LandingPage/LandingPage";
import BlobLayout from "../layouts/BlobLayout/BlobLayout";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<BlobLayout />}>
        <Route index element={<Navigate to="/credentials" replace />} />
        <Route path="credentials" element={<CredentialsPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="dashboard" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/credentials" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;