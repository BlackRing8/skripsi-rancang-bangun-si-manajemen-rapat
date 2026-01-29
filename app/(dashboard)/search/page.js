"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatWIB } from "@/lib/format-time";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("q");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!keyword) return;

    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/agenda/search?q=${keyword}`);
      const result = await res.json();
      setData(result);
      setLoading(false);
    };

    fetchData();
  }, [keyword]);

  if (loading) return <p className="p-6">Mencari agenda...</p>;

  return (
    <div className="w-full h-full bg-white">
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="md:text-3xl font-bold mb-4">Hasil pencarian: &quot;{keyword}&quot;</h1>

        {data.length === 0 && <p className="text-gray-500">Agenda tidak ditemukan</p>}

        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{item.judul}</h3>
              <p className="text-sm text-gray-600">{formatWIB(item.tanggalMulai)}</p>

              <Link href={`/agenda/${item.id}`} className="text-blue-600 text-sm font-semibold mt-2 inline-block">
                Lihat Detail
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
