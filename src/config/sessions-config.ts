import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const sessionsConfig: AuthenticatedConfig = {

  navItems: [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Workouts", href: "#" },
    { title: "Sessions", href: "/sessions" },
    { title: "Schedule", href: "#" },
    { title: "Community", href: "#" },
    { title: "Exercise Library", href: "#" }
  ],

  footerItems: [
    { icon: Icons.logout, href: "/sessions" },
    { icon: Icons.add, href: "/sessions/add" },
    { icon: Icons.calendar, href: "/schedule" },
  ]
}
