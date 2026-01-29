"use client";
import { useState } from "react";

export default function PesertaPicker({ peserta, setPeserta, units }) {
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const tambahPesertaManual = () => setPeserta([...peserta, ""]);

  const ubahPeserta = (index, value) => {
    const baru = [...peserta];
    baru[index] = value;
    setPeserta(baru);
  };

  const tambahPesertaUnit = () => {
    const unit = units.find((u) => u.id === Number(selectedUnit));
    if (!unit) return;

    const emails = unit.users.map((u) => u.email);
    setPeserta((prev) => [...new Set([...prev, ...emails])]);
  };

  const tambahPesertaUser = () => {
    if (!selectedUser) return;
    setPeserta((prev) => [...new Set([...prev, selectedUser])]);
  };

  const hapusPeserta = (email) => {
    setPeserta((prev) => prev.filter((p) => p !== email));
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Undang Peserta lain:</h3>

      {/* PILIH UNIT */}
      <select className="border p-2 rounded w-1/2" value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
        <option value="">-- Pilih Unit --</option>
        {units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.nama}
          </option>
        ))}
      </select>

      {selectedUnit && (
        <>
          <button type="button" onClick={tambahPesertaUnit} className="bg-green-600 ml-1.5 text-white px-3 py-2 rounded">
            Undang Semua Unit
          </button>

          <select className="border p-2 rounded w-1/2" onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="">-- Pilih User --</option>
            {units
              .find((u) => u.id === Number(selectedUnit))
              ?.users.map((user) => (
                <option key={user.email} value={user.email}>
                  {user.name}
                </option>
              ))}
          </select>

          <button type="button" onClick={tambahPesertaUser} className="bg-blue-500 ml-1.5 text-white px-3 py-2 rounded">
            Tambah User
          </button>
        </>
      )}

      {/* LIST PESERTA */}
      <div>
        {peserta.map((email, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="email" value={email} onChange={(e) => ubahPeserta(i, e.target.value)} className="border p-2 rounded w-1/2" />
            <button type="button" onClick={() => hapusPeserta(email)} className="text-red-600 font-bold">
              ✕
            </button>
          </div>
        ))}

        <button type="button" onClick={tambahPesertaManual} className="bg-gray-200 px-3 py-2 rounded">
          + Tambah Manual
        </button>
      </div>
    </div>
  );
}
