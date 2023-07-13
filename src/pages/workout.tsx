import Layout from "@/components/authenticated-layout";
import { dashboardConfig } from "@/config/dashboard-config";
import { Programs, Summary, useAuth } from "@/components/auth-and-context";
import { Button } from "@/components/ui/button";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";

const { navItems, footerItems } = dashboardConfig;

type Program = Programs[number];
type ProgramSession = Program["programSessions"][number];

interface WorkoutProps {
  programSession: ProgramSession;
}

export default function Workout({ }: WorkoutProps) {
  const { selectedProgramSession } = useAuth();
  const { programSession, programName } = selectedProgramSession
    ? selectedProgramSession
    : { programSession: undefined, programName: undefined };
  const router = useRouter();
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    if (programSession === undefined)
      router.push("/dashboard");
    return;
  }, [router, programSession]);

  console.log("session before sorting: ", programSession?.programSets);

  const sequence = useMemo(() => {
    if (!programSession) return;
    return [...programSession.programSets]
      .sort((a, b) => {
        if (a.setIndex !== b.setIndex) return a.setIndex - b.setIndex;
        else return a.exerciseIndex - b.exerciseIndex;
      })
      .reduce((a: string[][], v) => {
        if (!a[v.setIndex]) a[v.setIndex] = [];
        a[v.setIndex].push(v.exerciseName);
        return a;
      }, []);
  }, [programSession]);
  console.log("session after sorting: ", sequence);

  if (!programSession || !sequence) return null;

  function handleStart() {
    setStarted(true);
  }

  return (
    <Layout footerItems={footerItems}>
      <div className="flex flex-1 justify-center h-full">
        {started ? (
          <WorkoutExercise
            programName={programName}
            programSession={programSession}
            sequence={sequence}
            started={started}
            setStarted={setStarted}
          />
        ) : (
          <div className="w-[300px]">
            <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 text-center">
              <span>{programName}</span>
            </h2>
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-5">
              <span>{programSession.name}</span>
            </h2>
            {sequence.map((ss, ind) => (
              <div key={`ss${ind}`}>
                <h3 className="text-lg font-semibold">
                  Circuit&nbsp;{ind + 1}
                </h3>
                <ul className="my-1 ml-6 [&>li]:mt-2">
                  {ss.map((ex) => (
                    <li key={ex} className="capitalize">
                      {ex}
                    </li>
                  ))}
                </ul>
                <hr />
              </div>
            ))}
            <Button
              onClick={handleStart}
              className="mt-3 w-full"
            >Start</Button>
          </div>
        )}
      </div>
    </Layout>
  );
}

interface WorkoutExerciseProps {
  programName: string
  programSession: ProgramSession;
  sequence: string[][];
  started: boolean;
  setStarted: Dispatch<SetStateAction<boolean>>;
}

function WorkoutExercise({
  programName,
  programSession,
  sequence,
}: WorkoutExerciseProps) {
  const { setWorkoutSummary, programs } = useAuth();
  const router = useRouter();
  const [setNumber, setSetNumber] = useState<number>(1);
  const [setIndex, setSetIndex] = useState<number>(0);
  const [exerciseIndex, setExerciseIndex] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [rest, setRest] = useState<boolean>(false);
  const [restTime, setRestTime] = useState(0);

  const sessionName = programSession.name

  const workoutData = useRef<Summary>({
    date: new Date(Date.now()),
    exercises: [],
    programId: programs?.find(p => p.programName === programName)?.programId,
    programSessionId: programSession.id,
  });

  function nextInSet() {
    const setLength = sequence[setIndex].length;
    if (exerciseIndex === setLength - 1) return sequence[setIndex][0];
    else return sequence[setIndex][exerciseIndex + 1];
  }

  function nextNextSet() {
    if (setIndex === sequence.length - 1) return null;
    else return sequence[setIndex + 1][0];
  }

  function handleNextClick() {
    const exercise = workoutData.current.exercises.find(
      (ex) => ex.name === sequence[setIndex][exerciseIndex]
    );
    if (exercise) exercise.sets.push({ setNumber, reps, weight });
    else {
      workoutData.current.exercises.push({
        name: sequence[setIndex][exerciseIndex],
        sets: [{ setNumber, reps, weight }],
      });
    }
    setRest(false);
    setWeight(0);
    setReps(0);
    const setLength = sequence[setIndex].length;
    if (exerciseIndex === setLength - 1) {
      setSetNumber(setNumber + 1);
      return setExerciseIndex(0);
    } else return setExerciseIndex(exerciseIndex + 1);
  }
  function handleNextSetClick() {
    const exercise = workoutData.current.exercises.find(
      (ex) => ex.name === sequence[setIndex][exerciseIndex]
    );
    if (exercise) exercise.sets.push({ setNumber, reps, weight });
    else {
      workoutData.current.exercises.push({
        name: sequence[setIndex][exerciseIndex],
        sets: [{ setNumber, reps, weight }],
      });
    }
    if (setIndex === sequence.length - 1) {
      setWorkoutSummary!(workoutData.current);
      return router.push("/sessions/add");
    }

    setRest(false);
    setWeight(0);
    setReps(0);
    setSetNumber(1);
    setExerciseIndex(0);
    setSetIndex(setIndex + 1);
  }

  function handleRest() {
    setRest(!rest);
    setRestTime(0);
  }

  return (
    <div className="flex flex-col gap-3 w-[300px]">
      <h1 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 text-center">
        {programName}
      </h1>
      <div className="relative text-sm text-muted-foreground">
        <h2 className="capitalize">{sessionName}</h2>
        <Stopwatch
          elapsedTime={elapsedTime}
          setElapsedTime={setElapsedTime}
          className="absolute right-0 -translate-y-1/2 top-1/2"
        />
      </div>
      <Label className="capitalize scroll-m-20 text-xl font-semibold tracking-tight">
        Set {` ${setNumber} - ${sequence[setIndex][exerciseIndex]}`}
      </Label>
      <Label className="ml-3">
        Weight
        <Input
          type="number"
          className="mt-1 w-32"
          min="0"
          value={weight}
          onFocus={(e) => e.target.select()}
          disabled={rest}
          onChange={(e) => setWeight(Number(e.target.value))}
        />
      </Label>
      <Label className="ml-3">
        Reps
        <Input
          type="number"
          className="mt-1 w-32"
          value={reps}
          onFocus={(e) => e.target.select()}
          disabled={rest}
          onChange={(e) => setReps(Number(e.target.value))}
        />
      </Label>
      <Button
        onClick={handleNextClick}
        className="capitalize"
        disabled={reps < 1}
      >
        {nextInSet()}
      </Button>
      <Button
        onClick={handleNextSetClick}
        className="capitalize"
        disabled={reps < 1}
      >
        {setIndex === sequence.length - 1 ? "Finish" : nextNextSet()}
      </Button>

      <Button
        onClick={handleRest}
        variant={rest ? "destructive" : "default"}
        disabled={reps < 1}
      >
        {!rest ? (
          "Rest"
        ) : (
          <Stopwatch
            elapsedTime={restTime}
            setElapsedTime={setRestTime}
            className=""
          />
        )}
      </Button>
    </div>
  );
}

interface StopwatchProps {
  className: string;
  elapsedTime: number;
  setElapsedTime: Dispatch<SetStateAction<number>>;
}

function Stopwatch({ className, elapsedTime, setElapsedTime }: StopwatchProps) {
  const [startTime, setStartTime] = useState<number>();
  const animationFrameRef = useRef<number>();

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const updateTimer = () => {
      const currentTime = performance.now();
      const elapsedTime = currentTime - startTime!;
      setElapsedTime(elapsedTime);
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    };
    setStartTime(performance.now());
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  }, [startTime, setElapsedTime]);

  return <p className={className}>{formatTime(elapsedTime)}</p>;
}
