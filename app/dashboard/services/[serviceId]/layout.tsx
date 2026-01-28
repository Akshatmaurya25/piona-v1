export default async function ServiceLayout({
  children,
}: {
  children: React.ReactNode
  params: Promise<{ serviceId: string }>
}) {
  return <>{children}</>
}
