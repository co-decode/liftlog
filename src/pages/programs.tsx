import { useSession } from "next-auth/react";
import React from "react";
import Layout from "@/components/authenticated-layout";
import { useAuth } from "@/components/auth-and-context";
import { programsConfig } from "@/config/programs-config";
import { DataTable } from "@/components/programs-table";
import { columns } from "@/components/programs-columns";
import { trpc } from "@/utils/trpc";

const { navItems, footerItems } = programsConfig

export default function Programs() {
  const { status } = useSession();
  const { programs } = useAuth()

  const createProgram = trpc.programs.createProgram.useMutation({
    onSuccess() {
      console.log("Success!")
    },
    onError() {
      console.error("Custom Error Message: Handle this visually for the user!")
    }
  })


console.log(programs)
  return (
    <Layout navItems={navItems} footerItems={footerItems}>
        <>
          {programs &&
            <DataTable
              className="mx-2"
              columns={columns}
              data={programs} />
          }

        </>
    </Layout>
  );
}
