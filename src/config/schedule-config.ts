import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const scheduleConfig: AuthenticatedConfig = {
  footerItems: [
    { icon: Icons.home, href: "/dashboard" },
    { icon: Icons.list, href: "/sessions" },
    { icon: Icons.settings, href: "/settings" },
  ]
}
