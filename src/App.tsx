import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/store/AppContext";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import InvoicesPage from "@/pages/InvoicesPage";
import InvoiceFormPage from "@/pages/InvoiceFormPage";
import QuotationsPage from "@/pages/QuotationsPage";
import QuotationFormPage from "@/pages/QuotationFormPage";
import ClientsPage from "@/pages/ClientsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/invoices/new" element={<InvoiceFormPage />} />
              <Route path="/invoices/:id/edit" element={<InvoiceFormPage />} />
              <Route path="/invoices/:id" element={<InvoicesPage />} />
              <Route path="/quotations" element={<QuotationsPage />} />
              <Route path="/quotations/new" element={<QuotationFormPage />} />
              <Route path="/quotations/:id/edit" element={<QuotationFormPage />} />
              <Route path="/quotations/:id" element={<QuotationsPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
