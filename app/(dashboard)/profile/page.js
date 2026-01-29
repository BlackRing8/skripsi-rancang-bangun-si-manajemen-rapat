"use client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [dataProfile, setDataProfile] = useState(null);
  const [namaBaru, setNamaBaru] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [modalJabatan, setModalJabatan] = useState(false);
  const [modalNik, setModalNik] = useState(false);
  const [nikBaru, setNikBaru] = useState("");

  const [Admin, setAdmin] = useState(false);

  // untuk penambahan unit dan jabatan
  const [units, setUnits] = useState([]);
  const [rows, setRows] = useState([
    { unitId: "", jabatanOptions: [], jabatanId: "" }, // minimal 1 row
  ]);

  const [loading, setLoading] = useState(false);

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
      const res = await fetch("/api/profile/update-profile/update-unit-jabatan", {
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
        alert("berhasil menambahkan jabatan");
        setModalJabatan(false);
      }
    } catch (error) {
      console.log("Error:", error);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  //  -------------------------------------------------- //

  useEffect(() => {
    const ambilDataProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/profile/cek-user`, { method: "GET" });
        if (!res.ok) throw new Error("Gagal mengambil data profile");
        const data = await res.json();
        const isAdmin = data.unitJabatan.some((uj) => uj.jabatan.nama.toLowerCase() === "admin");
        if (isAdmin) {
          setAdmin(true);
        }
        console.log("data profile:", data);

        setDataProfile(data);
        setNamaBaru(data.name);
        setLoading(false);
      } catch (error) {
        console.error("Error mengambil data profile:", error);
      }
    };
    ambilDataProfile();
  }, []);

  // untuk update nama
  const updateNama = async () => {
    try {
      const res = await fetch("/api/profile/update-profile/update-nama", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: namaBaru }),
      });

      if (!res.ok) return alert("gagal memperbarui nama atau nama tidak valid");

      // update data local agar langsung berubah di UI
      setDataProfile((prev) => ({ ...prev, name: namaBaru }));

      alert("Nama berhasil diperbarui!");
      setOpenModal(false);
    } catch (err) {
      console.error(err);
    }
  };
  // ------------------------//
  // untuk update nama
  const tambahNik = async () => {
    try {
      const res = await fetch("/api/profile/update-profile/update-nik", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nik: nikBaru }),
      });

      if (!res.ok) return alert("Gagal menambah NIK atau nik tidak valid");

      // update data local agar langsung berubah di UI
      setDataProfile((prev) => ({ ...prev, nik: nikBaru }));

      alert("NIK berhasil ditambahkan!");
      setModalNik(false);
    } catch (err) {
      console.error(err);
    }
  };
  // ------------------------//

  const hapusUnitJabatan = async (id) => {
    const res = await fetch(`/api/profile/update-profile/update-unit-jabatan/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("berhasil menghapus jabatan");
      setDataProfile((prev) => ({
        ...prev,
        unitJabatan: prev.unitJabatan.filter((uj) => uj.id !== id),
      }));
    }
  };

  if (loading) {
    return <div className="w-full h-screen text-xl justify-center items-center flex">Loading...</div>;
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

            <button
              onClick={() => {
                setNamaBaru(dataProfile.name);
                setOpenModal(true);
              }}
              className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:cursor-pointer"
            >
              Edit
            </button>
          </div>

          <h1 className="font-semibold">Email Terkait :</h1>
          <div className="py-2.5 px-2 bg-gray-100 w-full lg:w-2/3 border-blue-500 border rounded-lg">
            <p className=" text-xl">{dataProfile.email}</p>
          </div>
          <h1 className="font-semibold">NIK : {!dataProfile.nik ? <p className="text-red-600 text-sm">Anda belum mengisi data NIK*</p> : <p></p>}</h1>
          <div className="flex items-center space-x-3">
            <div className="py-2.5 px-2 bg-gray-100 md:w-2/3 border-blue-500 border rounded-lg">
              <p className="text-xl">{dataProfile.nik || "-- tidak ada data --"}</p>
            </div>
            {dataProfile.nik ? (
              <button disabled={true} className="bg-gray-400 text-white px-5 py-2.5 rounded-lg disabled:hover:cursor-not-allowed">
                Tambah data{" "}
              </button>
            ) : (
              <button
                onClick={() => {
                  setNikBaru(dataProfile.nik);
                  setModalNik(true);
                }}
                className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:cursor-pointer"
              >
                Tambah data{" "}
              </button>
            )}
          </div>
          <h1 className="font-semibold">Jabatan & Unit Terdaftar:</h1>

          {Array.isArray(dataProfile.unitJabatan) > 0 ? (
            <table className="border border-gray-500">
              <thead className="bg-gray-300 text-gray-700 text-sm uppercase">
                {Admin === true ? (
                  <tr>
                    <th className=" py-2 border border-black">Unit</th>
                    <th className="">Jabatan</th>
                    <th className="">Aksi</th>
                  </tr>
                ) : (
                  <tr>
                    <th className=" py-2 border border-black">Unit</th>
                    <th className="">Jabatan</th>
                  </tr>
                )}
              </thead>

              {Admin === true ? (
                <tbody>
                  {dataProfile.unitJabatan.map((uj) => (
                    <tr key={uj.id} className="text-center border border-black">
                      <td className="border border-black py-2">{uj.unit.nama}</td>
                      <td>{uj.jabatan.nama}</td>
                      <td className="border border-black py-2">
                        <button onClick={() => hapusUnitJabatan(uj.id)} className="bg-red-500 text-xs md:text-lg text-white px-2 py-1 md:px-3.5 md:py-2 rounded-lg hover:bg-red-400 hover:cursor-pointer">
                          Hapus Jabatan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  {dataProfile.unitJabatan.map((uj) => (
                    <tr key={uj.id} className="text-center border border-black">
                      <td className="border border-black py-2">{uj.unit.nama}</td>
                      <td>{uj.jabatan.nama}</td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          ) : (
            <div className="mt-3 bg-white p-2 rounded-lg text-sm">
              {" "}
              <p>Tidak ada unit dan jabatan terdaftar</p>
            </div>
          )}
          {/* Untuk menambah jabatan */}
          {Admin === true ? (
            <div className="my-3">
              <button
                onClick={() => {
                  setModalJabatan(true);
                }}
                className="bg-blue-500 text-white mt-6 px-5 py-2.5 rounded-lg hover:cursor-pointer hover:bg-blue-400"
              >
                Tambah Jabatan
              </button>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      )}

      {/* Untuk update nama profile */}
      {openModal && (
        <div className="fixed inset-0  bg-opacity-40 flex  items-start justify-center z-50 mt-20">
          <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Nama</h2>

            <input value={namaBaru} onChange={(e) => setNamaBaru(e.target.value)} className="w-full border rounded-lg p-2 mb-4" autoFocus />

            <div className="flex justify-end space-x-3">
              <button onClick={() => setOpenModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg">
                Batal
              </button>

              <button onClick={updateNama} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Untuk menambah jabatan */}
      {modalJabatan && (
        <div className="fixed inset-0  bg-opacity-40 flex  items-start justify-center z-50 mt-20">
          <div className="max-w-xl w-full mx-auto p-6 bg-white shadow rounded-lg border-black border">
            <div className="flex justify-between mb-2">
              <h1 className="text-xl font-bold mb-5">Tambah jabatan Anda</h1>
              <button onClick={() => setModalJabatan(false)} className="px-5 bg-gray-300 rounded-full">
                X
              </button>
            </div>

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
      )}

      {/* Untuk menambah NIK */}
      {modalNik && (
        <div className="fixed inset-0  bg-opacity-40 flex  items-start justify-center z-50 mt-20">
          <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Tambah data NIK:</h2>

            <input value={nikBaru} onChange={(e) => setNikBaru(e.target.value)} className="w-full border rounded-lg p-2 mb-4" autoFocus />

            <div className="flex justify-end space-x-3">
              <button onClick={() => setModalNik(false)} className="px-4 py-2 bg-gray-300 rounded-lg">
                Batal
              </button>

              <button onClick={tambahNik} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
