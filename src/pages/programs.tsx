import React from "react";
import Layout from "@/components/authenticated-layout";
import { useAuth } from "@/components/auth-and-context";
import { programsConfig } from "@/config/programs-config";
import { DataTable } from "@/components/programs-table";
import { columns } from "@/components/programs-columns";

const { footerItems } = programsConfig

export default function Programs() {
  const { programs } = useAuth()

  return (
    <Layout footerItems={footerItems}>
      <>
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center mb-4">
          Programs
        </h2>
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
