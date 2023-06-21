import Layout from "@/components/authenticated-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { useState } from "react";
import { useRouter } from "next/router";

const { navItems, footerItems } = dashboardConfig;

type Program = Programs[number];
type ProgramSession = Program["programSessions"][number];

export default function Dashboard() {
  const { programs, setSelectedProgramSession } = useAuth();
  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState<ProgramSession>();
  const [selectedProgram, setSelectedProgram] = useState<Program>();

  function handleBegin() {
    setSelectedProgramSession!({
      programName: selectedProgram!.programName,
      programSession: selectedSession!,
    });
    router.push("/workout");
  }

  return (
    <Layout navItems={navItems} footerItems={footerItems}>
      <div className="flex flex-1 justify-center items-center h-full">
        <Card className="text-center">
          <CardHeader>
            <Button
              variant="secondary"
              onClick={handleBegin}
              disabled={!selectedSession}
              className="scroll-m-20 text-xl font-semibold tracking-tight"
            >
              Begin Session
            </Button>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Select
              onValueChange={(e) =>
                setSelectedProgram(programs?.find((p) => p.programName === e))
              }
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
