import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decodeId } from "@/lib/secure-id";
import { ambilDraftNotulen } from "@/services/notulen.service";
import { isSuperAdmin } from "@/lib/auth";

export async function GET(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let { notulenId } = context.params;
  notulenId = decodeId(notulenId);

  if (!notulenId) {
    return NextResponse.json({ message: "ID tidak valid" }, { status: 404 });
  }

  const draft = await ambilDraftNotulen(notulenId);

  if (!draft) {
    return NextResponse.json({ message: "Draft notulen tidak ditemukan" }, { status: 404 });
  }

  // 🔥 CEK ADMIN
  const isAdmin = await isSuperAdmin(session.user.id);

  // 🔐 JIKA BUKAN ADMIN DAN BUKAN PEMBUAT → TOLAK
  if (!isAdmin && session.user.id !== draft.dibuatOleh) {
    return NextResponse.json({ message: "Anda tidak memiliki akses" }, { status: 403 });
  }

  return NextResponse.json({
    message: "Berhasil mengambil draft notulen",
    draft,
  });
}

// export async function PUT(request, context) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const pembuatId = session.user.id;

//     let { notulenId } = context.params;
//     notulenId = decodeId(notulenId);

//     if (!notulenId) {
//       return NextResponse.json({ message: "ID tidak valid" }, { status: 404 });
//     }

//     const body = await request.json();

//     const { pembukaan, penutup, pembahasan } = body;

//     console.log("data di terima backEnd:", { notulenId, pembukaan, penutup, pembahasan });

//     const saveDraft = await simpanDraftNotulen({
//       notulenId,
//       pembukaan,
//       penutup,
//       pembahasan,
//       pembuatId,
//     });

//     return NextResponse.json({
//       message: "Draft notulen berhasil disimpan",
//       notulen: saveDraft,
//     });
//   } catch (error) {
//     console.error("SIMPAN DRAFT ERROR FULL:", error);
//     console.error("TYPE:", typeof error);
//     console.error("KEYS:", Object.keys(error));

//     return NextResponse.json(
//       {
//         message: error?.message ?? "Terjadi kesalahan saat menyimpan draft",
//         error,
//       },
//       { status: 500 }
//     );
//   }
// }
