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
import { ClientDetailPage } from '@/app/admin/clients/ClientDetailPage';
import { ProjectsPage } from '@/app/admin/projects/ProjectsPage';
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
      { path: "clients/:id", element: <ClientDetailPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "chat", element: <div>Chat Module (Coming Soon)</div> },
      { path: "expenses", element: <div>Expenses Module (Coming Soon)</div> },
      { path: "teams", element: <div>Teams Module (Coming Soon)</div> },
      { path: "settings", element: <div>Settings Module (Coming Soon)</div> },
    ]
  },
  // Client Routes
  {
    path: "/client",
    element: <ProtectedRoute role="client" />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "dashboard", element: <ClientDashboard /> },
      { path: "projects", element: <div>Projects Module (Coming Soon)</div> },
      { path: "chat", element: <div>Chat Module (Coming Soon)</div> },
      { path: "intake", element: <div>Intake Module (Coming Soon)</div> },
      { path: "settings", element: <div>Settings Module (Coming Soon)</div> },
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