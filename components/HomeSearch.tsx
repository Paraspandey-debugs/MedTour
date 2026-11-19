"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HOMES, TREATMENTS } from "@/lib/data";

export default function HomeSearch() {
  const router = useRouter();
  const [procedure, setProcedure] = useState<string>(TREATMENTS[0].id);
  const [from, setFrom] = useState<string>("US");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/hospitals?procedure=${encodeURIComponent(procedure)}&from=${encodeURIComponent(from)}`);
  }

  return (
    <form onSubmit={submit} className="card p-4 sm:p-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end" aria-label="Compare hospitals">
      <div>
        <label htmlFor="home-procedure" className="label">I need</label>
        <select id="home-procedure" className="field" value={procedure} onChange={(e) => setProcedure(e.target.value)}>
          {TREATMENTS.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="home-from" className="label">I live in</label>
        <select id="home-from" className="field" value={from} onChange={(e) => setFrom(e.target.value)}>
          {Object.values(HOMES).map((h) => (
            <option key={h.id} value={h.id}>{h.flag} {h.name}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary min-h-11 w-full sm:w-auto">Compare hospitals</button>
    </form>
  );
}
