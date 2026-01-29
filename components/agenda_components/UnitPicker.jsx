"use client";
import { useEffect, useState } from "react";

export default function UnitPicker({ value, onChange }) {
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUnits = async () => {
      const res = await fetch("/api/user/unit-akses");
      const data = await res.json();
      setUnits(data);
    };
    fetchUnits();
  }, []);

  const toggleUnit = (unitId) => {
    if (value.includes(unitId)) {
      onChange(value.filter((id) => id !== unitId));
    } else {
      onChange([...value, unitId]);
    }
  };

  const filteredUnits = units.filter((u) => u.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <label className="block font-semibold mb-2">
        Unit Tujuan Rapat <span className="text-red-500">*</span>
      </label>

      {/* SEARCH */}
      <input type="text" placeholder="Cari unit..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" />

      {/* LIST UNIT */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filteredUnits.length === 0 && <p className="text-sm text-gray-500">Unit tidak ditemukan</p>}

        {filteredUnits.map((unit) => (
          <label key={unit.id} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={value.includes(unit.id)} onChange={() => toggleUnit(unit.id)} className="accent-blue-600" />
            <span>{unit.nama}</span>
          </label>
        ))}
      </div>

      {/* INFO */}
      <p className="text-xs text-gray-600 mt-2">Dipilih: {value.length} unit</p>
    </div>
  );
}
