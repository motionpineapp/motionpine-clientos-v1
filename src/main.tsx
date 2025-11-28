import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/app/auth/LoginPage';
import SetupPage from '@/app/auth/SetupPage';
import { AdminDashboard } from '@/app/admin/dashboard/AdminDashboard';
import { ClientDashboard } from '@/app/client/dashboard/ClientDashboard';
import { ClientsPage } from '@/app/admin/clients/ClientsPage';
import { ProjectsPage } from '@/app/admin/projects/ProjectsPage';
import { ProjectDetailPage } from '@/app/admin/projects/ProjectDetailPage';
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
import { useSettingsStore } from '@/services/settings';

function RootLayout() {
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    // Update document title
    document.title = settings.meta_title || 'MotionPine ClientOS';

    // Update favicon
    if (settings.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.favicon_url;
    }

    // Update meta description
    if (settings.meta_description) {
      let meta = document.querySelector("meta[name='description']") as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
      meta.content = settings.meta_description;
    }
  }, [settings]);

  return (
    <ErrorBoundary>
      <Toaster richColors position="top-center" />
      <Outlet />
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage />, errorElement: <RouteErrorBoundary /> },
      { path: "login", element: <LoginPage />, errorElement: <RouteErrorBoundary /> },
      { path: "client/setup", element: <SetupPage />, errorElement: <RouteErrorBoundary /> },
      // Admin Routes
      {
        path: "admin",
        element: <ProtectedRoute role="admin" />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "clients", element: <ClientsPage /> },
          { path: "projects", element: <ProjectsPage /> },
          { path: "projects/:id", element: <ProjectDetailPage /> },
          { path: "chat", element: <ChatPage /> },
          { path: "expenses", element: <ExpensesPage /> },
          { path: "teams", element: <TeamsPage /> },
          { path: "settings", element: <SettingsPage /> },
        ]
      },
      // Client Routes
      {
        path: "client",
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
      { path: "*", element: <Navigate to="/" replace /> },
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)