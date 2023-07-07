import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const analysisConfig: AuthenticatedConfig = {

  navItems: [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Programs", href: "/programs" },
    { title: "Sessions", href: "/sessions" },
    { title: "Schedule", href: "#" },
    { title: "Community", href: "#" },
    { title: "Exercise Library", href: "#" }
  ],

  footerItems: [
    { icon: Icons.logout, href: "/sessions" },
    { icon: Icons.home, href: "/dashboard" },
    { icon: Icons.dumbbell, href: "/programs" },
  ]
}
