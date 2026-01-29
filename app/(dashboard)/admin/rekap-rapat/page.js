"use client";
import { useState, useMemo } from "react";

export default function RekapPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeUnit, setActiveUnit] = useState("ALL");

  const ambilRekap = async () => {
    if (!start || !end) {
      setError("Tanggal mulai dan akhir wajib diisi");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/rekap-rapat/unit?start=${start}&end=${end}`);

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal mengambil data");
      }

      console.log("DATA REKAP:", result.data);
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔎 FILTER DATA (SEARCH + TAB)
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const cocokUnit = activeUnit === "ALL" || row.unitId === activeUnit;

      const cocokSearch = row.unitNama.toLowerCase().includes(search.toLowerCase());

      return cocokUnit && cocokSearch;
    });
  }, [data, search, activeUnit]);

  return (
    <div className="p-6 bg-white  shadow">
      <h1 className="text-2xl font-bold mb-4">Rekap Rapat Per Unit</h1>

      {/* FILTER */}
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Tanggal Mulai</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Tanggal Akhir</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border rounded px-3 py-2" />
        </div>

        <button onClick={ambilRekap} disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400">
          {loading ? "Memuat..." : "Ambil Rekap"}
        </button>
      </div>

      {/* SEARCH */}
      <input type="text" placeholder="Cari unit..." value={search} onChange={(e) => setSearch(e.target.value)} className="border rounded px-4 py-2 w-full max-w-md mb-4" />

      {/* TAB UNIT */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setActiveUnit("ALL")} className={`px-4 py-1 rounded-full text-sm font-semibold ${activeUnit === "ALL" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
          Semua Unit
        </button>

        {data.map((u) => (
          <button key={u.unitId} onClick={() => setActiveUnit(u.unitId)} className={`px-4 py-1 rounded-full text-sm font-semibold ${activeUnit === u.unitId ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
            {u.unitNama}
          </button>
        ))}
      </div>

      {/* ERROR */}
      {error && <p className="text-red-600 mb-4 font-semibold">{error}</p>}

      {/* TABEL */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Unit</th>
              <th className="border px-4 py-2 text-center">Total Rapat</th>
              <th className="border px-4 py-2 text-center">Selesai</th>
              <th className="border px-4 py-2 text-center">Belum Mulai</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            )}

            {filteredData.map((row) => (
              <tr key={row.unitId}>
                <td className="border px-4 py-2">{row.unitNama}</td>
                <td className="border px-4 py-2 text-center font-semibold">{row.totalRapat}</td>
                <td className="border px-4 py-2 text-center text-green-600 font-semibold">{row.selesai}</td>
                <td className="border px-4 py-2 text-center text-orange-600 font-semibold">{row.belumMulai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
