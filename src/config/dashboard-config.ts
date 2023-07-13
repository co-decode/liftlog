import { Icons } from "@/components/icons"
import { AuthenticatedConfig } from "@/types"

export const dashboardConfig: AuthenticatedConfig = {
  footerItems: [
    { icon: Icons.list, href: "/sessions" },
    { icon: Icons.dumbbell, href: "/programs" },
    { icon: Icons.calendar, href: "/schedule" },
  ]
}

