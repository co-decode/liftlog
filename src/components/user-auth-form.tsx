"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const userAuthCredSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

const userAuthEmailSchema = z.object({
  email: z.string().email(),
});

type FormDataCred = z.infer<typeof userAuthCredSchema>;
type FormDataEmail = z.infer<typeof userAuthEmailSchema>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const credSchema = useForm<FormDataCred>({
    resolver: zodResolver(userAuthCredSchema),
  });
  const emailSchema = useForm<FormDataEmail>({
    resolver: zodResolver(userAuthEmailSchema),
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGitHubLoading, setIsGitHubLoading] = React.useState<boolean>(false);
  const [isNetlifyLoading, setIsNetlifyLoading] =
    React.useState<boolean>(false);
  const searchParams = useSearchParams();

  async function onSubmitCreds(data: FormDataCred) {
    setIsLoading(true);

    const signInResult = await signIn("credentials", {
      identifier: data.identifier.toLowerCase(),
      redirect: true,
      callbackUrl: searchParams?.get("from") || "/dashboard",
    });

    setIsLoading(false);

    if (!signInResult?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Your sign in request failed. Please try again.",
        variant: "destructive",
      });
    }
    /*
    return toast({
      title: "Check your credentials",
      description: "",
    })
    */
  }

  async function onSubmitEmail(data: FormDataEmail) {
    setIsLoading(true);

    const signInResult = await signIn("email", {
      email: data.email.toLowerCase(),
      redirect: false,
      callbackUrl: searchParams?.get("from") || "/dashboard",
    });

    setIsLoading(false);

    if (!signInResult?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Your sign in request failed. Please try again.",
        variant: "destructive",
      });
    }

    return toast({
      title: "Check your email",
      description: "We sent you a login link. Be sure to check your spam too.",
    });
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={credSchema.handleSubmit(onSubmitCreds)}>
        <div className="grid gap-2">
          <div className="grid gap-2">
            <Label className="sr-only" htmlFor="identifier">
              Username OR Email
            </Label>
            <Input
              id="identifier"
              placeholder="Username OR Email"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading || isGitHubLoading || isNetlifyLoading}
              {...credSchema.register("identifier")}
            />
            {credSchema.formState.errors?.identifier && (
              <p className="px-1 text-xs text-red-600">
                {`${credSchema.formState.errors.identifier?.message}`}
              </p>
            )}
            <Label className="sr-only" htmlFor="email">
              Password
            </Label>
            <Input
              id="identifier"
              placeholder="Password"
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading || isGitHubLoading || isNetlifyLoading}
              {...credSchema.register("password")}
            />
            {credSchema.formState.errors?.password && (
              <p className="px-1 text-xs text-red-600">
                {`${credSchema.formState.errors.password.message}`}
              </p>
            )}
          </div>
          <button className={cn(buttonVariants())} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In with Credentials
          </button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with Email
          </span>
        </div>
      </div>
      <form onSubmit={emailSchema.handleSubmit(onSubmitEmail)}>
        <div className="grid gap-2">
          <div className="grid gap-2">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || isGitHubLoading || isNetlifyLoading}
              {...emailSchema.register("email")}
            />
            {emailSchema.formState.errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {`${emailSchema.formState.errors.email.message}`}
              </p>
            )}
          </div>
          <button className={cn(buttonVariants())} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In with Email
          </button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline" }))}
          onClick={() => {
            setIsGitHubLoading(true);
            signIn("github", { redirect: false });
          }}
          disabled={isLoading || isGitHubLoading || isNetlifyLoading}
        >
          {isGitHubLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4" />
          )}{" "}
          Github
        </button>
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline" }), "p-0")}
          onClick={() => {
            setIsNetlifyLoading(true);
            signIn("netlify", { redirect: false });
          }}
          disabled={isLoading || isGitHubLoading || isNetlifyLoading}
        >
          {isNetlifyLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.netlify className="text-white mr-2 h-4 w-4" />
          )}{" "}
          Netlify
        </button>
      </div>
    </div>
  );
}