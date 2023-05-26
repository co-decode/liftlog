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
  weight: z.number(),
}); 

const ExerciseSchema = z.object({
  exerciseName: z.string(),
  sets: z.array(SetSchema),
});

const ExerciseSessionSchema = z.object({
  date: z.coerce.date(),
  exercises: z.array(ExerciseSchema),
});

const UserSchema = z.object({
  email: z.string().email(),
  exerciseSessions: ExerciseSessionSchema,
})

type FormDataUserUpdate = z.infer<typeof UserSchema>;

export default function Sessions({ children }: SessionsProps) {
  //const user = await getCurrentUser()
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { data: session, status } = useSession();

  const updateSchema = useForm<FormDataUserUpdate>({
    resolver: zodResolver(UserSchema),
  });
  const router = useRouter();
  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/login");
    }
  }, [session, status, router]);

  const updateUser = trpc.sessions.updateOne.useMutation({
    onSuccess() {
      console.log("User Successfully Updated!");
    },
  });
  const getAll = trpc.users.findAll.useQuery();
  const { register, handleSubmit, watch, formState, formState: { errors } } = updateSchema;
  const watchEverything = watch();
  React.useEffect(() => {
    const subscription = watch((value, { name, type }) => console.log(value, name, type));
    return () => subscription.unsubscribe();
  }, [watch]);
  const onSubmit: SubmitHandler<FormDataUserUpdate> = async (data) => {
    setIsLoading(true);
    type Input = inferProcedureInput<AppRouter["sessions"]["updateOne"]>;
    const input: Input = data;
    try {
      console.log("I ran")
      await updateUser.mutateAsync(input);
      getAll.refetch();
    } catch (cause) {
      console.error({ cause }, "Failed to insert");
    }
    setIsLoading(false);
  };

  if (status !== "authenticated") return <div>LOADING</div>;
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav items={navItems} />
          <UserAccountNav
            user={{
              name: session?.user?.name,
              image: session?.user?.image,
              email: session?.user?.email,
            }}
          />
        </div>
      </header>
      <main className="flex w-full flex-1 flex-col overflow-hidden">
        {children}
        {getAll ? JSON.stringify(getAll.data) : null}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-72 grid gap-2">
          <div className="grid gap-2">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="email"
              type="text"
              autoCapitalize="none"
              autoComplete="none"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email")}
            />
            {formState.errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {formState.errors.email.message}
              </p>
            )}
            <Label className="" htmlFor="date">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              autoCapitalize="none"
              autoComplete="none"
              autoCorrect="off"
              disabled={isLoading}
              {...register(`exerciseSessions.date`, {valueAsDate: true})}
            />
            {formState.errors?.exerciseSessions?.date && (
              <p className="px-1 text-xs text-red-600">
                {formState.errors.exerciseSessions.date.message}
              </p>
            )}
            <Label className="" htmlFor="exerciseName">
              Exercise Name
            </Label>
            <Input
              id="exerciseName"
              type="text"
              autoCapitalize="none"
              autoComplete="none"
              autoCorrect="off"
              disabled={isLoading}
              {...register(`exerciseSessions.exercises.0.name`)}
            />
            {formState.errors?.exerciseSessions?.exercises?.[0]?.name && (
              <p className="px-1 text-xs text-red-600">
                {formState.errors.exerciseSessions.exercises[0].name.message}
              </p>
            )}
            <Label className="" htmlFor="reps">
              Reps
            </Label>
            <Input
              id="reps"
              type="number"
              autoCapitalize="none"
              autoComplete="none"
              autoCorrect="off"
              disabled={isLoading}
              {...register(`exerciseSessions.exercises.0.sets.0.reps`, {valueAsNumber:true})}
            />
            {formState.errors?.exerciseSessions?.exercises?.[0]?.sets?.[0]?.reps && (
              <p className="px-1 text-xs text-red-600">
                {formState.errors.exerciseSessions.exercises[0].sets[0].reps.message}
              </p>
            )}
            <Label className="" htmlFor="weight">
              Weight
            </Label>
            <Input
              id="weight"
              type="number"
              autoCapitalize="none"
              autoComplete="none"
              autoCorrect="off"
              disabled={isLoading}
              {...register(`exerciseSessions.exercises.0.sets.0.weight`, {valueAsNumber:true})}
            />
            {formState.errors?.exerciseSessions?.exercises?.[0]?.sets?.[0]?.weight && (
              <p className="px-1 text-xs text-red-600">
                {formState.errors.exerciseSessions.exercises[0].sets[0].weight.message}
              </p>
            )}
          </div>
          <button className={cn(buttonVariants())} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Data
          </button>
        </div>
      </form>
      </main>
      <SiteFooter className="border-t bg-background fixed bottom-0 w-full" footerItems={footerItems} />
    </div>
  );
}
