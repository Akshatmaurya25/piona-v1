import { ServicesProvider } from "@/lib/contexts/services-context"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ServicesProvider>
      <DashboardShell>{children}</DashboardShell>
    </ServicesProvider>
  )
}
