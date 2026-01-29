"use client";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

export default function ListUserPage() {
  const [listUser, setListUser] = useState([]);
  const [loading, setLoading] = useState(true);

  const ambilData = async () => {
    try {
      const res = await fetch("/api/user/verify");
      if (!res.ok) throw new Error("Gagal mengambil data user");
      const data = await res.json();

      // console.log("DATA USER:", JSON.stringify(data, null, 2));
      setListUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeUnit, setActiveUnit] = useState("ALL");

  useEffect(() => {
    ambilData();
  }, []);

  // daftar unit untuk tab
  const units = useMemo(() => {
    return ["ALL", ...listUser.map((g) => g.unit)];
  }, [listUser]);

  // hasil filter + search
  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase();

    return listUser
      .filter((group) => activeUnit === "ALL" || group.unit === activeUnit)
      .map((group) => ({
        ...group,
        users: group.users.filter((u) => u.name?.toLowerCase().includes(keyword) || String(u.nik).toLowerCase().includes(keyword)),
      }))
      .filter((group) => group.users.length > 0);
  }, [listUser, search, activeUnit]);

  // function delete user
  const handleDeleteUser = async (secureId, name) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: `Yakin ingin menghapus ${name}?`,
      text: "Seluruh data user akan terhapus dan tidak bisa dikembalikan",
      showCancelButton: true,
      confirmButtonText: "Lanjutkan",
      cancelButtonText: "Batal",
      heightAuto: false,
    });

    if (!confirm.isConfirmed) return;

    // 🔥 TAMPILKAN LOADING
    Swal.fire({
      title: "Menghapus pengguna...",
      text: "Mohon tunggu",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(`/api/admin/list-user-manage/${secureId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal menghapus user");

      // ✅ SUCCESS
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pengguna berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
      });

      ambilData();

      // 🔁 optional: refresh data
      // fetchUsers();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 animate-pulse">Memuat data user...</p>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded-lg">❌ {error}</div>;
  }

  return (
    <div className="space-y-6 p-8 bg-white">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
          <a href="/admin/create-user" className="px-4 py-2 bg-green-500 rounded-lg text-white w-40 text-center mt-2 hover:bg-green-300 font-semibold">
            Buat user baru
          </a>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau NIK..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border placeholder:text-gray-700 rounded-lg px-4 py-2 w-full lg:w-80 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* TAB UNIT */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {units.map((unit) => (
          <button
            key={unit}
            onClick={() => setActiveUnit(unit)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition
              ${activeUnit === unit ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
            `}
          >
            {unit === "ALL" ? "Semua Unit" : unit}
          </button>
        ))}
      </div>

      {/* LIST USER */}
      {filteredData.length === 0 && <p className="text-gray-500 italic">User tidak ditemukan.</p>}

      {filteredData.map((group) => (
        <div key={group.unit} className="bg-white rounded-xl shadow border overflow-hidden">
          {/* HEADER UNIT */}
          <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">{group.unit}</h2>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{group.users.length} User</span>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr className="md:text-lg">
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Nama</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">NIK</th>
                  <th className="text-left px-4 py-3">Jabatan</th>
                  <th className="text-left px-4 py-3">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {group.users.map((u, idx) => (
                  <tr key={u.id} className={`border-t hover:bg-gray-50 transition md:text-lg ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-medium">
                      <a href={`/user/verify/${u.secureId}`} className="underline text-blue-500">
                        {u.secureId}
                      </a>
                    </td>
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-blue-600">{u.email}</td>
                    <td className="px-4 py-3">{u.nik ?? <span className="text-gray-400 italic">Belum Mengisi</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {u.jabatan.map((j, i) => (
                          <span key={i} className="px-3 py-1 text-xs rounded-full bg-yellow-300 text-black font-semibold">
                            {j}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-blue-600">
                      <div className="flex gap-4">
                        <a href={`/admin/user-edit/${u.secureId}`} className="text-whit px-4 py-1 bg-green-500 text-white rounded-full">
                          Edit
                        </a>
                        <button onClick={() => handleDeleteUser(u.secureId, u.name)} className="text-whit px-4 py-1 bg-red-500 text-white rounded-full">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
