import { Button, buttonVariants } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav";
import { cn } from "@/lib/utils";
import localFont from "next/font/local"
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Icons } from "@/components/icons";

const fontHeading = localFont({
  src: "../../public/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
})

export default function IndexPage() {
  const { data: session, status } = useSession();

  const router = useRouter();
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <>
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav />
          <nav>
            <Link
              aria-label="disableable"
              href="/login"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                status === "loading" && "pointer-events-none",
                "px-4"
              )}
            >
              Login
            </Link>
          </nav>
        </div>
      </header>
      <section className="grid justify-items-center gap-2 sm:gap-3 lg:gap-4 py-5">
        <h1 className={cn("scroll-m-20 text-5xl font-heading md:text-6xl lg:text-7xl", fontHeading.className)}>
          LiftLog
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 pb-3">
          Log your Lifts with LiftLog.
        </p>
        <div className="space-x-4">
          <Link
            aria-label="disableable"
            href="/login"
            className={cn(buttonVariants({ size: "lg" }), status === "loading" && "pointer-events-none")}>
            Get Started
          </Link>
          <Link
            aria-label="disableable"
            href={"https://github.com/co-decode/liftlog"}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), status === "loading" && "pointer-events-none")}
          >
            GitHub
          </Link>
        </div>
        <Link href="/login"
          aria-label="disableable"
          className={cn(buttonVariants({ variant: "destructive", size: "lg" }),
            status === "loading" && "pointer-events-none",
            "w-[271px]")}
        >
          Trial with a Test Account
        </Link>
      </section>
      <section id="about" className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className={cn("text-3xl leading-[1.1] sm:text-3xl md:text-6xl", fontHeading.className)}>
            Check it out
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            View a demonstration of LiftLog&apos;s features.
          </p>
          <Link
            aria-label="disableable"
            href="https://cody-ross.net/liftlog"
            className={cn(status === "loading" && "pointer-events-none")}
            target="_blank"
          >
            <Button
              disabled={status === "loading"}
              role="link"
            >
              Demonstration
              <Icons.arrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section >
      <section
        id="features"
        className="container space-y-6 bg-slate-50 py-6 dark:bg-transparent md:py-12 lg:py-24"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className={cn("font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl", fontHeading.className)}>
            Features
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            This project is a free and open-source weightlifting application.
            Create workout programs and use them to perform and record workouts.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.dumbbell className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">Training Programs</h3>
                <p className="text-sm text-muted-foreground">
                  Create a program to structure your training.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.timer className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">Workout Aide</h3>
                <p className="text-sm">
                  Record your performance as you workout.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.calendar className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  Track upcoming and previous workout sessions.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.graph className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">Visualisation</h3>
                <p className="text-sm text-muted-foreground">
                  Analyse your training data and progress.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.list className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">Log</h3>
                <p className="text-sm text-muted-foreground">
                  Filter and search through training sessions.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-12 w-12"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>              <div className="space-y-2">
                <h3 className="font-bold">Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple authentication flows for ease of use.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*
    */}
    </>
  );
}
