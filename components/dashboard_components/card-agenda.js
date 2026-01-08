"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatWIB } from "@/lib/format-time";

export default function CardAgenda() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/card-agenda");
      const data = await res.json();
      console.log(data.length);
      // ✅ PASTIKAN ARRAY
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal fetch events:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (session) fetchEvents();
  }, [session]);

  if (loading) return <p className="text-center mt-10">Memuat Agenda...</p>;
  return (
    <div>
      {events.length === 0 ? (
        <p className="text-gray-400">Tidak ada Agenda Hari ini.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="border p-4 rounded-xl bg-slate-100">
              <h2 className="font-medium">{event.judul || "(Tanpa Judul)"}</h2>

              <p className="text-sm text-gray-700">⏰ {formatWIB(event.tanggalMulai)}</p>

              <Link href={`/agenda/${event.id}`} className="mt-3 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                Detail Rapat
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
