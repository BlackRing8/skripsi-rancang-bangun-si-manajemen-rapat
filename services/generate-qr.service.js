import QRCode from "qrcode";
import { encodeId } from "@/lib/secure-id";

export async function generateUserQR(userId) {
  const secureId = encodeId(userId);
  const url = `${process.env.NEXTAUTH_URL}/user/verify/${secureId}`;

  return QRCode.toDataURL(url);
}
