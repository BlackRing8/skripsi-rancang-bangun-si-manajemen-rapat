"use client";
import { useState, useEffect } from "react";
import { hasAccess } from "@/lib/access";
import { PERMISSIONS } from "@/lib/permission";
import { useSession } from "next-auth/react";

export default function ManajemenPage() {
  const { data: session } = useSession();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isDisabled = !hasAccess(session?.user?.jabatans, PERMISSIONS.AGENDA_MANAGE);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/manajemen/monitoring?start=2026-01-01&end=2026-12-31");
      const json = await res.json();
      setData(json.data || []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  // 🔑 GROUP DATA PER UNIT
  const groupedByUnit = data.reduce((acc, item) => {
    if (!acc[item.unitName]) {
      acc[item.unitName] = [];
    }
    acc[item.unitName].push(item);
    return acc;
  }, {});

  return (
    <div className="p-6">
      {isDisabled ? (
        <div className="w-full  flex justify-center items-center">
          {" "}
          <h1 className="font-bold text-2xl">akses di tolak</h1>{" "}
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-6 bg-white text-center md:w-1/2 py-2 rounded-lg">Monitoring Kehadiran Rapat selama 1 tahun</h1>

          {Object.entries(groupedByUnit).map(([unitName, users]) => (
            <div key={unitName} className="mb-10 bg-white rounded-lg pb-10">
              {/* Judul Unit */}
              <h2 className="text-lg font-semibold mb-3 p-4">Unit: {unitName}</h2>

              <table className="w-full border">
                <thead>
                  <tr className="bg-blue-400">
                    <th className="border p-2">Nama</th>
                    <th className="border p-2 text-xs md:text-lg">Total Undangan</th>
                    <th className="border p-2 text-xs md:text-lg">Total Hadir</th>
                    <th className="border p-2">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={`${u.userId}-${u.unitId}`} className="bg-white">
                      <td className="border p-2 text-center text-xs md:text-lg">{u.name}</td>
                      <td className="border p-2 text-center">{u.totalUndangan}</td>
                      <td className="border p-2 text-center">{u.totalHadir}</td>
                      <td className="border p-2 text-center">{u.presentase}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
