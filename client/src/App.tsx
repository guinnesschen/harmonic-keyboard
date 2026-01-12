import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/pages/MainLayout";
import NotFound from "@/pages/not-found";
import V2Root from "@/v2/ui/pages/Root";

function Router() {
  return (
    <Switch>
      <Route path="/" component={MainLayout} />
      <Route path="/v2" component={V2Root} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
