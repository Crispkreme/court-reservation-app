
import { useState } from "react";
import Layout from "../../components/layout/Layout";

export default function Dashboard() {
  return (
    <Layout title="Dashboard">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Welcome to your Court Reservation System.
        </p>
      </div>
    </Layout>
  );
}
