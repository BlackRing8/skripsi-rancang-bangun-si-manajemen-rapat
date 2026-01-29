"use client";
import { useEffect, useState } from "react";

export default function DetailProfileUser({ secureId }) {
  const [loading, setLoading] = useState(false);
  const [dataProfile, setDataProfile] = useState(null);

  useEffect(() => {
    const ambilDataProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/profile/cek-user/${secureId}`);
        if (!res.ok) throw new Error("Gagal mengambil data profile");
        const data = await res.json();

        setDataProfile(data);
      } catch (error) {
        console.error("Error mengambil data profile:", error);
      } finally {
        setLoading(false);
      }
    };
    ambilDataProfile();
  }, [secureId]);

  if (loading) {
    return <div>Mengambil data...</div>;
  }

  return (
    <div className="w-full p-6">
      {dataProfile && (
        <div className="flex space-y-2 flex-col xl:w-2/3 bg-white rounded-xl p-6 ">
          <h1 className="font-semibold">Nama Lengkap :</h1>
          <div className="flex items-center space-x-3">
            <div className="py-2.5 px-2 bg-gray-100 md:w-2/3 border-blue-500 border rounded-lg">
              <p className="text-xl">{dataProfile.name}</p>
            </div>
          </div>

          <h1 className="font-semibold">Email Terkait :</h1>
          <div className="py-2.5 px-2 bg-gray-100 w-full lg:w-2/3 border-blue-500 border rounded-lg">
            <p className=" text-xl">{dataProfile.email}</p>
          </div>
          <h1 className="font-semibold">NIK : {!dataProfile.nik ? <p className="text-red-600 text-sm">user belum mengisi data NIK*</p> : <p></p>}</h1>
          <div className="flex items-center space-x-3">
            <div className="py-2.5 px-2 bg-gray-100 md:w-2/3 border-blue-500 border rounded-lg">
              <p className="text-xl">{dataProfile.nik || "-- tidak ada data --"}</p>
            </div>
          </div>
          <h1 className="font-semibold">Jabatan & Unit Terdaftar:</h1>

          {Array.isArray(dataProfile.unitJabatan) > 0 ? (
            <table className="border border-gray-500">
              <thead className="bg-gray-300 text-gray-700 text-sm uppercase">
                <tr>
                  <th className=" py-2 border border-black">Unit</th>
                  <th className="">Jabatan</th>
                </tr>
              </thead>

              <tbody>
                {dataProfile.unitJabatan.map((uj) => (
                  <tr key={uj.id} className="text-center border border-black">
                    <td className="border border-black py-2">{uj.unit.nama}</td>
                    <td>{uj.jabatan.nama}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="mt-3 bg-white p-2 rounded-lg text-sm">
              {" "}
              <p>Tidak ada unit dan jabatan terdaftar</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
