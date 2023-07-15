import React, { useEffect, useState } from "react";
import Layout from "@/components/authenticated-layout";
import { Sessions, useAuth } from "@/components/auth-and-context";
import { scheduleConfig } from "@/config/schedule-config";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const { footerItems } = scheduleConfig

type Session = NonNullable<Sessions>[number]

export default function Schedule() {
  const { exerciseSessions, currentProgram, programs } = useAuth()
  //const events = [new Date(new Date(Date.now()).setDate(30))]
  const [preview, setPreview] = useState<Session | null>()

  function handleDayClick(date: Date) {
    const session = exerciseSessions?.find(sess => sess.date.toDateString() === date.toDateString())
    if (!session) return setPreview(null)
    setPreview(session)
  }

  function getFutureSessions() {
    if (!programs || !currentProgram || !currentProgram.startDate) return;
    const program = programs.find(p => p.programName === currentProgram.programName)
    if (!program) return;
    const splitIndices = program.programSessions.reduce((a: number[], sess) => {
      return [...a, ...sess.splitIndices.map((sI) => sI.index)]
    }, [])
    const endDay: number = currentProgram.startDate!.getTime() + 1000 * 60 * 60 * 24 * 7 * 8

    let acc = []
    let start = new Date(Date.now()).setHours(0, 0, 0, 0) // today
    const daysSinceStart = (start - currentProgram.startDate.getTime()) / (1000 * 60 * 60 * 24)
    let i = 0
    while (start <= endDay) {
      let currentIndex = (daysSinceStart + i++) % program.splitLength
      if (splitIndices.includes(currentIndex))
        acc.push(new Date(start))
      start += (1000 * 60 * 60 * 24)
    }
    return acc
  }

  return (
    <Layout footerItems={footerItems}>
      <div className="grid justify-items-center">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-5 text-center">
          Calendar
        </h2>
        <Calendar
        className="min-h-[350px]"
          mode="single"
          //defaultMonth={}
          modifiers={{
            futureSessions: getFutureSessions() || [],
            exerciseSessions: exerciseSessions?.map(sess => sess.date) || [],
            //events
          }}
          modifiersClassNames={{
            futureSessions: "after:bg-primary/10 after:rounded-full after:w-1.5 after:h-1.5 after:absolute after:top-0 after:right-0",
            exerciseSessions: "after:bg-primary/100 after:rounded-full after:w-1.5 after:h-1.5 after:absolute after:top-0 after:right-0",
            //events: "before:content-[''] before:bg-destructive before:rounded-full before:w-1.5 before:h-1.5 before:absolute before:top-0 before:left-0 before:animate-pulse"
          }}
          onDayClick={handleDayClick}
        //onMonthChange={}
        />
        {preview ?
          <Card className="min-w-[260px]">
            <CardHeader className="text-sm font-medium leading-none pb-2 ">
              <div>
                {new Intl.DateTimeFormat([], {
                  weekday: "short",
                  day: "numeric",
                  month: "numeric",
                  year: "2-digit",
                  hour12: true,
                  hour: "numeric",
                  minute: "2-digit",
                }).format(preview.date)}
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="text-sm font-medium leading-none grid gap-2">
              {preview.exercises.map(ex => <div key={ex.name} className="capitalize">{ex.name}</div>)}
              <Separator />

              <Button role="link">
                <Link href={"/sessions/" + preview.date.toISOString()}>
                  Go to Session
                </Link>
              </Button>
            </CardContent>
          </Card>
          : null
        }
      </div>
    </Layout>
  );
}
