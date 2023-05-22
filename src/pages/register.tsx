import { Metadata } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
//import { UserAuthForm } from "@/components/user-auth-form";
import { UserRegForm } from "@/components/user-reg-form";
import { MainNav } from "@/components/main-nav";

export const metadata: Metadata = {
  title: "Register",
  description: "Create an account",
};

const navItems = [
  { title: "Dashboard", href: "#" },
  { title: "Workouts", href: "#" },
  { title: "Sessions", href: "#" },
  { title: "Schedule", href: "#" },
  { title: "Community", href: "#" },
  { title: "Exercise Library", href: "#" },
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid grid-rows-[min-content_1fr]">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav items={navItems} />
          <nav>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "px-4"
              )}
            >
              Login
            </Link>
          </nav>
        </div>
      </header>
      <div className="container flex w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Icons.dumbbell className="mx-auto h-8 w-8" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <UserRegForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="hover:text-brand underline underline-offset-4"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="hover:text-brand underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
