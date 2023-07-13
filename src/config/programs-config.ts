import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const programsConfig: AuthenticatedConfig = {
  footerItems: [
    { icon: Icons.logout, href: "/dashboard" },
    { icon: Icons.add, href: "/programs/add" },
    { icon: Icons.list, href: "/sessions" },
  ]
}
