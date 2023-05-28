//import { DashboardNav } from "@/components/nav"
import { trpc } from "@/utils/trpc";
import { Icons } from "@/components/icons";
import { MainNav } from "@/components/main-nav";
import { SiteFooter } from "@/components/site-footer";
import { UserAccountNav } from "@/components/user-account-nav";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { inferProcedureInput } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/sessions-table";
import { columns } from "@/components/sessions-columns";

const navItems = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Workouts", href: "#" },
  { title: "Sessions", href: "/sessions" },
  { title: "Schedule", href: "#" },
  { title: "Community", href: "#" },
  { title: "Exercise Library", href: "#" },
];

const footerItems = [
  { icon: <Icons.logout />, href: "/dashboard" },
  { icon: <Icons.add />, href: "/sessions/add" },
  { icon: <Icons.calendar />, href: "/schedule" },
];

interface SessionsProps {
  children?: React.ReactNode;
}

const SetSchema = z.object({
  reps: z.number(),
  weight: z.string(),
});

const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.array(SetSchema),
});

const ExerciseSessionSchema = z.object({
  date: z.string(),
  exercises: z.array(ExerciseSchema),
});

export type Schema = z.infer<typeof ExerciseSessionSchema>

//type FormDataUserUpdate = z.infer<typeof UserSchema>;

export default function Sessions({ children }: SessionsProps) {
  const { data: session, status } = useSession();

  // const updateSchema = useForm<FormDataUserUpdate>({
  //   resolver: zodResolver(UserSchema),
  // });
  const router = useRouter();
  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/login");
    }
  }, [session, status, router]);

  // session.user.email
  const getSessions = trpc.users.findAll.useQuery("cody@cody.com");

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav items={navItems} />
          {status !== "authenticated" ? null : (
            <UserAccountNav
              user={{
                name: session?.user?.name,
                image: session?.user?.image,
                email: session?.user?.email,
              }}
            />
          )}
        </div>
      </header>
      <main className="flex w-full flex-1 flex-col overflow-hidden">
        {
 // THIS should be used for layout: children
          // <>{getAll ? JSON.stringify(getAll.data) : null}</>
        }
        {status !== "authenticated" ? null : (
          <>
          {getSessions.data &&
            <DataTable className="mx-2" columns={columns} data={getSessions.data.exerciseSessions}/>
          }
          </>
        )}
      </main>
      <SiteFooter
        className="border-t bg-background fixed bottom-0 w-full"
        footerItems={footerItems}
        loading={status !== "authenticated"}
      />
    </div>
  );
}
/*
            {getSessions.data?.exerciseSessions.map((sess, ind) => {
              return (
                <div key={sess.date + String(ind)} className="container mx-auto py-10">
                  <p>{new Date(sess.date).toLocaleString()}</p>
                </div>
              )
            })}
            */
