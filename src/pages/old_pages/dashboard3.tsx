"use client"

import { buttonVariants } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav";
import { cn } from "@/lib/utils";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { useEffect } from "react";

const navItems = [
    { title: "Dashboard", href: "#" },
    { title: "Workouts", href: "#" },
    { title: "Sessions", href: "#" },
    { title: "Schedule", href: "#" },
    { title: "Community", href: "#" },
    { title: "Exercise Library", href: "#" }
]

export default function IndexPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (!session && status !== "loading") {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status !== "authenticated") return (
    <div>LOADING</div>
    )

  return (
    <>
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav items={navItems}/>
          <nav>
            <div
              onClick={() => signOut({ callbackUrl: 'http://localhost:3000/' })}
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "px-4"
              )}
            >
              Logged
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
