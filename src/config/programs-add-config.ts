import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const programsAddConfig: AuthenticatedConfig = {

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
    { icon: Icons.dumbbell, href: "/programs" },
    { icon: Icons.list, href: "/sessions" },
  ]
}
