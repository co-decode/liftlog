import { Icons } from "@/components/icons"
import { FooterConfig, NavConfig } from "@/types"

interface DashboardConfig {
  navItems: NavConfig
  footerItems: FooterConfig
}

export const dashboardConfig: DashboardConfig = {

  navItems: [
    { title: "Dashboard", href: "#" },
    { title: "Workouts", href: "#" },
    { title: "Sessions", href: "#" },
    { title: "Schedule", href: "#" },
    { title: "Community", href: "#" },
    { title: "Exercise Library", href: "#" }
  ],

  footerItems: [
    { icon: <Icons.list />, href: "/sessions" },
    { icon: <Icons.dumbbell />, href: "/programs" },
    { icon: <Icons.calendar />, href: "/schedule" },
  ]
}

