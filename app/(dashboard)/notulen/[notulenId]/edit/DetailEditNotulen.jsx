"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatWIBCumaHari, formatWIBCumaWaktu } from "@/lib/format-time";
import Swal from "sweetalert2";

function KeputusanEditor({ notulen, setNotulen, isEditable }) {
  const keputusan = notulen.keputusan ?? [];

  const tambahKeputusan = () => {
    setNotulen((prev) => ({
      ...prev,
      keputusan: [
        ...prev.keputusan,
        {
          keputusan: "",
          penanggungJawab: "",
          tenggatWaktu: "",
        },
      ],
    }));
  };

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

      {isEditable && (
        <button onClick={tambahKeputusan} className="text-blue-600 font-semibold">
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
    pembahasan: [],
    keputusan: [],
  });
  // const [pembahasan, setPembahasan] = useState([]);
  const [showKeputusan, setShowKeputusan] = useState(false);
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
          router.replace("/dashboard");
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

  // Handler tambah agenda pembahasan
  const tambahAgenda = () => {
    setNotulen((prev) => ({
      ...prev,
      pembahasan: [
        ...(prev.pembahasan || []),
        {
          judulAgenda: "",
          pembahasan: "",
          kesimpulan: "",
        },
      ],
    }));
  };

  // handler simpan draft notulen

  const simpanDraft = async () => {
    try {
      setLoading(true);

      const payload = {
        pembukaan: notulen.pembukaan,
        penutup: notulen.penutup,
        pembahasan: notulen.pembahasan,
      };

      const res = await fetch(`/api/notulen/${notulenId}/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setNotulen({
        ...data.notulen,
        pembahasan: data.notulen.pembahasan || [],
        keputusan: data.notulen.keputusan || [],
      });

      setShowKeputusan(true);
      alert("Draft berhasil disimpan");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const simpanKeputusan = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/notulen/${notulenId}/keputusan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keputusan: notulen.keputusan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan keputusan");
      }

      // update state dari backend (PENTING)
      setNotulen((prev) => ({
        ...prev,
        keputusan: data.keputusan,
      }));

      alert("Keputusan berhasil disimpan");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const finalisasi = async () => {
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
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal finalisasi notulen");
      }

      setNotulen((prev) => ({
        ...prev,
        status: "DIKUNCI",
        dikunciPada: new Date().toISOString(),
      }));

      await Swal.fire({
        heightAuto: false,
        icon: "success",
        title: "Notulen berhasil difinalisasi",
        text: "Notulen telah dikunci dan tidak dapat diubah kembali.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        heightAuto: false,
        icon: "error",
        title: "Gagal finalisasi",
        text: error.message,
      });
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

      {/* PEMBUKAAN */}
      <section className="mb-6">
        <label className="font-semibold block mb-2 md:text-2xl">Pembukaan</label>
        <textarea className="w-full border rounded-lg p-3" rows={4} disabled={!isEditable} value={notulen.pembukaan || ""} onChange={(e) => setNotulen({ ...notulen, pembukaan: e.target.value })} placeholder="Ringkasan pembukaan rapat" />
      </section>

      {/* PEMBAHASAN */}
      <section className="mb-6">
        <h2 className="font-semibold md:text-2xl mb-3">Pembahasan Agenda</h2>

        {Array.isArray(notulen.pembahasan) &&
          notulen.pembahasan.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4">
              <input
                className="w-full border rounded p-2 mb-2"
                value={item.judulAgenda || ""}
                placeholder="Judul Agenda"
                onChange={(e) => {
                  const updated = [...notulen.pembahasan];
                  updated[index].judulAgenda = e.target.value;
                  setNotulen({ ...notulen, pembahasan: updated });
                }}
              />

              <textarea
                className="w-full border rounded p-2 mb-2"
                value={item.pembahasan || ""}
                placeholder="Pembahasan"
                onChange={(e) => {
                  const updated = [...notulen.pembahasan];
                  updated[index].pembahasan = e.target.value;
                  setNotulen({ ...notulen, pembahasan: updated });
                }}
              />

              <textarea
                className="w-full border rounded p-2"
                value={item.kesimpulan || ""}
                placeholder="Kesimpulan"
                onChange={(e) => {
                  const updated = [...notulen.pembahasan];
                  updated[index].kesimpulan = e.target.value;
                  setNotulen({ ...notulen, pembahasan: updated });
                }}
              />
            </div>
          ))}

        {isEditable && notulen.status === "DRAFT" && (
          <button type="button" onClick={tambahAgenda} className="text-blue-600 font-semibold">
            + Tambah Agenda Pembahasan
          </button>
        )}
      </section>

      {/* KEPUTUSAN */}
      {showKeputusan && (
        <section className="mb-6 border-t pt-6">
          <h2 className="font-semibold mb-3 md:text-2xl">Keputusan Rapat</h2>
          {(notulen.keputusan?.length ?? 0) === 0 && <p className="text-gray-500 text-sm">Belum ada keputusan</p>}
          <KeputusanEditor notulen={notulen} setNotulen={setNotulen} isEditable={isEditable} />
        </section>
      )}

      <section className="mb-6">
        {showKeputusan === false && (
          <div>
            <h2 className="font-semibold mb-3">Keputusan Rapat</h2>
            {(notulen.keputusan?.length ?? 0) === 0 && <p className="text-gray-500 text-sm">Belum ada keputusan</p>}
          </div>
        )}
      </section>

      {/* PENUTUP */}
      <section className="mb-6">
        <label className="font-semibold block mb-2">Penutup</label>
        <textarea className="w-full border rounded-lg p-3" rows={3} disabled={!isEditable} value={notulen.penutup || ""} onChange={(e) => setNotulen({ ...notulen, penutup: e.target.value })} />
      </section>

      {/* ACTION */}
      {isEditable && (
        <div className={`${notulen.status === "DIKUNCI" ? "hidden" : "flex md:gap-6 gap-2"}`}>
          <button
            onClick={simpanDraft}
            disabled={loading || notulen.status === "FINAL" || notulen.status === "DIKUNCI"}
            className={`${loading ? "px-6 py-2 bg-gray-300 rounded-lg font-semibold" : "px-6 py-2 bg-green-400 rounded-lg font-semibold disabled:bg-gray-200 disabled:cursor-not-allowed"}`}
          >
            {loading ? "Menyimpan..." : "Simpan Draft"}
          </button>

          <button
            onClick={simpanKeputusan}
            disabled={loading || notulen.status === "DRAFT" || notulen.status === "DIKUNCI"}
            className={`${loading ? "px-6 py-2 bg-gray-300 rounded-lg font-semibold" : "px-6 py-2 bg-yellow-400 rounded-lg font-semibold disabled:cursor-not-allowed disabled:bg-gray-200"}`}
          >
            {loading ? "Menyimpan..." : "Simpan Keputusan"}
          </button>
          <button
            onClick={finalisasi}
            disabled={loading || notulen.status === "DRAFT" || notulen.keputusan?.length === 0}
            className={`${loading ? "px-6 py-2 bg-gray-300 rounded-lg font-semibold" : "px-6 py-2 bg-blue-600 rounded-lg font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-800"}`}
          >
            {loading ? "Menyimpan..." : "Finalisasi Notulen"}
          </button>
        </div>
      )}
    </div>
  );
}
