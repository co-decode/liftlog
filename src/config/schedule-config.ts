import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const scheduleConfig: AuthenticatedConfig = {

  navItems: [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Workouts", href: "#" },
    { title: "Sessions", href: "/sessions" },
    { title: "Schedule", href: "#" },
    { title: "Community", href: "#" },
    { title: "Exercise Library", href: "#" }
  ],

  footerItems: [
    { icon: Icons.home, href: "/dashboard" },
    { icon: Icons.list, href: "/sessions" },
    { icon: Icons.settings, href: "/settings" },
  ]
}
