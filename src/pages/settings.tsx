import Layout from "@/components/authenticated-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { dashboardConfig } from "@/config/dashboard-config";
import { useAuth } from "@/components/auth-and-context";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DatePicker } from "@/components/settings-date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import { inferProcedureInput } from "@trpc/server";
import { AppRouter } from "@/server/routers/_app";

const { navItems, footerItems } = dashboardConfig;

export default function Settings() {
  const { data } = useSession()

  return (
    <Layout navItems={navItems} footerItems={footerItems}>
      <div className="flex flex-1 flex-col gap-3 items-center h-full">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-5 text-center">
          Settings
        </h2>
        <Preferences />
        <Card className="w-[300px]">
          <CardHeader className="text-sm text-muted-foreground font-medium leading-none">
            Set up a Password
          </CardHeader>
          <CardContent className="grid gap-3">
            <Label>
              Password
              <Input
                className="mt-3"
                type="password"
              />
            </Label>
            <Button className="w-full">
              Enable Credentials
            </Button>
          </CardContent>
        </Card>
        <Card className="w-[300px] flex justify-between items-center">
          <CardHeader className="text-sm font-medium leading-none">
            Profile Picture
          </CardHeader>
          <CardContent className="p-0 mr-5">
            <Avatar className="">
              <AvatarImage className="" />
              <AvatarFallback className="uppercase">{data?.user.email[0] || null}</AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>

      </div>
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
