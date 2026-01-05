import crypto from "crypto";

const SECRET = process.env.ID_SECRET;

if (!SECRET) {
  throw new Error("ID_SECRET is not defined");
}

export function encodeId(id) {
  const payload = id.toString();
  const hash = crypto.createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 12);

  return `${payload}.${hash}`;
}

export function decodeId(token) {
  const [id, hash] = token.split(".");
  if (!id || !hash) return null;

  const validHash = crypto.createHmac("sha256", SECRET).update(id).digest("hex").slice(0, 12);

  if (hash !== validHash) return null;
  return Number(id);
}
