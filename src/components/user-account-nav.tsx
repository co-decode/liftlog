"use client";

import Link from "next/link";
import { User } from "next-auth";
import { signOut } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/icons";
import { UserAvatar } from "@/components/user-avatar";
import { ModeToggle } from "./mode-toggle";
//import { useRouter } from "next/router";

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Pick<User, "name" | "image" | "email">;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  //const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{ name: user.name || null, image: user.image || null }}
          className="h-8 w-8"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none w-32">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-full truncate text-sm text-muted-foreground overflow-ellipsis">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
          <Icons.home className="w-4 h-4 mr-2"/>
          Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/programs">
          <Icons.dumbbell className="w-4 h-4 mr-2"/>
          Programs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/sessions">
          <Icons.list className="w-4 h-4 mr-2"/>
          Sessions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/analysis">
          <Icons.graph className="w-4 h-4 mr-2"/>
          Analysis
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/schedule">
          <Icons.calendar className="w-4 h-4 mr-2"/>
          Schedule
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Icons.settings className="w-4 h-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
          <ModeToggle />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={async (event) => {
            event.preventDefault();
            const data = await signOut({
              //callbackUrl: `${window.location.origin}/login`,
              redirect: false,
            });
            //router.push(data.url)
          }}
        >
          <Icons.logout className="w-4 h-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
