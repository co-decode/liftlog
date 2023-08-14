import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const programsConfig: AuthenticatedConfig = {
  footerItems: [
    { icon: Icons.logout, href: "/programs" },
    { icon: Icons.home, href: "/dashboard" },
    { icon: Icons.list, href: "/sessions" },
  ]
}
