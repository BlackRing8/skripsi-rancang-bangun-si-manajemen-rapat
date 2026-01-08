"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompletePage() {
  const router = useRouter();

  const [units, setUnits] = useState([]);
  const [rows, setRows] = useState([
    { unitId: "", jabatanOptions: [], jabatanId: "" }, // minimal 1 row
  ]);

  const [loading, setLoading] = useState(false);

  // =============================
  // CEK USER: kalau sudah lengkap → redirect
  // =============================
  useEffect(() => {
    const cekUser = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user/cek-user");
        const data = await res.json();

        if (data.profileCompleted === true) {
          return router.push("/panel");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.log(err);
      }
    };

    cekUser();
  }, [router]);

  // =============================
  // AMBIL SEMUA UNIT
  // =============================
  useEffect(() => {
    const fetchUnits = async () => {
      const res = await fetch("/api/unit");
      const data = await res.json();
      setUnits(data);
    };
    fetchUnits();
  }, []);

  // =============================
  // AMBIL JABATAN DINAMIS
  // =============================
  const fetchJabatan = async (unitId, index) => {
    const res = await fetch(`/api/jabatan?unitId=${unitId}`);
    const data = await res.json();

    const update = [...rows];
    update[index].jabatanOptions = data;
    update[index].jabatanId = "";
    setRows(update);
  };

  // =============================
  // TAMBAH ROW (untuk rangkap jabatan)
  // =============================
  const addRow = () => {
    setRows([...rows, { unitId: "", jabatanOptions: [], jabatanId: "" }]);
  };

  // =============================
  // HAPUS ROW
  // =============================
  const removeRow = (i) => {
    if (rows.length === 1) return; // minimal 1
    setRows(rows.filter((_, idx) => idx !== i));
  };

  // =============================
  // SIMPAN PROFIL KE BACKEND
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // validasi semua row wajib terisi
    const valid = rows.every((r) => r.unitId && r.jabatanId);
    if (!valid) {
      alert("Harap lengkapi semua unit dan jabatan.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/update-completed-profile", {
        method: "POST",
        body: JSON.stringify({
          selections: rows.map((r) => ({
            unitId: r.unitId,
            jabatanId: r.jabatanId,
          })),
        }),
      });

      if (!res.ok) {
        alert(result.error || "Gagal menyimpan profile");
        return;
      } else {
        alert("berhasil menyimpan data");
        return router.push("/dashboard");
      }
    } catch (error) {
      console.log("Error:", error);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // LOADING SCREEN
  // =============================
  if (loading) {
    return <div className="flex w-full h-screen justify-center items-center text-lg font-bold">Loading...</div>;
  }

  // =============================
  // UI
  // =============================
  return (
    <div className="flex w-full min-h-screen bg-linear-to-br from-white via-indigo-300 to-white justify-center items-center p-4">
      <div className="max-w-xl w-full mx-auto p-6 bg-white shadow rounded-lg">
        <h1 className="text-xl font-bold mb-5">Lengkapi Profil Anda</h1>

        {/* ======================== */}
        {/* LIST ROW UNIT + JABATAN */}
        {/* ======================== */}
        {rows.map((row, i) => (
          <div key={i} className="mb-5 border p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold">Jabatan {i + 1}</p>

              {rows.length > 1 && (
                <button onClick={() => removeRow(i)} className="text-red-500 text-sm">
                  Hapus
                </button>
              )}
            </div>

            {/* UNIT */}
            <label className="block mb-2 font-semibold">Pilih Unit</label>
            <select
              className="w-full p-2 border rounded mb-4"
              value={row.unitId}
              onChange={(e) => {
                const update = [...rows];
                update[i].unitId = e.target.value;

                setRows(update);
                fetchJabatan(e.target.value, i);
              }}
            >
              <option value="">-- Pilih Unit --</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.nama}
                </option>
              ))}
            </select>

            {/* JABATAN */}
            <label className="block mb-2 font-semibold">Pilih Jabatan</label>
            <select
              className="w-full p-2 border rounded"
              value={row.jabatanId}
              onChange={(e) => {
                const update = [...rows];
                update[i].jabatanId = e.target.value;
                setRows(update);
              }}
              disabled={!row.unitId}
            >
              <option value="">-- Pilih Jabatan --</option>
              {row.jabatanOptions.map((jab) => (
                <option key={jab.id} value={jab.id}>
                  {jab.nama}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* BUTTON TAMBAH JABATAN */}
        <button className="w-full bg-gray-200 p-2 rounded mb-4 hover:bg-gray-300" onClick={addRow}>
          + Tambah Jabatan
        </button>

        {/* SUBMIT */}
        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Profil"}
        </button>
      </div>
    </div>
  );
}
