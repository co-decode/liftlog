import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const sessionsEditConfig: AuthenticatedConfig = {
  footerItems: [
    { icon: Icons.home, href: "/dashboard" },
    { icon: Icons.logout, href: "/sessions" },
    { icon: Icons.calendar, href: "/schedule" },
  ]
}
