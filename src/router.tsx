import type { ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import AdminLayout from "@/layouts/AdminLayout";
import LoginPage from "@/pages/LoginPage";
import { Loading } from "@/components/admin/parts";

// Console pages load on demand, so sign-in does not download recharts and the other page code.
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
});

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/admin/login" replace /> },

  // Sign-in screens: no sidebar, no auth guard.
  { path: "/admin/login", element: <LoginPage /> },
  { path: "/admin/forgot-password", lazy: page(() => import("@/pages/ForgotPasswordPage")) },
  { path: "/admin/reset-password/:token", lazy: page(() => import("@/pages/ResetPasswordPage")) },

  // Console pages: AdminLayout checks the session and renders the sidebar around them.
  {
    path: "/admin",
    element: <AdminLayout />,
    hydrateFallbackElement: <Loading />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", lazy: page(() => import("@/pages/DashboardPage")) },
      { path: "users", lazy: page(() => import("@/pages/UsersPage")) },
      { path: "ai-safety", lazy: page(() => import("@/pages/AiSafetyPage")) },
      { path: "community", lazy: page(() => import("@/pages/CommunityPage")) },
      { path: "learning", lazy: page(() => import("@/pages/LearningPage")) },
      { path: "services", lazy: page(() => import("@/pages/ServicesPage")) },
      { path: "profile", lazy: page(() => import("@/pages/ProfilePage")) },
    ],
  },

  { path: "*", element: <Navigate to="/admin/login" replace /> },
]);
