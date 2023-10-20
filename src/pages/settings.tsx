import Layout from "@/components/authenticated-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardConfig } from "@/config/dashboard-config";
import { useAuth } from "@/components/auth-and-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dispatch, MouseEventHandler, SetStateAction, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DatePicker } from "@/components/settings-date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import { inferProcedureInput } from "@trpc/server";
import { AppRouter } from "@/server/routers/_app";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { useLockBody } from "@/hooks/use-lock-body";
import { z } from "zod";
import { Icons } from "@/components/icons";

const { footerItems } = dashboardConfig;

export default function Settings() {
  const { data } = useSession()
  const { passwordSet, setPasswordSet } = useAuth()
  const [warning, setWarning] = useState<boolean>(false)
  const [passField, setPassField] = useState<string>("")
  const passFieldRef = useRef<HTMLInputElement | null>()

  const updatePassword = trpc.users.updatePassword.useMutation({
    onSuccess() {
      console.log("Password successfully updated!")
    }
  })

  function handleSetPassword() {
    if (!passField)
      return toast({
        title: "Error",
        description: "Please ensure that you have entered a valid password.",
        variant: "destructive",
      });

    updatePassword.mutateAsync({
      userId: data?.user.id,
      password: passField
    })

    setPassField("")
    if (passwordSet)
      setWarning(false)
    if (passFieldRef.current && setPasswordSet) {
      passFieldRef.current.value = ""
      setPasswordSet(true)
    }

    return toast({
      title: "Success!",
      description: "The password has been successfully set!",
      variant: "default",
    })
  }


  return (
    <Layout footerItems={footerItems}>
      <div className="flex flex-1 flex-col gap-3 items-center h-full">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-5 text-center">
          Settings
        </h2>
        <Preferences />
        <Card className="w-[300px]">
          <CardHeader className="text-sm text-muted-foreground font-medium leading-none">
            {passwordSet ? "Change Password" : "Set up a Password"}
          </CardHeader>
          <CardContent className="grid gap-3">
            <Label>
              Password
              <Input
                className="mt-3"
                type="password"
                ref={(e) => passFieldRef.current = e}
                onChange={e => setPassField(e.target.value)}
                disabled={data?.user.email === "trial@liftlog.com"}
                placeholder={data?.user.email ? "Disabled for Trial Account" : ""}
              />
            </Label>
            <Button className="w-full"
              onClick={() => passwordSet ? setWarning(true) : handleSetPassword()}
              disabled={!passField || data?.user.email === "trial@liftlog.com"}
            >
              {passwordSet ? "Update Password" : "Enable Credentials"}
            </Button>
          </CardContent>
        </Card>
        <AvatarPreference />

      </div>
      <Toaster />
      {warning
        ? <PasswordAlert setWarning={setWarning} handleSetPassword={handleSetPassword} />
        : null
      }
    </Layout>
  );
}

interface PreferencesProps {
}

type Form = { programId: number, startDate: Date, programName: string }

function Preferences({ }: PreferencesProps) {
  const { data } = useSession()
  const { weightUnit, setWeightUnit, currentProgram, setCurrentProgram, programs } = useAuth()
  const [currentProgramForm, setCurrentProgramForm] =
    useState<Partial<Form>>({
      startDate: currentProgram?.startDate,
      programId: currentProgram?.programId,
      programName: currentProgram?.programName,
    })

  useEffect(() => {
    setCurrentProgramForm({
      startDate: currentProgram?.startDate,
      programId: currentProgram?.programId,
      programName: currentProgram?.programName,
    })
  }, [setCurrentProgramForm, currentProgram])

  const saveCurrentProgram = trpc.programs.setCurrentProgram.useMutation({
    onSuccess() {
      console.log("Success!")
    }
  })
  const deleteCurrentProgram = trpc.programs.deleteCurrentProgram.useMutation({
    onSuccess() {
      console.log("Successfully deleted!")
    }
  })

  function handleKg() {
    if (setWeightUnit) {
      localStorage.setItem("weightUnit", "KG")
      setWeightUnit("KG")
    }
  }

  function handleLb() {
    if (setWeightUnit) {
      localStorage.setItem("weightUnit", "LB")
      setWeightUnit("LB")
    }
  }

  async function submitCurrentProgram() {
    if (!setCurrentProgram || !data?.user?.id)
      return;
    if (
      !currentProgramForm?.programId ||
      !currentProgramForm.startDate
    ) try {
      await deleteCurrentProgram.mutateAsync(data.user.id)
      setCurrentProgram(undefined)
      return;
    } catch {
      console.error("Failed to Delete current Program")
      return;
    };
    type Input = inferProcedureInput<AppRouter["programs"]["setCurrentProgram"]>
    const input: Input = {
      startDate: currentProgramForm.startDate,
      programId: currentProgramForm.programId,
      userId: data.user.id as number
    }
    try {
      await saveCurrentProgram.mutateAsync(input)
      if (!setCurrentProgram) return;
      setCurrentProgram({ ...currentProgramForm })
    } catch {
      console.error("Failed to save Current Program.")
    }
  }

  return (
    <>
      <Card className="w-[300px]">
        <CardHeader className="capitalize text-sm font-medium leading-none">
          Unit Preference:{` ${weightUnit.toLowerCase()}`}
        </CardHeader>
        <CardContent className="flex justify-between">
          <Button
            className="w-20"
            onClick={handleKg}
            disabled={weightUnit === "KG"}
          >
            Kg
          </Button>
          <Button
            className="w-20"
            onClick={handleLb}
            disabled={weightUnit === "LB"}
          >
            Lb
          </Button>
        </CardContent>
      </Card>
      <Card className="w-[300px]">
        <CardHeader className="capitalize text-sm font-medium leading-none">
          <Label >
            <span className="block mb-2">
              Current Program
            </span>
            <Select
              defaultValue={currentProgram?.programName
                ? `${currentProgram.programName}|${currentProgram.programId}`
                : undefined
              }
              value={currentProgramForm.programName
                ? `${currentProgramForm.programName}|${currentProgramForm.programId}`
                : ""
              }
              onValueChange={(e) => {
                if (!e.length)
                  return setCurrentProgramForm({ startDate: currentProgramForm?.startDate })
                const [programName, id] = e.split("|")
                const programId = Number(id)
                setCurrentProgramForm({ startDate: currentProgramForm?.startDate, programId, programName })
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="No Program Selected" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  None
                </SelectItem>
                {programs?.map((p) => (
                  <SelectItem key={p.programId} value={`${p.programName}|${p.programId}`}>
                    {p.programName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 ">
          <Label className="w-min">
            <span className="block mb-2">
              Start Date
            </span>
            <DatePicker
              currentProgramForm={currentProgramForm as Form}
              setCurrentProgramForm={setCurrentProgramForm as Dispatch<SetStateAction<Form>>}
              disabled={!currentProgramForm?.programId}
            />
          </Label>
          <Button
            onClick={submitCurrentProgram}
            disabled={
              currentProgramForm?.programId === currentProgram?.programId &&
              currentProgramForm?.startDate === currentProgram?.startDate
            }
          >
            Save
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

interface AvatarPreferenceProps {
}

function AvatarPreference({ }: AvatarPreferenceProps) {
  const { data, update } = useSession()
  const [imageField, setImageField] = useState<string>("")
  const [validImage, setValidImage] = useState<boolean>(false)
  const imageFieldRef = useRef<HTMLInputElement | null>()
  const updateImage = trpc.users.updateImage.useMutation({
    onSuccess() {
      console.log("Image successfully updated!")
    },
    onSettled(data) {
      if (!data) {
        console.error("Image was not updated.")
        return toast({
          title: "Error",
          description: "Please ensure that you have entered the correct URL.",
          variant: "destructive",
        });
      }

      update({ image: data })

      return toast({
        title: "Success!",
        description: "The Image has been successfully set!",
        variant: "default",
      })

    }

  })

  useEffect(() => {
    const validURL = z.string().regex(/\.(jpg|jpeg|png)$/)
    const result = validURL.safeParse(imageField)
    setValidImage(result.success)
  }, [imageField])

  function handleSetImage() {
    updateImage.mutateAsync({
      userId: data?.user.id,
      image: imageField
    },)
  }

  return (
    <Card className="w-[300px]">
      <CardHeader className="text-sm font-medium leading-none flex flex-row justify-between items-center">
        <div className="flex gap-3">
          <span>Profile Picture</span>
          {updateImage.isLoading && <Icons.spinner className="h-4 w-4 animate-spin" />}
        </div>
        <Avatar className="!m-0">
          {data?.user.image ? (
            <AvatarImage className="" src={data?.user.image} />
          ) : (
            <AvatarFallback className="uppercase">{data?.user.email[0] || null}</AvatarFallback>
          )}

        </Avatar>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Label>
          Image URL
          <Input
            className="mt-3"
            ref={(e) => imageFieldRef.current = e}
            onChange={e => setImageField(e.target.value)}
            disabled={data?.user.email === "trial@liftlog.com"}
            placeholder={data?.user.email ? "Disabled for Trial Account" : ""}
          />
        </Label>
        <Button className="w-full"
          onClick={() => handleSetImage()}
          disabled={!validImage || data?.user.email === "trial@liftlog.com"}
        >
          Set Image URL
        </Button>
      </CardContent>
    </Card>
  )

}

interface PasswordAlertProps {
  setWarning: Dispatch<SetStateAction<boolean>>
  handleSetPassword: MouseEventHandler
}

function PasswordAlert({ setWarning, handleSetPassword }: PasswordAlertProps) {
  useLockBody();
  return (
    <div className="z-50 bg-background/50 w-full h-full fixed !m-0 top-0">
      <Card className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 min-w-max">
        <CardHeader>
          <CardTitle className="text-center mb-2">Change Password?</CardTitle>
          <CardDescription>
            Are you sure you wish to change your password?
            <br /> Your previous password will be overwritten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className={"w-full"}
            variant={"destructive"}
            onClick={handleSetPassword}
          >
            <p>
              Change Password
            </p>
          </Button>
        </CardContent>
        <CardFooter>
          <Button
            variant="default"
            className="w-full"
            onClick={() => setWarning(false)}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
