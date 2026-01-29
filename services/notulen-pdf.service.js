// services/notulen/notulen-pdf.service.js

export function buildNotulenHTML(notulen, qrCode) {
  const keputusanHTML =
    notulen.keputusan.length > 0
      ? notulen.keputusan
          .map(
            (k, i) => `
        <div class="box">
          <p><strong>${i + 1}. Hasil Keputusan</strong></p>
          <p>${k.keputusan}</p>

          <p><strong>Penanggung Jawab:</strong> ${k.penanggungJawab || "-"}</p>
          <p><strong>Tenggat Waktu:</strong> ${k.tenggatWaktu ? new Date(k.tenggatWaktu).toLocaleDateString("id-ID") : "-"}</p>
        </div>
      `
          )
          .join("")
      : `<p class="muted">Belum ada keputusan</p>`;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<title>Notulen Rapat</title>

<style>
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    padding: 40px;
  }

  .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .logo {
      height: 60px;
    }

  table {
    width: 100%;
    margin-top: 20px;
  }

  td { padding: 4px 0; vertical-align: top; }

  .box {
    border: 1px solid #999;
    padding: 12px;
    margin-bottom: 12px;
    border-radius: 6px;
  }

  .muted { color: #666; }

  .ttd {
    margin-top: 60px;
    display: flex;
    justify-content: flex-end;
  }

  .ttd-box {
    text-align: center;
    width: 200px;
  }

  .qr {
    width: 120px;
    height: 120px;
    border: 1px solid #000;
    margin: 10px auto;
  }
</style>
</head>

<body>

<!-- HEADER -->
  <div class="header">
    <div>
      <h2>NOTULEN RAPAT</h2>
    </div>

    <img
      src="https://skripsi-rancang-bangun-si-manajemen.vercel.app/logo/logo-trilogi-teks.png"
      class="logo"
      alt="Logo Universitas Trilogi"
    />
  </div>

<table>
  <tr><td><strong>Agenda</strong></td><td>: ${notulen.rapat.judul}</td></tr>
  <tr><td><strong>Pimpinan</strong></td><td>: ${notulen.rapat.pembuat.name}</td></tr>
  <tr><td><strong>Tanggal</strong></td><td>: ${new Date(notulen.rapat.tanggalMulai).toLocaleDateString("id-ID")}</td></tr>
  <tr><td><strong>Waktu</strong></td><td>: ${new Date(notulen.rapat.tanggalMulai).toLocaleTimeString("id-ID")} WIB</td></tr>
</table>

<h2>Keputusan Rapat</h2>
${keputusanHTML}

<div class="ttd">
  <div class="ttd-box">
    <p>Dibuat oleh:</p>
    <div class="qr">
    <img src="${qrCode}" width="120" height="120" />

    </div>
    <p>(<strong>${notulen.rapat.pembuat.name}</strong>)</p>
  </div>
</div>

</body>
</html>
`;
}
