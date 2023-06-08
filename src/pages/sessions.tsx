import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import React from "react";
import { DataTable } from "@/components/sessions-table";
import { columns } from "@/components/sessions-columns";
import Layout from "@/components/authenticated-layout";
import { sessionsConfig } from "@/config/sessions-config";
import { useAuth } from "@/components/auth-and-context";

const {navItems, footerItems} = sessionsConfig

export default function Sessions() {
  const { status } = useSession();
  const { exerciseSessions } = useAuth()

//  const getSessions = trpc.users.findAll.useQuery("cody@cody.com");

  return (
    <Layout navItems={navItems} footerItems={footerItems}>
        {status !== "authenticated" ? null : (
          <>
          {exerciseSessions &&
            <DataTable 
              className="mx-2" 
              columns={columns} 
              data={exerciseSessions}/>
          }
          </>
        )}
    </Layout>
  );
}
