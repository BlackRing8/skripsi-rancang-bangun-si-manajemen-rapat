"use client";

import { useState, useEffect, use } from "react";
import { formatWIB } from "@/lib/format-time";
import { Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";

const TABS = [
  { id: "all", label: "Seluruh agenda saya" },
  { id: "saya", label: "Agenda yang saya buat" },
  { id: "ikuti", label: "Agenda yang saya ikuti" },
];

export default function EventTabs() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin === true;
  const [agenda, setAgenda] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleDelete = async (id) => {
    // if (!confirm("Yakin ingin menghapus agenda ini?")) return;
    const result = await Swal.fire({
      heightAuto: false,
      position: "top-center",
      icon: "warning",
      title: "Yakin ingin menghapus rapat ini?",
      text: "seluruh peserta terdaftar akan kehilangan data atau notulen rapat ini",
      showConfirmButton: true,
      showCancelButton: true,
      scrollbarPadding: false,
      confirmButtonText: "Lanjutkan",
      cancelButtonText: "Batal",
    });

    // Jika user batal
    if (!result.isConfirmed) return;

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
        {filteredAgenda.map((item) => {
          const canManage = isAdmin || item.sayaPembuat;
          const canViewNotulen = item.sayaPeserta || canManage;
          const notulenStatus = item.notulen?.status;

          return (
            <div key={item.id} className="border p-4 rounded-lg">
              <h3 className="font-semibold">{item.judul}</h3>
              <p className="text-sm text-gray-600">{formatWIB(item.tanggalMulai)}</p>

              <div className="mt-3 flex justify-between gap-3">
                {/* ===== LEFT ACTION ===== */}
                <div className="flex flex-wrap gap-3 text-sm font-semibold">
                  <a href={`/agenda/${item.id}`} className="text-blue-600">
                    Detail Rapat
                  </a>

                  {/* LIHAT NOTULEN */}
                  {canViewNotulen && notulenStatus && (
                    <a href={`/notulen/${item.secureId}/read-only`} className="text-green-600">
                      {notulenStatus === "DRAFT" ? "Lihat Notulen Sementara" : "Lihat Notulen"}
                    </a>
                  )}

                  {/* EDIT NOTULEN (HANYA PEMBUAT / ADMIN & DRAFT) */}
                  {canManage && notulenStatus === "DRAFT" && (
                    <a href={`/notulen/${item.secureId}/edit`} className="text-orange-600">
                      Edit Notulen
                    </a>
                  )}
                </div>

                {/* ===== RIGHT ACTION (EDIT / DELETE AGENDA) ===== */}
                {canManage && (
                  <div className="flex gap-2">
                    <a href={`/agenda/${item.id}/edit`} className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-100 text-blue-600 transition">
                      <Edit size={18} />
                      <span className="hidden sm:inline">Edit</span>
                    </a>

                    <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-100 text-red-600 transition">
                      <Trash2 size={18} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
    </div>
  );
}
