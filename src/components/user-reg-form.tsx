"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  isGitHubLoading: boolean
  setIsGitHubLoading: React.Dispatch<React.SetStateAction<boolean>>
  isNetlifyLoading: boolean
  setIsNetlifyLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const userAuthEmailSchema = z.object({
  email: z.string().email(),
})

type FormDataEmail = z.infer<typeof userAuthEmailSchema>

export function UserRegForm({
  isLoading,
  setIsLoading,
  isGitHubLoading,
  setIsGitHubLoading,
  isNetlifyLoading,
  setIsNetlifyLoading,
  className,
  ...props
}: UserAuthFormProps) {

  const emailSchema = useForm<FormDataEmail>({
    resolver: zodResolver(userAuthEmailSchema),
  })

  async function onSubmitEmail(data: FormDataEmail) {
    setIsLoading(true)

    const signInResult = await signIn("email", {
      email: data.email.toLowerCase(),
      redirect: false,
      callbackUrl: "/dashboard",
    })

    setIsLoading(false)

    if (!signInResult?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Your sign in request failed. Please try again.",
        variant: "destructive",
      })
    }

    return toast({
      title: "Check your email",
      description: "We sent you a login link. Be sure to check your spam too.",
    })
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
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
  )
}
  //const [isLoading, setIsLoading] = React.useState<boolean>(false)
  //const [isGitHubLoading, setIsGitHubLoading] = React.useState<boolean>(false)
  //const [isNetlifyLoading, setIsNetlifyLoading] = React.useState<boolean>(false)
