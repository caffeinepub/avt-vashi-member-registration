import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import Layout from './components/Layout';
import RegisterPage from './pages/RegisterPage';
import MembersPage from './pages/MembersPage';
import BulkUploadPage from './pages/BulkUploadPage';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

// Register route (default)
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

// Members route
const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/members',
  component: MembersPage,
});

// Bulk Upload route
const bulkUploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bulk-upload',
  component: BulkUploadPage,
});

// Index redirect to /register
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/register' });
  },
});

const routeTree = rootRoute.addChildren([indexRoute, registerRoute, membersRoute, bulkUploadRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
