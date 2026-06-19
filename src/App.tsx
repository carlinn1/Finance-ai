import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthenticatedLayout from "./layout/AuthenticatedLayout";
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage, TwoFactorPage } from "./pages/AuthPages";
import LandingPage from "./pages/LandingPage";
import { LoadingSpinner } from "./components/ui";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const AiPage = lazy(() => import("./pages/AiPage"));
const PayablesPage = lazy(() => import("./pages/PayablesPage"));
const BudgetPage = lazy(() => import("./pages/BudgetPage"));
const GoalsPage = lazy(() => import("./pages/GoalsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/two-factor" element={<TwoFactorPage />} />
      <Route element={<AuthenticatedLayout />}>
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<LazyPage><DashboardPage /></LazyPage>} />
        <Route path="/transacoes" element={<LazyPage><TransactionsPage /></LazyPage>} />
        <Route path="/contas-pagar-receber" element={<LazyPage><PayablesPage /></LazyPage>} />
        <Route path="/orcamento" element={<LazyPage><BudgetPage /></LazyPage>} />
        <Route path="/metas" element={<LazyPage><GoalsPage /></LazyPage>} />
        <Route path="/relatorios" element={<LazyPage><ReportsPage /></LazyPage>} />
        <Route path="/ia" element={<LazyPage><AiPage /></LazyPage>} />
        <Route path="/configuracoes" element={<LazyPage><SettingsPage /></LazyPage>} />
      </Route>
    </Routes>
  );
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
}
