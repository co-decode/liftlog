import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const programsConfig: AuthenticatedConfig = {
  footerItems: [
    { icon: Icons.home, href: "/dashboard" },
    { icon: Icons.add, href: "/programs/add" },
    { icon: Icons.list, href: "/sessions" },
  ]
}
