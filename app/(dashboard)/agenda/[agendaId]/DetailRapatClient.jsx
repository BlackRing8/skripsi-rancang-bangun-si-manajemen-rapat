"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DetailRapat({ rapatId }) {
  const { data: session } = useSession();
  const [rapat, setRapat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [absenLoading, setAbsenLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const [userStatus, setUserStatus] = useState();
  const [canAbsen, setCanAbsen] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const noLink = !rapat?.linkMeeting || rapat.linkMeeting.trim() === "";

  // Untuk absen
  const isAdmin = session?.user?.isAdmin === true;

  const canManageAbsensi = isCreator || isAdmin;

  //   ambil data rapat berdasarkan rapatId
  useEffect(() => {
    const fetchDetailRapat = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/agenda/get-my-agenda/${rapatId}`);
        if (!response.ok) {
          throw new Error("Gagal mengambil data rapat");
        }
        const data = await response.json();

        setRapat(data);

        setIsCreator(data.pembuat.id === session?.user?.id);

        const start = new Date(data.tanggalMulai);
        const now = new Date();

        // jika waktu sekarang >= waktu mulai → boleh absen
        setCanAbsen(now >= start);

        const pesertaUser = data.peserta.find((p) => p.userId);

        setUserStatus(pesertaUser?.status);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchDetailRapat();
  }, [rapatId, session]);

  const absen = async (pesertaId, namaPeserta, status) => {
    try {
      setAbsenLoading(true);
      const res = await fetch(`/api/agenda/get-my-agenda/${rapatId}/absen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesertaId, namaPeserta, status }),
      });

      const json = await res.json();

      alert(json.message);

      setUserStatus(status);

      const updated = await fetch(`/api/agenda/get-my-agenda/${rapatId}`);
      const dataUpdate = await updated.json();
      setRapat(dataUpdate);
    } catch (error) {
      alert(error.message);
    } finally {
      setAbsenLoading(false);
      router.refresh();
    }
  };

  if (loading) return <p className="p-4">Mengambil detail rapat...</p>;

  return (
    <div className="min-h-screen w-full  p-4 md:p-8 space-y-8">
      {/* ================= HEADER ================= */}
      <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-300 p-6 md:p-8 flex flex-col md:flex-row md:justify-between gap-6">
        <h1 className="font-bold text-2xl md:text-4xl text-gray-900 md:w-1/2 leading-tight">{rapat.judul}</h1>

        <div className="md:w-1/2 text-sm md:text-base text-gray-900 md:text-right space-y-1 border-t md:border-t-0 pt-4 md:pt-0 border-slate-300">
          <p className="font-semibold text-blue-700">
            ⏰{" "}
            {new Date(rapat.tanggalMulai).toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="font-medium">
            {new Date(rapat.tanggalMulai).toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            –{" "}
            {new Date(rapat.tanggalSelesai).toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            WIB
          </p>
          <p className="text-gray-600">{rapat.lokasi}</p>
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* ================= PESERTA ================= */}
        <div className="xl:col-span-3 bg-white rounded-3xl overflow-hidden order-2 shadow-xl border border-slate-300">
          <h2 className="bg-emerald-600 text-white font-bold text-lg text-center py-3">Daftar Peserta</h2>

          <div className="overflow-x-auto max-h-[460px]">
            <table className="w-full text-sm">
              <thead className="bg-slate-200 text-gray-900 sticky top-0 z-10">
                <tr>
                  <th className="text-left px-4 py-3">Nama</th>
                  <th className="text-center px-4 py-3">Status</th>
                  {canManageAbsensi && <th className="text-center px-4 py-3">Absensi</th>}
                </tr>
              </thead>

              <tbody className="divide-y">
                <tr className="bg-slate-50/50">
                  <td className="px-4 py-3 font-medium">{rapat.pembuat.name}</td>
                  <td className="px-4 py-3 text-center">PEMBUAT</td>
                </tr>

                {rapat.peserta.map((p) => {
                  const afterAbsensi = absenLoading;

                  const isDisabled =
                    afterAbsensi || // sudah absen
                    !canAbsen || // belum mulai
                    absenLoading ||
                    p.status === "HADIR"; // sedang proses;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 md:text-lg">{p.user.name}</td>
                      <td className="px-4 py-3 text-center">{p.status}</td>

                      {canManageAbsensi && (
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => absen(p.userId, p.user.name, "HADIR")}
                              disabled={isDisabled}
                              className={`px-3 py-1 md:px-6 md:py-1.5 rounded-full text-xs md:text-md font-medium text-white
                        ${isDisabled ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"}`}
                            >
                              Hadir
                            </button>

                            <button
                              onClick={() => absen(p.userId, p.user.name, "TIDAK_HADIR")}
                              disabled={afterAbsensi}
                              className={`px-3 py-1 md:px-6 md:py-1.5 rounded-full text-xs md:text-md font-medium text-white
                        ${afterAbsensi ? "bg-gray-400" : "bg-rose-600 hover:bg-rose-700"}`}
                            >
                              Tidak
                            </button>

                            <button
                              onClick={() => absen(p.userId, p.user.name, "IZIN")}
                              disabled={afterAbsensi}
                              className={`px-3 py-1 md:px-6 md:py-1.5 rounded-full text-xs md:text-md font-medium text-white
                        ${afterAbsensi ? "bg-gray-400" : "bg-amber-500 hover:bg-amber-600"}`}
                            >
                              Izin
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= SIDE PANEL ================= */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* DESKRIPSI */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-300 p-6">
            <h3 className="font-bold text-gray-900 mb-3">Deskripsi Agenda Rapat</h3>
            <p className="bg-slate-100 border border-slate-300 rounded-2xl p-4 text-gray-900 leading-relaxed">{rapat.deskripsi}</p>
          </div>

          {/* LINKS */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-300 p-6 space-y-4">
            <div>
              <h5 className="font-bold text-gray-900">Link Google Meet</h5>
              {noLink || rapat.linkMeeting === "-" ? (
                <p className="text-gray-500">Tidak tersedia</p>
              ) : (
                <a href={rapat.linkMeeting} className="text-blue-700 font-semibold underline break-all">
                  {rapat.linkMeeting}
                </a>
              )}
            </div>

            <div>
              <h5 className="font-bold text-gray-900">Link Notulen</h5>

              <div className="flex gap-3 mt-2">
                <a href={`/notulen/${rapat.notulen.id}/read-only`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-bold">
                  Lihat
                </a>
                <a href={`/api/notulen/${rapat.notulen.id}/download`} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-bold">
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
