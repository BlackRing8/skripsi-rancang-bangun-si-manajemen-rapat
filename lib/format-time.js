export const formatWIB = (dateString) => {
  return new Date(dateString).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const formatWIBCumaHari = (dateString) => {
  return new Date(dateString).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "long",
    day: "2-digit",
    // hour: "2-digit",
    // minute: "2-digit",
    hour12: false,
  });
};
export const formatWIBCumaWaktu = (dateString) => {
  return new Date(dateString).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    // year: "numeric",
    // month: "long",
    // day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
