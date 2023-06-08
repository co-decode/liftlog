import Layout from "@/components/authenticated-layout"
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
