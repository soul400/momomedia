import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

// Pages
import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import YearArchive from "@/pages/year-archive";
import MonthArchive from "@/pages/month-archive";
import SupportersPage from "@/pages/supporters-page";
import AdminPage from "@/pages/admin-page";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/archive/:year" component={YearArchive} />
      <Route path="/archive/:year/:month" component={MonthArchive} />
      <Route path="/supporters" component={SupportersPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/admin" component={AdminPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Router />
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
