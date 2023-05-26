import { Metadata } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { UserAuthForm } from "@/components/user-auth-form";
import { MainNav } from "@/components/main-nav";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

const navItems = [
  { title: "Dashboard", href: "#" },
  { title: "Workouts", href: "#" },
  { title: "Sessions", href: "#" },
  { title: "Schedule", href: "#" },
  { title: "Community", href: "#" },
  { title: "Exercise Library", href: "#" },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-rows-[min-content_1fr]">
      <header className="container z-40 bg-background">
        <div className="flex h-16 items-center justify-between py-4">
          <MainNav items={navItems} />
          <nav>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "px-3"
              )}
            >
              <Icons.chevronLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </nav>
        </div>
      </header>
      <div className="container flex w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Icons.dumbbell className="mx-auto h-8 w-8" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to sign in
            </p>
          </div>
          <UserAuthForm />
          <p className="px-8 pb-4 text-center text-sm text-muted-foreground">
            <Link
              href="/register"
              className="hover:text-brand underline underline-offset-4"
            >
              Don&apos;t have an account? Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
