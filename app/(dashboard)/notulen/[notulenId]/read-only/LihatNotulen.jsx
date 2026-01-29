"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatWIBCumaHari, formatWIBCumaWaktu } from "@/lib/format-time";

function KeputusanEditor({ notulen, setNotulen, isEditable }) {
  const keputusan = notulen.keputusan ?? [];

  return (
    <div>
      {keputusan.map((item, index) => (
        <div key={index} className="border rounded p-4 mb-3">
          <textarea
            className="w-full border rounded p-2 mb-2"
            placeholder="Isi keputusan"
            value={item.keputusan || ""}
            disabled={!isEditable}
            onChange={(e) => {
              const value = e.target.value;
              setNotulen((prev) => {
                const updated = [...prev.keputusan];
                updated[index] = {
                  ...updated[index],
                  keputusan: value,
                };
                return { ...prev, keputusan: updated };
              });
            }}
          />

          <input
            className="w-full border rounded p-2 mb-2"
            placeholder="Penanggung Jawab"
            value={item.penanggungJawab || ""}
            disabled={!isEditable}
            onChange={(e) => {
              const value = e.target.value;
              setNotulen((prev) => {
                const updated = [...prev.keputusan];
                updated[index] = {
                  ...updated[index],
                  penanggungJawab: value,
                };
                return { ...prev, keputusan: updated };
              });
            }}
          />

          <label className="font-semibold">Tenggat waktu:</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            disabled={!isEditable}
            value={item.tenggatWaktu ? new Date(item.tenggatWaktu).toISOString().slice(0, 10) : ""}
            onChange={(e) => {
              const value = e.target.value;
              setNotulen((prev) => {
                const updated = [...prev.keputusan];
                updated[index] = {
                  ...updated[index],
                  tenggatWaktu: value,
                };
                return { ...prev, keputusan: updated };
              });
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function LihatNotulen({ notulenId }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [notulen, setNotulen] = useState(null);
  const router = useRouter();

  // ambil draft notulen
  useEffect(() => {
    const fetchDraftNotulen = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/notulen/${notulenId}/read`);
        const data = await response.json();

        // if (response.status === 403) {
        //   alert(data.message);
        //   router.push("/dashboard");
        //   return false;
        // }

        setNotulen(data);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchDraftNotulen();
  }, [notulenId, session]);

  if (loading) {
    return (
      <div className="flex w-full justify-start items-start p-12">
        <h1>Mengambil draft Notulen....</h1>
      </div>
    );
  }

  if (!notulen) {
    return <p>Data tidak ditemukan</p>;
  }

  const isEditable = session.user.id === null; // status = "DRAFT", "FINAL", "DIKUNCI"

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* HEADER NOTULEN */}
      <div className="mb-6 justify-between flex">
        <div>
          <h1 className="text-lg md:text-2xl font-bold">Notulensi Rapat</h1>
          <p className="text-xs md:text-sm text-gray-600">Jenis: {notulen.jenisNotulen?.replace("_", " ")}</p>
          {notulen.status === "DRAFT" && <span className="inline-block mt-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs md:text-sm font-semibold">{notulen.status}</span>}
          {notulen.status === "FINAL" && <span className="inline-block mt-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs md:text-sm font-semibold">{notulen.status}</span>}
          {notulen.status === "DIKUNCI" && <span className="inline-block mt-2 px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs md:text-sm font-semibold">{notulen.status}</span>}
        </div>
        <img src="/logo/logo-trilogi-teks.png" alt="logo-trilogi" className="h-10 w-30 md:h-20 md:w-80" />
      </div>

      {/* Detail judul rapat */}
      <section className="mb-6">
        <table>
          <thead className="hidden">
            <tr>
              <th>&nbsp;</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-semibold text-md ">Agenda rapat </td>
              <td className=" text-xs pl-2">:</td>
              <td className=" text-start px-2 ">{notulen.rapat.judul}</td>
            </tr>
            <tr>
              <td className="font-semibold text-md ">Pimpinan rapat </td>
              <td className=" text-xs pl-2">:</td>
              <td className=" text-start px-2 ">{notulen.rapat.pembuat.name}</td>
            </tr>
            <tr>
              <td className=" font-semibold text-md ">Hari/Tanggal </td>
              <td className=" text-xs pl-2">:</td>
              <td className=" text-start px-2 ">{formatWIBCumaHari(notulen.rapat.tanggalMulai)}</td>
            </tr>
            <tr>
              <td className=" font-semibold text-md ">Waktu </td>
              <td className=" text-xs pl-2">:</td>
              <td className=" text-start px-2 ">{formatWIBCumaWaktu(notulen.rapat.tanggalMulai)} WIB</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* KEPUTUSAN */}
      <section className="mb-6">
        <section className="mb-6 border-t pt-2">
          <h2 className="font-semibold mb-3 md:text-2xl">Keputusan Rapat</h2>
          {(notulen.keputusan?.length ?? 0) === 0 && <p className="text-gray-500 text-sm">Belum ada keputusan</p>}
          <KeputusanEditor notulen={notulen} setNotulen={setNotulen} isEditable={isEditable} />
        </section>
      </section>

      {/* Tanda tangan */}
      <section className="mb-6">
        <div className="w-full flex border-t pt-3 justify-between">
          <div className="justify-end">
            <div className="pt-20">
              <a href={`/api/notulen/${notulenId}/download`} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-300 text-white px-12 py-6 rounded-full text-sm font-bold">
                Download PDF
              </a>
            </div>
          </div>
          <div className=" ">
            <p className="text-center px-12">Dibuat oleh:</p>
            <div className="h-36 w-36 flex justify-center items-center mx-auto ">
              <img src={notulen.imageLink} width="130" height="130" />
            </div>
            <p className="text-center px-10">({notulen.rapat.pembuat.name})</p>
          </div>
        </div>
      </section>
    </div>
  );
}
