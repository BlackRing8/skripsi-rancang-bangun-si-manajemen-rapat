"use client";

import { useState, useEffect } from "react";
import { formatWIB } from "@/lib/format-time";
import { Edit, Trash2 } from "lucide-react";

const TABS = [
  { id: "all", label: "Seluruh agenda saya" },
  { id: "saya", label: "Agenda yang saya buat" },
  { id: "ikuti", label: "Agenda yang saya ikuti" },
];

export default function EventTabs() {
  const [agenda, setAgenda] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchAgenda = async () => {
      setIsLoading(true);
      const res = await fetch("/api/agenda/get-my-agenda");
      const data = await res.json();
      setAgenda(data);

      setIsLoading(false);
    };
    fetchAgenda();
  }, []);

  const handleEdit = (event) => {
    setSelectedEvent(event);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus agenda ini?")) return;

    try {
      await fetch(`/api/agenda/update-agenda/${id}`, { method: "DELETE" });
      setAgenda((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Gagal menghapus event:", error);
    }
  };

  const filteredAgenda = agenda.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "saya") return item.sayaPembuat;
    if (activeTab === "ikuti") return item.sayaPeserta;
    return true;
  });

  const renderAgenda = () => {
    if (isLoading) return <p>Memuat agenda...</p>;
    if (filteredAgenda.length === 0) return <p className="text-gray-500">Tidak ada agenda</p>;

    return (
      <div className="space-y-4">
        {filteredAgenda.map((item) => (
          <div key={item.id} className="border p-4 rounded-lg">
            <h3 className="font-semibold">{item.judul}</h3>
            <p className="text-sm text-gray-600">{formatWIB(item.tanggalMulai)}</p>

            <div className="mt-3 flex gap-3 justify-between">
              <div className=" flex gap-3">
                <a href={`/agenda/${item.id}`} className="text-blue-600 text-sm font-semibold">
                  Detail Rapat
                </a>

                {item.sayaPeserta && (
                  <a href={`/notulen/${item.secureId}/read-only`} className="text-green-600 text-sm font-semibold">
                    {item.notulen.status === "DRAFT" || "FINAL" ? "Lihat Notulen Sementara" : "Lihat Notulen"}
                  </a>
                )}
                {item.sayaPembuat && (
                  <a href={`/notulen/${item.secureId}/edit`} className="text-green-600 text-sm font-semibold">
                    {item.notulen.status === "DRAFT" || "FINAL" ? "Edit Notulen" : "Lihat Notulen"}
                  </a>
                )}
              </div>
              {item.sayaPembuat && (
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item)} className="rounded-md hover:bg-gray-100 text-blue-600 transition">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="rounded-md hover:bg-gray-100 text-red-600 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-lg shadow mt-8">
      <div className="flex divide-x font-semibold">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full p-4 ${activeTab === tab.id ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 border-t">{renderAgenda()}</div>

      {/* Modal Edit Agenda */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-semibold mb-4">Edit Agenda</h2>
            <p className="text-gray-600 mb-6">
              Event: <strong>{selectedEvent.judul}</strong>
            </p>

            {/* Form Edit Placeholder */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsLoading(true);

                const formData = new FormData(e.target);
                const updatedEvent = {
                  id: selectedEvent.id,
                  judul: formData.get("summary"),
                  dekripsi: formData.get("description"),
                  lokasi: formData.get("location"),
                  start: {
                    dateTime: `${formData.get("date")}T${formData.get("startTime")}:00`,
                  },
                  end: {
                    dateTime: `${formData.get("date")}T${formData.get("endTime")}:00`,
                  },
                };

                try {
                  const res = await fetch(`/api/agenda/update-agenda/${selectedEvent.rapatId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedEvent),
                  });

                  if (!res.ok) throw new Error("Gagal memperbarui agenda");

                  const result = await res.json();

                  // Update data lokal tanpa refetch semua
                  setAgenda((prev) => prev.map((e) => (e.id === selectedEvent.id ? { ...e, ...updatedEvent } : e)));

                  alert("Agenda berhasil diperbarui!");
                  setSelectedEvent(null);
                } catch (error) {
                  console.error(error);
                  alert("Terjadi kesalahan saat memperbarui agenda.");
                } finally {
                  setIsLoading(false);
                }
              }}
              className="space-y-3"
            >
              <input name="summary" type="text" defaultValue={selectedEvent.judul} className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <textarea name="description" defaultValue={selectedEvent.deskripsi || ""} className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Tempat</label>
                <input name="location" defaultValue={selectedEvent.lokasi || ""} className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Tanggal</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={selectedEvent.tanggalMulai ? new Date(selectedEvent.tanggalMulai).toISOString().slice(0, 10) : ""}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-1">Mulai</label>
                  <input
                    type="time"
                    name="startTime"
                    defaultValue={
                      selectedEvent.tanggalMulai
                        ? (() => {
                            const d = new Date(selectedEvent.tanggalMulai);
                            const hours = String(d.getHours()).padStart(2, "0");
                            const minutes = String(d.getMinutes()).padStart(2, "0");
                            return `${hours}:${minutes}`;
                          })()
                        : ""
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-1">Selesai</label>
                  <input
                    type="time"
                    name="endTime"
                    defaultValue={
                      selectedEvent.tanggalMulai
                        ? (() => {
                            const d = new Date(selectedEvent.tanggalSelesai);
                            const hours = String(d.getHours()).padStart(2, "0");
                            const minutes = String(d.getMinutes()).padStart(2, "0");
                            return `${hours}:${minutes}`;
                          })()
                        : ""
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button onClick={() => setSelectedEvent(null)} disabled={isLoading} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
                  Batal
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
