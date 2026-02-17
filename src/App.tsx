import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

// Eagerly loaded (above the fold)
import Index from "./pages/Index";

// Lazy loaded (below the fold / secondary routes)
const VehicleDetail = lazy(() => import("./pages/VehicleDetail"));
const VehicleListing = lazy(() => import("./pages/VehicleListing"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const MyAccount = lazy(() => import("./pages/MyAccount"));

// Admin (lazy)
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminVehicles = lazy(() => import("./pages/admin/AdminVehicles"));
const AdminVehicleAdd = lazy(() => import("./pages/admin/AdminVehicleAdd"));
const AdminVehicleEdit = lazy(() => import("./pages/admin/AdminVehicleEdit"));
const AdminRentals = lazy(() => import("./pages/admin/AdminRentals"));
const AdminSales = lazy(() => import("./pages/admin/AdminSales"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminFAQ = lazy(() => import("./pages/admin/AdminFAQ"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));

const queryClient = new QueryClient();

// Loading fallback
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="font-body text-sm text-muted-foreground">Memuat...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/kendaraan" element={<VehicleListing />} />
                <Route path="/kendaraan/:id" element={<VehicleDetail />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/daftar" element={<Register />} />

                {/* Member (protected) */}
                <Route
                  path="/akun"
                  element={
                    <ProtectedRoute>
                      <MyAccount />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes (protected, admin only) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="kendaraan" element={<AdminVehicles />} />
                  <Route path="kendaraan/baru" element={<AdminVehicleAdd />} />
                  <Route path="kendaraan/:id/edit" element={<AdminVehicleEdit />} />
                  <Route path="sewa" element={<AdminRentals />} />
                  <Route path="penjualan" element={<AdminSales />} />
                  <Route path="laporan" element={<AdminReports />} />
                  <Route path="testimoni" element={<AdminTestimonials />} />
                  <Route path="faq" element={<AdminFAQ />} />
                  <Route path="pelanggan" element={<AdminCustomers />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
