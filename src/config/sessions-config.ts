import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const sessionsConfig: AuthenticatedConfig = {
  footerItems: [
    { icon: Icons.home, href: "/dashboard" },
    { icon: Icons.add, href: "/sessions/add" },
    { icon: Icons.graph, href: "/analysis" },
  ]
}
