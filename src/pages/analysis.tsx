import React, { useMemo, useState } from "react";
import Layout from "@/components/authenticated-layout";
import { analysisConfig } from "@/config/analysis-config";
import { useAuth } from "@/components/auth-and-context";
import { Combobox } from "@/components/combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LineChart from "@/components/line-chart"
import { Card, CardHeader } from "@/components/ui/card";
import { Sessions as ExSessions } from "@/components/auth-and-context";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const { footerItems } = analysisConfig;

export type Accumulators = "TOTALREPS" | "AVERAGEWEIGHT" | "MAXIMUMWEIGHT" | "TOTALWEIGHT" | "TOTALSETS"
type DataSession = { date: Date, exercises: ReducedSets }

function getTotalReps(dataSessions: DataSession[]) {
  return dataSessions.reduce((a: [Date, number][], sess) => {
    const totalReps = sess.exercises.reduce((a: number, sets) =>
      a + sets.reduce((a: number, s) =>
        a + s.reps, 0), 0)
    return [...a, [sess.date, totalReps]]
  }, []) as [Date, number][]
}

function getTotalSets(dataSessions: DataSession[]) {
  return dataSessions.reduce((a: [Date, number][], sess) => {
    const totalSets = sess.exercises
      .reduce((a: number, sets) => a + sets.length, 0)
    return [...a, [sess.date, totalSets]]
  }, []) as [Date, number][]
}

function getMaximumWeight(dataSessions: DataSession[], weightUnit: "KG" | "LB") {
  return dataSessions.reduce((a: [Date, number][], sess) => {
    const maxWeight = sess.exercises.reduce((a: number, sets) => {
      const maxInSet = sets.reduce((a: number, s) =>
        s.weight > a ? s.weight : a, 0)
      return maxInSet > a ? maxInSet : a
    }, 0) * (weightUnit === "KG" ? 1 : 2.205)
    return [...a, [sess.date, maxWeight]]
  }, []) as [Date, number][]
}

function getTotalWeight(dataSessions: DataSession[], weightUnit: "KG" | "LB") {
  return dataSessions.reduce((a: [Date, number][], sess) => {
    const totalWeight = sess.exercises.reduce((a: number, sets) =>
      a + sets.reduce((a: number, s) =>
        a + s.reps * s.weight, 0), 0) * (weightUnit === "KG" ? 1 : 2.205)
    return [...a, [sess.date, totalWeight]]
  }, []) as [Date, number][]
}

function getAverageWeight(dataSessions: DataSession[], weightUnit: "KG" | "LB") {
  return dataSessions.reduce((a: [Date, number][], sess) => {
    let totalReps = 0
    const totalWeight = sess.exercises.reduce((a: number, sets) =>
      a + sets.reduce((a: number, s) => {
        totalReps += s.reps
        return a + s.reps * s.weight
      }, 0), 0) * (weightUnit === "KG" ? 1 : 2.205)
    return [...a, [sess.date, totalWeight / totalReps]]
  }, []) as [Date, number][]
}


type ReducedSets = NonNullable<ExSessions>[number]["exercises"][number]["sets"][]

export default function Analysis() {
  const { exerciseSessions, weightUnit } = useAuth();
  const [selectExercise, setSelectExercise] = useState<string>();
  const [currentExercises, setCurrentExercises] = useState<string[]>([]);
  const [accumulator, setAccumulator] = useState<Accumulators>("TOTALREPS")

  const dataSessions = useMemo(() => {
    const sessions = exerciseSessions?.reduceRight((a: { date: Date, exercises: ReducedSets }[], sess) => {
      const exercises = sess.exercises.reduce((a: ReducedSets, ex) => {
        if (!currentExercises.includes(ex.name)) return a;
        return [...a, ex.sets]
      }, [])
      return exercises.length ? [...a, { date: sess.date, exercises }] : a
    }, [])
    return sessions?.length ? sessions : undefined
  }, [currentExercises, exerciseSessions])

  const data = useMemo(() => {
    if (!dataSessions) return
    if (accumulator === "TOTALREPS")
      return getTotalReps(dataSessions)
    if (accumulator === "TOTALSETS")
      return getTotalSets(dataSessions)
    if (accumulator === "TOTALWEIGHT")
      return getTotalWeight(dataSessions, weightUnit)
    if (accumulator === "AVERAGEWEIGHT")
      return getAverageWeight(dataSessions, weightUnit)
    if (accumulator === "MAXIMUMWEIGHT")
      return getMaximumWeight(dataSessions, weightUnit)
  }, [dataSessions, accumulator, weightUnit])

  function handleClick() {
    if (selectExercise)
      setCurrentExercises([...currentExercises, selectExercise])
  }
  function handleRemove(exercise: string) {
    setCurrentExercises(currentExercises.filter(ex => ex !== exercise))
  }
  function handleChange(accType: Accumulators) {
    setAccumulator(accType)
  }

  return (
    <Layout footerItems={footerItems}>
      <div className="grid justify-items-center">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-5 text-center">
          Analysis
        </h2>
        <div className="grid w-[300px] gap-5 relative justify-items-center">
          <div className="min-h-[25px]">
            {currentExercises.map((ex) => (
              <Badge
                key={ex}
                variant="outline"
                className="w-max capitalize hover:bg-destructive cursor-pointer"
                onClick={() => handleRemove(ex)}
              >
                {ex}
              </Badge>
            ))}
          </div>

          <div className="grid gap-2">
            <Combobox
              value={selectExercise}
              setValue={setSelectExercise}
              currentExercises={currentExercises}
            />
            <Button
              onClick={handleClick}
            > Add Exercise
            </Button>
          </div>
          {data
            ? <LineChart height={300} width={280} data={data} type={accumulator}/>
            : <Card className="h-[300px] w-[280px] grid place-items-center">
              <CardHeader className="text-lg font-semibold">
                Add an Exercise
              </CardHeader>
            </Card>
          }
          <div className="mt-5">
          <Label className="text-sm font-medium leading-none">
            Accumulation
            <Select onValueChange={handleChange} disabled={!currentExercises.length}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Total Reps" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TOTALREPS">Total Reps</SelectItem>
                <SelectItem value="AVERAGEWEIGHT">Average Weight</SelectItem>
                <SelectItem value="MAXIMUMWEIGHT">Maximum Weight</SelectItem>
                <SelectItem value="TOTALWEIGHT">Total Weight</SelectItem>
                <SelectItem value="TOTALSETS">Total Sets</SelectItem>
              </SelectContent>
            </Select>
            </Label>
          </div>

        </div>
      </div>
    </Layout>
  );
}
