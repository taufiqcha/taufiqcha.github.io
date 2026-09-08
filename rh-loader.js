function pisahVenue(venue) {
  const bagian = (venue || "").split(",").map(s => s.trim());
  return { nama: bagian[0] || "", kota: bagian[1] || "" };
}

function barisJurnal(row) {
  return `<tr>
    <td>${escapeHtml(row.Tahun)}</td>
    <td>${escapeHtml(row.Judul)}</td>
    <td>${escapeHtml(row.Venue)}</td>
  </tr>`;
}

function barisKonferensi(row) {
  const { nama, kota } = pisahVenue(row.Venue);
  const tahun = kota ? `${escapeHtml(row.Tahun)}<br>${escapeHtml(kota)}` : escapeHtml(row.Tahun);
  const peran = (row.Peran || "").trim();
  return `<tr>
    <td>${tahun}</td>
    <td>${escapeHtml(row.Judul)}</td>
    <td>${escapeHtml(nama)}</td>
    <td>${peran ? escapeHtml(peran) : "-"}</td>
  </tr>`;
}

fetch(SHEETS_CONFIG.publikasi)
  .then(res => {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.text();
  })
  .then(text => {
    const rows = parseCSV(text).sort((a, b) => (b.Tahun || "").localeCompare(a.Tahun || ""));
    const jurnal = rows.filter(r => (r.Jenis || "").toLowerCase().startsWith("j"));
    const konferensi = rows.filter(r => !(r.Jenis || "").toLowerCase().startsWith("j"));

    document.getElementById("rh-jurnal").innerHTML = jurnal.map(barisJurnal).join("");
    document.getElementById("rh-konferensi").innerHTML = konferensi.map(barisKonferensi).join("");
  })
  .catch(err => {
    document.getElementById("rh-jurnal").innerHTML =
      `<tr><td colspan="3" class="cv-loading">Gagal memuat data publikasi.</td></tr>`;
    document.getElementById("rh-konferensi").innerHTML =
      `<tr><td colspan="4" class="cv-loading">Gagal memuat data konferensi.</td></tr>`;
    console.error("Gagal memuat publikasi:", err);
  });

const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const kini = new Date();
document.getElementById("rh-tanggal").textContent =
  `${kini.getDate()} ${bulan[kini.getMonth()]} ${kini.getFullYear()}`;

document.getElementById("btn-print").addEventListener("click", () => window.print());
