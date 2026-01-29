"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewUserPage() {
  const [listData, setlistData] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const ambilData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/validate-user");
      if (!res.ok) throw new Error("Gagal mengambil data user");
      const data = await res.json();
      console.log(data.length);

      setlistData(data);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilData();
  }, []);

  if (loading) {
    return <div>Mengambil data....</div>;
  }

  const handleValidate = async (secureId) => {
    const res = await fetch("/api/admin/validate-user", {
      method: "PATCH",
      body: JSON.stringify({
        secureId: secureId,
      }),
    });
    if (res.ok) {
      alert("berhasil memvalidasi data");
    }
  };

  return (
    <div className="m-6 flex flex-col gap-6">
      <h1 className="bg-white p-4 md:text-4xl font-bold rounded-lg md:w-1/2">Daftar Pengguna Baru yang perlu di validasi</h1>
      <a href="/admin/create-user" className="px-4 py-2 bg-blue-500 rounded-lg text-white w-40 text-center mt-2 hover:bg-blue-300 font-semibold">
        Buat user baru
      </a>
      <div className="overflow-x-auto">
        <table className="border-2 ">
          <thead className="bg-white">
            <tr className="md:text-lg">
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Nama</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-center px-4 py-3">NIK</th>
              <th className="text-left px-4 py-3">Unit</th>
              <th className="text-left px-4 py-3">Jabatan</th>
              <th className="text-left px-4 py-3">Aksi</th>
            </tr>
          </thead>
          {listData.length > 0 ? (
            <tbody>
              {listData.map((u) => (
                <tr key={u.secureId} className="hover:bg-gray-50 bg-white">
                  <td className="border p-2 text-blue-500">{u.secureId || "-"}</td>
                  <td className="border p-2">{u.name || "-"}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2">{u.nik || "-"}</td>

                  <td className="border p-2 text-sm">{u.units.length > 0 ? u.units.join(", ") : <span className="text-gray-400 italic">Belum ditentukan</span>}</td>

                  <td className="border p-2 text-sm">{u.jabatans.length > 0 ? u.jabatans.join(", ") : <span className="text-gray-400 italic">Belum ditentukan</span>}</td>

                  <td className="border p-2 flex gap-2">
                    <button onClick={() => router.push(`/admin/user-edit/${u.secureId}`)} className="px-3 py-1 bg-blue-500 text-white rounded">
                      Edit
                    </button>

                    <button onClick={() => handleValidate(u.secureId)} disabled={u.units.length === 0} className={`px-3 py-1 rounded text-white ${u.units.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-500"}`}>
                      Validate
                    </button>

                    <button onClick={() => handleDelete(u.secureId)} className="px-3 py-1 bg-red-500 text-white rounded">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td className="bg-white"></td>
                <td className="bg-white"></td>
                <td className="bg-white"></td>
                <td className="bg-white py-3 font-semibold md:text-xl">Tidak ada user mendaftar</td>
                <td className="bg-white"></td>
                <td className="bg-white"></td>
                <td className="bg-white"></td>
              </tr>
            </tbody>
          )}
          {/* <tbody>
            {listData.map((u) => (
              <tr key={u.secureId} className="hover:bg-gray-50 bg-white">
                <td className="border p-2 text-blue-500">{u.secureId || "-"}</td>
                <td className="border p-2">{u.name || "-"}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">{u.nik || "-"}</td>

                <td className="border p-2 text-sm">{u.units.length > 0 ? u.units.join(", ") : <span className="text-gray-400 italic">Belum ditentukan</span>}</td>

                <td className="border p-2 text-sm">{u.jabatans.length > 0 ? u.jabatans.join(", ") : <span className="text-gray-400 italic">Belum ditentukan</span>}</td>

                <td className="border p-2 flex gap-2">
                  <button onClick={() => router.push(`/admin/user-edit/${u.secureId}`)} className="px-3 py-1 bg-blue-500 text-white rounded">
                    Edit
                  </button>

                  <button onClick={() => handleValidate(u.secureId)} disabled={u.units.length === 0} className={`px-3 py-1 rounded text-white ${u.units.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-500"}`}>
                    Validate
                  </button>

                  <button onClick={() => handleDelete(u.secureId)} className="px-3 py-1 bg-red-500 text-white rounded">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody> */}
        </table>
      </div>
    </div>
  );
}
