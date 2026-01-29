"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatWIBCumaHari, formatWIBCumaWaktu } from "@/lib/format-time";
import Swal from "sweetalert2";

function KeputusanEditor({ notulen, setNotulen, isEditable }) {
  const tambahKeputusan = () => {
    setNotulen((prev) => ({
      ...prev,
      keputusan: [...prev.keputusan, { keputusan: "", penanggungJawab: "", tenggatWaktu: "" }],
    }));
  };

  const hapusKeputusan = (index) => {
    setNotulen((prev) => ({
      ...prev,
      keputusan: prev.keputusan.filter((_, i) => i !== index),
    }));
  };

  return (
    <div>
      {notulen.keputusan.map((item, index) => (
        <div key={index} className="border rounded p-4 mb-4">
          <textarea
            className="w-full border rounded p-2 mb-2"
            placeholder="Hasil keputusan rapat"
            value={item.keputusan}
            disabled={!isEditable}
            onChange={(e) => {
              const updated = [...notulen.keputusan];
              updated[index].keputusan = e.target.value;
              setNotulen({ ...notulen, keputusan: updated });
            }}
          />

          <input
            className="w-full border rounded p-2 mb-2"
            placeholder="Penanggung Jawab"
            value={item.penanggungJawab}
            disabled={!isEditable}
            onChange={(e) => {
              const updated = [...notulen.keputusan];
              updated[index].penanggungJawab = e.target.value;
              setNotulen({ ...notulen, keputusan: updated });
            }}
          />

          <input
            type="date"
            className="w-full border rounded p-2"
            disabled={!isEditable}
            value={item.tenggatWaktu || ""}
            onChange={(e) => {
              const updated = [...notulen.keputusan];
              updated[index].tenggatWaktu = e.target.value;
              setNotulen({ ...notulen, keputusan: updated });
            }}
          />

          {isEditable && (
            <button type="button" onClick={() => hapusKeputusan(index)} className="text-red-600 text-sm mt-2">
              Hapus keputusan
            </button>
          )}
        </div>
      ))}

      {isEditable && (
        <button type="button" onClick={tambahKeputusan} className="text-blue-600 font-semibold">
          + Tambah Keputusan
        </button>
      )}
    </div>
  );
}

export default function DetailEditNotulen({ notulenId }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [notulen, setNotulen] = useState({
    pembukaan: "",
    keputusan: [],
  });

  // const [pembahasan, setPembahasan] = useState([]);
  // const [showKeputusan, setShowKeputusan] = useState(false);
  const [rapat, setRapat] = useState(null);
  const router = useRouter();

  // ambil draft notulen
  useEffect(() => {
    const fetchDraftNotulen = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/notulen/${notulenId}/draft`);
        const data = await response.json();

        if (response.status === 403) {
          alert(data.message);
          router.replace("/");
          return false;
        }
        setRapat(data.draft.rapat);

        setNotulen({
          ...data.draft,
          pembahasan: data.draft.pembahasan ?? [],
          keputusan: data.draft.keputusan ?? [],
        });

        if (data.draft.status === "FINAL") {
          setShowKeputusan(true);
        }
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchDraftNotulen();
  }, [notulenId, session, router]);

  // handler simpan draft notulen

  const simpanDanKunci = async () => {
    if (notulen.keputusan.length === 0) {
      Swal.fire("Error", "Minimal satu keputusan harus diisi", "error");
      return;
    }

    const result = await Swal.fire({
      heightAuto: false,
      position: "top-center",
      icon: "warning",
      title: "Setelah difinalisasi, notulen tidak dapat diubah lagi.",
      text: "Pastikan seluruh pembahasan dan keputusan sudah benar.",
      showConfirmButton: true,
      showCancelButton: true,
      scrollbarPadding: false,
      confirmButtonText: "Lanjutkan",
      cancelButtonText: "Batal",
    });

    // Jika user batal
    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/notulen/${notulenId}/finalisasi`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // pembukaan: notulen.pembukaan,
          keputusan: notulen.keputusan,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await Swal.fire({
        icon: "success",
        title: "Notulen berhasil disimpan & dikunci",
        timer: 2000,
        showConfirmButton: false,
      });

      router.replace(`/notulen/${notulenId}/read-only`);
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

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

  const isEditable = notulen.status === "DRAFT" || notulen.status === "FINAL" || session.user.id === notulen.dibuatOleh; // status = "DRAFT", "FINAL", "DIKUNCI"

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* HEADER NOTULEN */}
      <div className="mb-6 justify-between flex">
        <div>
          <h1 className="text-lg md:text-2xl font-bold">Edit Notulen</h1>
          <p className="text-xs md:text-sm text-gray-600">Jenis: {notulen.jenisNotulen?.replace("_", " ")}</p>
          {notulen.status === "DRAFT" && <span className="inline-block mt-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs md:text-sm font-semibold">{notulen.status}</span>}
          {notulen.status === "FINAL" && <span className="inline-block mt-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs md:text-sm font-semibold">{notulen.status}</span>}
          {notulen.status === "DIKUNCI" && <span className="inline-block mt-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs md:text-sm font-semibold">{notulen.status}</span>}
        </div>
        <img src="/logo/logo-trilogi-teks.png" alt="logo-trilogi" className="h-10 w-30 md:h-20 md:w-80" />
      </div>
      {/* Detail judul rapat */}
      {rapat && (
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
                <td className=" text-start px-2 ">{rapat.judul}</td>
              </tr>
              <tr>
                <td className="font-semibold text-md ">Pimpinan rapat </td>
                <td className=" text-xs pl-2">:</td>
                <td className=" text-start px-2 ">{rapat.pembuat.name}</td>
              </tr>
              <tr>
                <td className=" font-semibold text-md ">Hari/Tanggal </td>
                <td className=" text-xs pl-2">:</td>
                <td className=" text-start px-2 ">{formatWIBCumaHari(rapat.tanggalMulai)}</td>
              </tr>
              <tr>
                <td className=" font-semibold text-md ">Waktu </td>
                <td className=" text-xs pl-2">:</td>
                <td className=" text-start px-2 ">{formatWIBCumaWaktu(rapat.tanggalMulai)}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      <section className="mb-6 border-t pt-6">
        <h2 className="font-semibold mb-3 md:text-2xl">Keputusan Rapat</h2>
        {(notulen.keputusan?.length ?? 0) === 0 && <p className="text-gray-500 text-sm">Belum ada keputusan</p>}
        <KeputusanEditor notulen={notulen} setNotulen={setNotulen} isEditable={isEditable} />
      </section>

      {/* Tanda tangan */}
      <section className="mb-6">
        <div className="w-full flex border-t pt-3 justify-end">
          <div>
            <p className="text-center px-12">Dibuat oleh:</p>
            <div className="h-36 w-36  mx-auto"></div>
            <p className="text-center px-10">({rapat?.pembuat.name})</p>
          </div>
        </div>
      </section>

      {/* ACTION */}
      {isEditable && (
        <div className={`${notulen.status === "DIKUNCI" ? "hidden" : "flex md:gap-6 gap-2"}`}>
          <button
            onClick={simpanDanKunci}
            disabled={loading || notulen.status === "FINAL" || notulen.status === "DIKUNCI"}
            className={`${loading ? "px-6 py-2 bg-gray-300 rounded-lg font-semibold" : "px-6 py-2 bg-green-400 rounded-lg font-semibold disabled:bg-gray-200 disabled:cursor-not-allowed"}`}
          >
            {loading ? "Menyimpan..." : "Simpan Dan Kunci"}
          </button>
        </div>
      )}
    </div>
  );
}
