import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const programsAddConfig: AuthenticatedConfig = {
  footerItems: [
    { icon: Icons.logout, href: "/dashboard" },
    { icon: Icons.dumbbell, href: "/programs" },
    { icon: Icons.list, href: "/sessions" },
  ]
}
