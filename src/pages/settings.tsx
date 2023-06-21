import Layout from "@/components/authenticated-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { dashboardConfig } from "@/config/dashboard-config";
import { Programs, useAuth } from "@/components/auth-and-context";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const { navItems, footerItems } = dashboardConfig;

type Program = Programs[number];
type ProgramSession = Program["programSessions"][number];

export default function Dashboard() {
  const { weightUnit, setWeightUnit } = useAuth()
  const { data } = useSession()
  const router = useRouter();

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

  return (
    <Layout navItems={navItems} footerItems={footerItems}>
      <div className="flex flex-1 flex-col gap-3 items-center h-full">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-5 text-center">
          Settings
        </h2>
        <Card className="w-[300px]">
          <CardHeader className="capitalize text-sm font-medium leading-none">
            Unit Preference:{` ${weightUnit.toLowerCase()}`}
          </CardHeader>
          <CardContent className="flex justify-between">
            <Button
              onClick={handleKg}
              disabled={weightUnit === "KG"}
            >
              Kg
            </Button>
            <Button
              onClick={handleLb}
              disabled={weightUnit === "LB"}
            >
              Lb
            </Button>
          </CardContent>
        </Card>
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
