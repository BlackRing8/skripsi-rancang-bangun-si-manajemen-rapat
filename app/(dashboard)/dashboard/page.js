"use client";
import { useSession } from "next-auth/react";
import { isSameDay } from "date-fns";
import { useState, useEffect } from "react";

import CardAgenda from "@/components/dashboard_components/card-agenda";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [rapatList, setRapatList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // untuk ubah bulan di panel
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const daysInMonth = Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }, (_, i) => new Date(currentYear, currentMonth, i + 1));

  // Ambil daftar semua event bulan ini (untuk menandai tanggal di kalender)
  useEffect(() => {
    const fetchMonthEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/dashboard/calendar?monthView=true&month=${currentMonth + 1}&year=${currentYear}`);
        if (!res.ok) throw new Error("Gagal mengambil data bulan ini");

        const data = await res.json();
        setRapatList(Array.isArray(data.events) ? data.events : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthEvents();
  }, [currentMonth, currentYear]);

  // Ambil event sesuai tanggal yang dipilih
  useEffect(() => {
    const fetchDayEvents = async () => {
      try {
        setLoading(true);
        const dateStr = selectedDate.toLocaleDateString("en-CA"); // gunakan , { timeZone: "Asia/Jakarta" } untuk lokal development
        const res = await fetch(`/api/dashboard/calendar?date=${dateStr}`);
        if (!res.ok) throw new Error("Gagal mengambil event tanggal ini");
        const data = await res.json();

        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDayEvents();
  }, [selectedDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5  ">
      {/* container yang kiri */}
      <div className="w-full grid-cols-1 ">
        <div className="rounded-4xl p-4 mb-3">
          <h1 className="font-semibold text-4xl">
            Selamat datang kembali, <b className="text-blue-700">{session.user?.name}!</b>
            <br></br> Apa rencana mu hari ini?
          </h1>
        </div>
        <div className="w-full flex flex-col bg-white rounded-xl p-8 space-y-4 md:h-125 overflow-y-auto">
          <h2 className="font-bold text-2xl">Agenda hari ini:</h2>
          {/* {events.length > 0 ? <CardAgenda /> : <p className="text-gray-400">Tidak ada agenda hari ini.</p>} */}
          <CardAgenda />
        </div>
      </div>

      {/* Container yang kanan */}
      <div className="w-full ">
        <div className="p-6 bg-white rounded-xl">
          <h2 className="text-xl md:text-3xl font-bold  text-blue-800">List Agenda tanggal ini ({selectedDate.toLocaleDateString("id-ID")})</h2>

          <div className="flex w-full h-10 my-8 md:my-4 items-center pl-2 gap-2">
            <div className="flex">
              <div className="w-6 h-6 bg-yellow-300 rounded-full"></div>
              <p className="ml-2 text-sm md:text-md"> Terdapat Agenda</p>
            </div>
            <div className="flex">
              <div className="w-6 h-6  bg-blue-500 rounded-full"></div>
              <p className="ml-2 text-sm md:text-md">Tanggal dipilih</p>
            </div>
            <div className="flex">
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              <p className="ml-2 text-sm md:text-md">Tidak ada </p>
            </div>
          </div>

          {/* Navigasi Bulan */}
          <div className="flex justify-between items-center mb-4 mt-4">
            <button
              className="px-3 py-1 bg-gray-200 rounded-lg"
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear(currentYear - 1);
                } else {
                  setCurrentMonth(currentMonth - 1);
                }
              }}
            >
              ←
            </button>

            <h2 className="text-xl font-bold">
              {new Date(currentYear, currentMonth).toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            <button
              className="px-3 py-1 bg-gray-200 rounded-lg"
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear(currentYear + 1);
                } else {
                  setCurrentMonth(currentMonth + 1);
                }
              }}
            >
              →
            </button>
          </div>

          {/* Kalender tanggal sederhana */}
          <div className="grid grid-cols-7 gap-3 mb-6">
            {daysInMonth.map((date, idx) => {
              const hasAgenda = rapatList.some((r) => isSameDay(new Date(r.tanggalMulai), date));

              const isSelected = isSameDay(selectedDate, date);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(new Date(currentYear, currentMonth, date.getDate()))}
                  className={`flex justify-center items-center p-2 
          w-8 h-8 md:w-12 md:h-12 font-bold rounded-full 
          text-md md:text-xl transition-all duration-200
          ${isSelected ? "bg-blue-500 text-white scale-105 shadow-md" : hasAgenda ? "bg-yellow-300 hover:bg-green-300" : "bg-gray-100 hover:bg-gray-200"}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Daftar agenda di tanggal terpilih */}
          <div>
            {loading ? (
              <p className="text-gray-400">Memuat agenda...</p>
            ) : error ? (
              <p className="text-red-600">Terjadi kesalahan: {error}</p>
            ) : events.length > 0 ? (
              events.map((eventData) => (
                <div key={eventData.id} className="p-3 mb-2 rounded-lg bg-purple-800 border border-gray-200 hover:bg-purple-700 transition-all ">
                  <h2 className="font-semibold text-white">{eventData.judul || "Tanpa Judul"}</h2>

                  <h3 className="text-white text-xs">Rapat ID: {eventData.id}</h3>

                  <p className="text-sm text-white">
                    {new Date(eventData.tanggalMulai).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jakarta",
                    })}
                    {" - "}
                    {eventData.tanggalSelesai
                      ? new Date(eventData.tanggalSelesai).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Jakarta",
                        })
                      : "-"}
                  </p>
                  <a href={`/agenda/${eventData.id}`} className=" bg-green-400 hover:bg-green-600 text-black text-center px-4 py-1 rounded-lg text-sm font-medium">
                    Lihat Detail rapat
                  </a>
                  <div className="mt-3 bg-white p-2 rounded-lg text-sm">
                    {eventData.notulen ? (
                      <div className="flex flex-col space-y-2">
                        <p className="text-green-700 font-semibold">📝 Notulen: {eventData.notulen.status}</p>
                        <a href={`/notulen/${eventData.secureId}/read-only`} className="w-32 bg-blue-600 hover:bg-blue-700 text-white text-center py-1 rounded-lg text-sm font-bold">
                          Lihat Notulen
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-500">Belum ada notulen</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-20 items-center flex">
                <p className="text-gray-500 font-bold text-xl">Tidak ada agenda pada tanggal ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
