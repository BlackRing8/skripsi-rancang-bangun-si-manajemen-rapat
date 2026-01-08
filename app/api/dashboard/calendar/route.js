import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { ambilDataCalendar } from "@/services/dashboard.service";
import { encodeId } from "@/lib/secure-id";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);

  const dateParam = searchParams.get("date");
  const monthView = searchParams.get("monthView") === "true";

  const month = Number(searchParams.get("month")); // 1 - 12
  const year = Number(searchParams.get("year"));

  let startTime;
  let endTime;

  if (monthView) {
    if (!month || !year) {
      return NextResponse.json({ error: "month & year required for monthView" }, { status: 400 });
    }

    startTime = new Date(year, month - 1, 1, 0, 0, 0, 0);
    endTime = new Date(year, month, 0, 23, 59, 59, 999);
  } else {
    if (!dateParam) {
      return NextResponse.json({ error: "date parameter required" }, { status: 400 });
    }

    const [y, m, d] = dateParam.split("-").map(Number);

    startTime = new Date(y, m - 1, d, 0, 0, 0, 0);
    endTime = new Date(y, m - 1, d, 23, 59, 59, 999);
  }

  try {
    const dataCalendar = await ambilDataCalendar(userId, startTime, endTime);

    const hasil = dataCalendar.map((r) => ({
      ...r,

      secureId: encodeId(r.notulen.id),
    }));

    console.log(hasil);
    return NextResponse.json({ events: hasil });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil agenda" }, { status: 500 });
  }
}
