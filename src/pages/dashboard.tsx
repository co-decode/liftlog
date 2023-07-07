import Layout from "@/components/authenticated-layout";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardConfig } from "@/config/dashboard-config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Programs, useAuth } from "@/components/auth-and-context";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Icons } from "@/components/icons";
import Link from "next/link";

const { navItems, footerItems } = dashboardConfig;

type Program = Programs[number];
type ProgramSession = Program["programSessions"][number];

export default function Dashboard() {
  const { programs, setSelectedProgramSession, currentProgram } = useAuth();
  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState<ProgramSession>();
  const [selectedProgram, setSelectedProgram] = useState<Program>();

  const getDefaultProgramSession = useMemo(() => {
    if (!programs || !currentProgram?.startDate || !currentProgram.programId)
      return;
    const program = programs.find(p => p.programId === currentProgram.programId)
    if (!program)
      throw new Error("getDefaultProgramSession: Dashboard program search failed: currentProgram does not exist in Programs")
    const today = new Date(Date.now() - 2 * (1000 * 3600 * 24)).setHours(0, 0, 0, 0)
    const daysSinceStart =
      (today - currentProgram.startDate.getTime()) / (1000 * 60 * 60 * 24)
    const splitIndex = daysSinceStart % program.splitLength
    const session = program.programSessions
      .find(ps => ps.splitIndices
        .some(si => si.index === splitIndex))
    return { session: session?.name, index: splitIndex }
  }, [programs, currentProgram?.startDate, currentProgram?.programId])


  useEffect(() => {
    const program =
      programs?.find(p => p.programId === currentProgram?.programId)
    setSelectedProgram(program)
    const session = program?.programSessions
      .find(s => s.name === getDefaultProgramSession?.session)
    setSelectedSession(session)
  }, [programs, currentProgram, getDefaultProgramSession?.session])

  function handleBegin() {
    setSelectedProgramSession!({
      programName: selectedProgram!.programName,
      programSession: selectedSession!,
    });
    router.push("/workout");
  }

  return (
    <Layout navItems={navItems} footerItems={footerItems}>
      <div className="grid justify-items-center gap-5">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
          Dashboard
        </h2>
        <div className="flex justify-between w-[min(300px,98vw)] flex-wrap gap-3">
          <p className="text-sm font-medium leading-none">
            Program:{` ${currentProgram?.programName || "None"}`}
          </p>
          {getDefaultProgramSession ?
            <p className="text-sm font-medium leading-none">
              Day{` ${getDefaultProgramSession.index + 1}`}:{` ${getDefaultProgramSession.session || "Rest"}`}
            </p>
            : null
          }
        </div>
        <Card className="text-center w-[min(300px,98vw)] flex justify-center">
          <CardContent className="grid gap-2 pt-6">
            <Select
              onValueChange={(e) =>
                setSelectedProgram(programs?.find((p) => p.programName === e))
              }
              value={selectedProgram?.programName}
              disabled={!programs}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="No Program Selected" />
              </SelectTrigger>
              <SelectContent>
                {programs?.map((p) => (
                  <SelectItem key={p.programId} value={p.programName}>
                    {p.programName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              disabled={!selectedProgram}
              value={selectedSession?.name}
              onValueChange={(e) =>
                setSelectedSession(
                  selectedProgram?.programSessions.find((p) => p.name === e)
                )
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="No Session Selected" />
              </SelectTrigger>
              <SelectContent>
                {selectedProgram?.programSessions.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={handleBegin}
              disabled={!selectedSession}
              className="scroll-m-20 text-xl font-semibold tracking-tight w-[200px]"
            >
              Begin Session
            </Button>
          </CardContent>
        </Card>
        {programs?.length === 0 
        ?
        <div className="flex flex-col items-center text-destructive gap-3">
          <p className="text-sm font-medium leading-none">
            Build a program to get started!
          </p>
          <Link href="/programs">
          <Icons.dumbbell className="w-8 h-8" />
          </Link>
        </div>
        : null
        }

      </div>
    </Layout >
  );
}
