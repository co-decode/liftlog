import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const programsConfig: AuthenticatedConfig = {

  navItems: [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Workouts", href: "#" },
    { title: "Sessions", href: "/sessions" },
    { title: "Schedule", href: "#" },
    { title: "Community", href: "#" },
    { title: "Exercise Library", href: "#" }
  ],

  footerItems: [
    { icon: Icons.logout, href: "/dashboard" },
    { icon: Icons.add, href: "/programs/add" },
    { icon: Icons.list, href: "/sessions" },
  ]
}
