import { createRouter, RouterProvider, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import Schedule from './pages/Schedule';
import Inventory from './pages/Inventory';
import InventoryDetail from './pages/InventoryDetail';
import Technicians from './pages/Technicians';
import TechnicianDetail from './pages/TechnicianDetail';
import Reports from './pages/Reports';
import LoginPage from './pages/LoginPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

// Root route
const rootRoute = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}

// Auth layout route
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth-layout',
  component: AuthLayout,
});

function AuthLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      {showProfileSetup && (
        <ProfileSetupModal
          onSave={async (profile) => {
            await saveProfile.mutateAsync(profile);
          }}
          isSaving={saveProfile.isPending}
        />
      )}
    </>
  );
}

// Define all routes
const dashboardRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/', component: Dashboard });
const jobsRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/jobs', component: Jobs });
const jobDetailRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/jobs/$id', component: JobDetail });
const customersRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/customers', component: Customers });
const customerDetailRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/customers/$id', component: CustomerDetail });
const invoicesRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/invoices', component: Invoices });
const invoiceDetailRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/invoices/$id', component: InvoiceDetail });
const scheduleRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/schedule', component: Schedule });
const inventoryRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/inventory', component: Inventory });
const inventoryDetailRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/inventory/$id', component: InventoryDetail });
const techniciansRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/technicians', component: Technicians });
const technicianDetailRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/technicians/$id', component: TechnicianDetail });
const reportsRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/reports', component: Reports });

const routeTree = rootRoute.addChildren([
  authLayoutRoute.addChildren([
    dashboardRoute,
    jobsRoute,
    jobDetailRoute,
    customersRoute,
    customerDetailRoute,
    invoicesRoute,
    invoiceDetailRoute,
    scheduleRoute,
    inventoryRoute,
    inventoryDetailRoute,
    techniciansRoute,
    technicianDetailRoute,
    reportsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
