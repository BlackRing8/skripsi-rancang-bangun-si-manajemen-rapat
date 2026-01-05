"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatWIB } from "@/lib/format-time";
import Link from "next/link";

export default function DetailRapat({ rapatId }) {
  const { data: session } = useSession();
  const [rapat, setRapat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [absenLoading, setAbsenLoading] = useState(false);
  const [error, setError] = useState(null);

  const [userStatus, setUserStatus] = useState(null);
  const [canAbsen, setCanAbsen] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const canAccessNotulen = userStatus === "HADIR" || userStatus === "IZIN" || isCreator;

  const isDisabled =
    userStatus !== "DIUNDANG" || // sudah absen
    !canAbsen || // belum mulai
    absenLoading; // sedang proses;

  const afterAbsensi = userStatus !== "DIUNDANG" || absenLoading;

  const noLink = !rapat?.linkMeeting || rapat.linkMeeting.trim() === "";

  // Untuk absen
  const isAdmin = session?.user?.unit === "Admin";

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
        console.log({ data });
        setRapat(data);

        setIsCreator(data.pembuat.id === session?.user?.id);

        const start = new Date(data.tanggalMulai);
        const now = new Date();

        // jika waktu sekarang >= waktu mulai → boleh absen
        setCanAbsen(now >= start);

        const pesertaUser = data.peserta.find((p) => p.userId);
        setUserStatus(pesertaUser?.status || null);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchDetailRapat();
  }, [rapatId, session]);

  const absen = async (pesertaId, namaPeserta, status) => {
    const res = await fetch(`/api/agenda/get-my-agenda/${rapatId}/absen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pesertaId, namaPeserta, status }),
    });

    const json = await res.json();

    alert(json.message);

    setUserStatus(status);

    const updated = await fetch(`/api/agenda/get-my-agenda/${rapatId}`);
    setRapat(await updated.json());

    setAbsenLoading(false);
  };

  if (loading) return <p className="p-4">Mengambil detail rapat...</p>;

  return (
    <div className="flex flex-col items-start ">
      <div className="w-full  md:justify-start md:items-start flex flex-wrap justify-center  md:p-6 space-y-4">
        <div className="mx-5 md:mx-0 mt-5 md:mt-0 w-full h-auto bg-white rounded-xl flex flex-wrap justify-between items-center py-4 px-6">
          <h1 className="font-semibold md:text-3xl w-1/2">{rapat.judul}</h1>
          <div className="flex-col md:flex-col p-2 w-1/2">
            <p className="text-end md:text-lg">
              ⏰{" "}
              {new Date(rapat.tanggalMulai).toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            <p className="md:text-lg text-end">
              {new Date(rapat.tanggalMulai).toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(rapat.tanggalSelesai).toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              WIB
            </p>

            <p className="text-xs text-end">{rapat.lokasi}</p>
          </div>
        </div>
        <div className="w-full mx-5 md:mx-0 gap-y-6  grid md:grid-cols-2 gap-x-3 ">
          <div
            className="w-full h-auto md:overflow-y-auto  bg-white order-2 md:order-1 rounded-xl items-center  flex-col flex 
        "
          >
            <h2 className="md:z-20 bg-green-500 w-full py-2 text-center text-white rounded-t-xl font-bold text-lg md:sticky md:top-0">Daftar Peserta</h2>
            <div className="flex flex-wrap w-full">
              <table className="w-full ">
                <thead className="md:sticky md:top-[2.8rem] bg-blue-200 md:z-10">
                  <tr>
                    <th className="text-start pl-2 py-1 border-b">Nama Peserta</th>
                    <th className="text-center border-b">Status</th>
                    {canManageAbsensi && <th className="text-center border-b">Absensi</th>}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pl-2 py-2 border-2 text-xs">{rapat.pembuat.name}</td>
                    <td className="border-2  text-center px-2 "> PEMBUAT</td>
                  </tr>
                  {rapat.peserta.map((p) => (
                    <tr key={p.id}>
                      <td className="pl-2 py-2 border-2 text-xs">{p.user.name}</td>
                      <td className="border-2  text-center px-2 "> {p.status}</td>

                      {canManageAbsensi && (
                        <td className="border-2 text-center px-1 py-2">
                          <div className="flex items-center justify-center gap-x-2">
                            <button
                              onClick={() => absen(p.userId, p.user.name, "HADIR")}
                              disabled={isDisabled}
                              className={`flex py-2 px-1 md:px-4 md:py-1 rounded-md text-white transition-all 
                              ${isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                            >
                              Hadir
                            </button>

                            <button
                              onClick={() => absen(p.userId, p.user.name, "TIDAK_HADIR")}
                              disabled={afterAbsensi}
                              className={`px-2 py-1 rounded-md text-white transition-all 
          ${afterAbsensi ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                            >
                              Tidak Hadir
                            </button>

                            <button
                              onClick={() => absen(p.userId, p.user.name, "IZIN")}
                              disabled={afterAbsensi}
                              className={`px-4 py-1 rounded-md text-white transition-all 
          ${afterAbsensi ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"}`}
                            >
                              Izin
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="w-full h-full grid space-y-4 order-1 md:order-2">
            <div className="w-full flex flex-col items-start rounded-xl">
              <div className=" p-3 rounded-t-xl bg-white  ">
                <h3 className="text-lg font-semibold">Deskripsi agenda rapat:</h3>
              </div>
              <div className="w-full bg-white rounded-b-xl rounded-r-xl h-56 overflow-y-auto p-3">
                <p className="border-2 border-gray-400 h-48 overflow-y-auto p-2 rounded-xl bg-gray-100 md:text-xl">{rapat.deskripsi}</p>
              </div>
            </div>
            <div className=" flex  justify-center md:justify-start">
              <div className="w-full p-8  bg-white rounded-xl flex flex-col overflow-x-hidden items-start  justify-center">
                <h5 className="font-bold">Link Google Meet:</h5>
                {noLink ? (
                  <p>Tidak terdapat Link google Meet </p>
                ) : (
                  <Link href={rapat.linkMeeting} className="text-blue-600 underline my-1 py-2">
                    {rapat.linkMeeting}
                  </Link>
                )}
                <h5 className="font-bold mt-4">Link Notulen:</h5>
                {canAccessNotulen ? (
                  <div className="space-y-2  md:space-x-2 mt-2">
                    <a href={`/notulen/${rapat.notulen.id}/read-only`} className="text-white text-center text-sm font-medium border rounded-md bg-blue-500 px-3 py-1 my-2 hover:bg-blue-400">
                      Lihat
                    </a>

                    <Link href="" target="_blank" rel="noopener noreferrer" className="text-white text-center text-sm font-medium border rounded-md hover:bg-green-400 bg-green-600 px-3 py-1 my-2">
                      Download
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-red-600 font-medium my-2 text-center">
                    Anda belum dapat mengakses notulen.
                    <br />
                    Hanya peserta yang <b>hadir</b> atau <b>izin</b> yang dapat mengakses.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
