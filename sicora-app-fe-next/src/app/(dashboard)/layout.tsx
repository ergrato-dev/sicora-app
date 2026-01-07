import { DashboardLayout } from '@/components/layout/DashboardLayout';

/**
 * Layout para rutas del dashboard (autenticadas)
 * Aplica Sidebar + Header a todas las páginas hijas
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
