import { ServicesProvider } from "@/lib/contexts/services-context"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark" style={{ colorScheme: "dark" }}>
      <ServicesProvider>
        <DashboardShell>{children}</DashboardShell>
      </ServicesProvider>
    </div>
  )
}
