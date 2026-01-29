import { buildNotulenHTML } from "@/services/notulen-pdf.service";
import { ambilDraftNotulen } from "@/services/notulen.service";
import puppeteer from "puppeteer";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decodeId } from "@/lib/secure-id";
import { generateUserQR } from "@/services/generate-qr.service";

export const runtime = "nodejs";

export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let { notulenId } = await context.params;

    notulenId = decodeId(notulenId);

    if (notulenId === null) {
      return NextResponse.error({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    const notulen = await ambilDraftNotulen(notulenId);

    if (!notulen) {
      return NextResponse.json({ message: "Notulen tidak ditemukan" }, { status: 404 });
    }

    const qrCode = await generateUserQR(notulen.rapat.pembuat.id);

    // 🔥 BUILD HTML
    const html = buildNotulenHTML(notulen, qrCode);

    // 🔥 PUPPETEER
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="notulen-${notulenId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("DOWNLOAD PDF ERROR:", error);
    return NextResponse.json({ message: error.message || "Gagal generate PDF" }, { status: 500 });
  }
}
