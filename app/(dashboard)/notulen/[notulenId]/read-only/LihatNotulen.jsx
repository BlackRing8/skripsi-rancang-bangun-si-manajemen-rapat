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
  const [pembahasan, setPembahasan] = useState([]);
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
          <h1 className="text-lg md:text-2xl font-bold">Edit Notulen</h1>
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

      {/* PEMBUKAAN */}
      <section className="mb-6">
        <label className="font-semibold block mb-2">Pembukaan</label>
        <textarea className="w-full border rounded-lg p-3" rows={4} disabled={!isEditable} value={notulen.pembukaan || ""} onChange={(e) => setNotulen({ ...notulen, pembukaan: e.target.value })} placeholder="Ringkasan pembukaan rapat" />
      </section>

      {/* PEMBAHASAN */}
      <section className="mb-6">
        <h2 className="font-semibold mb-3 md:text-2xl">Pembahasan Agenda</h2>

        {notulen.pembahasan.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <input
              className="w-full border rounded p-2 mb-2"
              placeholder="Judul Agenda"
              disabled={!isEditable}
              value={item.judulAgenda}
              onChange={(e) => {
                const updated = [...notulen.pembahasan];
                updated[index].judulAgenda = e.target.value;
                setNotulen({ ...notulen, pembahasan: updated });
              }}
            />

            <textarea
              className="w-full border rounded p-2 mb-2"
              placeholder="Pembahasan"
              disabled={!isEditable}
              value={item.pembahasan}
              onChange={(e) => {
                const updated = [...notulen.pembahasan];
                updated[index].pembahasan = e.target.value;
                setNotulen({ ...notulen, pembahasan: updated });
              }}
            />

            <textarea
              className="w-full border rounded p-2"
              placeholder="Kesimpulan"
              disabled={!isEditable}
              value={item.kesimpulan}
              onChange={(e) => {
                const updated = [...notulen.pembahasan];
                updated[index].kesimpulan = e.target.value;
                setNotulen({ ...notulen, pembahasan: updated });
              }}
            />
          </div>
        ))}
        {pembahasan.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <input
              type="text"
              placeholder="Judul Agenda"
              value={item.judulAgenda}
              onChange={(e) => {
                const copy = [...pembahasan];
                copy[index].judulAgenda = e.target.value;
                setPembahasan(copy);
              }}
              className="w-full border rounded p-2 mb-2"
            />

            <textarea
              placeholder="Pembahasan"
              value={item.pembahasan}
              onChange={(e) => {
                const copy = [...pembahasan];
                copy[index].pembahasan = e.target.value;
                setPembahasan(copy);
              }}
              className="w-full border rounded p-2 mb-2"
            />

            <textarea
              placeholder="Kesimpulan"
              value={item.kesimpulan}
              onChange={(e) => {
                const copy = [...pembahasan];
                copy[index].kesimpulan = e.target.value;
                setPembahasan(copy);
              }}
              className="w-full border rounded p-2"
            />
          </div>
        ))}
      </section>

      {/* KEPUTUSAN */}
      <section className="mb-6">
        <section className="mb-6 border-t pt-6">
          <h2 className="font-semibold mb-3 md:text-2xl">Keputusan Rapat</h2>
          {(notulen.keputusan?.length ?? 0) === 0 && <p className="text-gray-500 text-sm">Belum ada keputusan</p>}
          <KeputusanEditor notulen={notulen} setNotulen={setNotulen} isEditable={isEditable} />
        </section>
      </section>

      {/* PENUTUP */}
      <section className="mb-6">
        <label className="font-semibold block mb-2">Penutup</label>
        <textarea className="w-full border rounded-lg p-3" rows={3} disabled={!isEditable} value={notulen.penutup || ""} onChange={(e) => setNotulen({ ...notulen, penutup: e.target.value })} />
      </section>
    </div>
  );
}
