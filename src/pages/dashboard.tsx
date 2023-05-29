import Layout from "@/components/auth-and-context"
import { dashboardConfig } from "@/config/dashboard-config";

const { navItems, footerItems } = dashboardConfig

export default function Dashboard() {

  return (
    <Layout navItems={navItems} footerItems={footerItems}>
      <div>
        placeholder
      </div>
    </Layout >
  )
}
