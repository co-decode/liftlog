import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const analysisConfig: AuthenticatedConfig = {
  footerItems: [
    { icon: Icons.logout, href: "/sessions" },
    { icon: Icons.home, href: "/dashboard" },
    { icon: Icons.dumbbell, href: "/programs" },
  ]
}
