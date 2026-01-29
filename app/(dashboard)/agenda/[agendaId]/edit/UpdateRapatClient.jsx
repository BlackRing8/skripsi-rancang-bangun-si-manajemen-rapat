"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PesertaPicker from "@/components/agenda_components/pesertaPicker";

export default function UpdateRapat({ rapatId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    lokasi: "",
    tanggalMulai: "",
    tanggalSelesai: "",
  });

  const [peserta, setPeserta] = useState([]);
  const [units, setUnits] = useState([]);

  // ===== FETCH DATA =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agendaRes, unitRes] = await Promise.all([fetch(`/api/agenda/get-my-agenda/${rapatId}`), fetch("/api/agenda/user-by-unit")]);

        const agenda = await agendaRes.json();
        const unitData = await unitRes.json();

        setForm({
          id: rapatId,
          judul: agenda.judul,
          deskripsi: agenda.deskripsi || "",
          lokasi: agenda.lokasi || "",
          tanggalMulai: agenda.tanggalMulai,
          tanggalSelesai: agenda.tanggalSelesai,
        });

        setPeserta(agenda.pesertaEmails || []);
        setUnits(unitData);
      } catch (err) {
        alert("Gagal memuat data agenda");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rapatId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/agenda/update-agenda/${rapatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pesertaEmails: peserta,
        }),
      });

      if (!res.ok) throw new Error();

      alert("Agenda berhasil diperbarui");
      router.push("/agenda");
    } catch {
      alert("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Memuat...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-4xl m-4">
      <h1 className="text-2xl font-bold mb-6">Edit Agenda Rapat</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input name="judul" value={form.judul} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Judul Rapat" required />

        <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Deskripsi" />

        <input name="lokasi" value={form.lokasi} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Lokasi" />

        {/* TANGGAL */}
        <div className="grid grid-cols-2 gap-4">
          <input type="datetime-local" name="tanggalMulai" value={form.tanggalMulai?.slice(0, 16)} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input type="datetime-local" name="tanggalSelesai" value={form.tanggalSelesai?.slice(0, 16)} onChange={handleChange} className="border rounded px-3 py-2" required />
        </div>

        {/* PESERTA */}
        <PesertaPicker peserta={peserta} setPeserta={setPeserta} units={units} />

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded">
            Batal
          </button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
