import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/app/auth/LoginPage';
import { AdminDashboard } from '@/app/admin/dashboard/AdminDashboard';
import { ClientDashboard } from '@/app/client/dashboard/ClientDashboard';
import { ClientsPage } from '@/app/admin/clients/ClientsPage';
import { ProjectsPage } from '@/app/admin/projects/ProjectsPage';
import { ChatPage } from '@/app/admin/chat/ChatPage';
import { ExpensesPage } from '@/app/admin/expenses/ExpensesPage';
import { TeamsPage } from '@/app/admin/teams/TeamsPage';
import { SettingsPage } from '@/app/admin/settings/SettingsPage';
import { ClientProjectsPage } from '@/app/client/projects/ClientProjectsPage';
import { ClientChatPage } from '@/app/client/chat/ClientChatPage';
import { IntakePage } from '@/app/client/intake/IntakePage';
import { ClientSettingsPage } from '@/app/client/settings/ClientSettingsPage';
import { WalletPage } from '@/app/client/wallet/WalletPage';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  // Admin Routes
  {
    path: "/admin",
    element: <ProtectedRoute role="admin" />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "clients", element: <ClientsPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "expenses", element: <ExpensesPage /> },
      { path: "teams", element: <TeamsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ]
  },
  // Client Routes
  {
    path: "/client",
    element: <ProtectedRoute role="client" />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "dashboard", element: <ClientDashboard /> },
      { path: "projects", element: <ClientProjectsPage /> },
      { path: "chat", element: <ClientChatPage /> },
      { path: "intake", element: <IntakePage /> },
      { path: "settings", element: <ClientSettingsPage /> },
      { path: "wallet", element: <WalletPage /> },
    ]
  },
  // Fallback
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </ErrorBoundary>
  </StrictMode>,
)