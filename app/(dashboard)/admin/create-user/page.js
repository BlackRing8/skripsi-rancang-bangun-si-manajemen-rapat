"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function CreateUserPage() {
  const [email, setEmail] = useState("");
  const [nik, setNik] = useState("");
  const [name, setName] = useState("");

  const [units, setUnits] = useState([]);
  const [rows, setRows] = useState([
    { unitId: "", jabatanOptions: [], jabatanId: "" }, // minimal 1 row
  ]);

  const [loading, setLoading] = useState(false);

  const fetchUnits = async () => {
    const res = await fetch("/api/unit");
    const data = await res.json();
    setUnits(data);
  };
  // =============================
  // AMBIL SEMUA UNIT
  // =============================
  useEffect(() => {
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

  // SUBMIT FUNGSI
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          nik,
          selections: rows.map((r) => ({
            unitId: r.unitId,
            jabatanId: r.jabatanId,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Swal.fire("Berhasil", "User berhasil dibuat", "success");
      setEmail("");
      setNik("");
      fetchUnits();
    } catch {
      Swal.fire("Gagal", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl bg-white p-6 rounded-lg shadow m-6">
      <h1 className="text-xl font-bold mb-4">BUAT PENGGUNA BARU</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border rounded p-2" placeholder="Email user (Google)" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <input className="w-full border rounded p-2" placeholder="username" value={name} onChange={(e) => setName(e.target.value)} required />

        <input className="w-full border rounded p-2" placeholder="NIK" value={nik} onChange={(e) => setNik(e.target.value)} required />

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

        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded">
          {loading ? "Membuat User..." : "Buat User"}
        </button>
      </form>
    </div>
  );
}
