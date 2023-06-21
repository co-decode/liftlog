import React, { useEffect, useState } from "react";
import Layout from "@/components/authenticated-layout";
import { sessionsConfig } from "@/config/sessions-config";
import { useAuth } from "@/components/auth-and-context";
import { Combobox } from "@/components/combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LineChart from "@/components/line-chart"

const { navItems, footerItems } = sessionsConfig;

export default function Sessions() {
  const { exerciseSessions } = useAuth();
  const [selectExercise, setSelectExercise] = useState<string>();
  const [currentExercises, setCurrentExercises] = useState<string[]>([]);

  //  const getSessions = trpc.users.findAll.useQuery("cody@cody.com");
  function handleClick() {
    if (selectExercise)
      setCurrentExercises([...currentExercises, selectExercise])
  }

  return (
    <Layout navItems={navItems} footerItems={footerItems}>
      <div>
        {currentExercises.map((ex) => (
          <Badge key={ex} variant="outline" className="capitalize">
            {ex}
          </Badge>
        ))}

        <Combobox
          value={selectExercise}
          setValue={setSelectExercise}
          currentExercises={currentExercises}
        />
        <Button
          onClick={handleClick}
        > Add Exercise
        </Button>
        <LineChart height={500} width={400}/>
      </div>
    </Layout>
  );
}
