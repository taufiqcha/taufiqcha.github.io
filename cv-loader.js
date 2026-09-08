function renderCvPub(row) {
  const doi = (row.DOI || "").trim();
  const doiPart = doi
    ? ` DOI: <a href="https://doi.org/${escapeHtml(doi)}">${escapeHtml(doi)}</a>`
    : "";
  return `<li>
    <span class="cv-pub-title">${escapeHtml(row.Judul)}</span>
    <span class="cv-pub-venue">${escapeHtml(row.Venue)}, ${escapeHtml(row.Tahun)}.</span>${doiPart}
  </li>`;
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

    const grup = (label, daftar) => daftar.length
      ? `<h3 class="cv-subhead">${label} <span class="cv-count">(${daftar.length})</span></h3>
         <ol class="cv-pub">${daftar.map(renderCvPub).join("")}</ol>`
      : "";

    document.getElementById("cv-pub-groups").innerHTML =
      grup("Jurnal", jurnal) + grup("Konferensi", konferensi);
  })
  .catch(err => {
    document.getElementById("cv-pub-groups").innerHTML =
      `<p class="cv-loading">Gagal memuat data publikasi.</p>`;
    console.error("Gagal memuat publikasi:", err);
  });

function renderKegiatan(row) {
  const link = (row.Link || "").trim();
  const sumber = link
    ? `<li class="cv-source">Dokumentasi: <a href="${escapeHtml(link)}">${escapeHtml(link.replace(/^https?:\/\/(www\.)?/, "").split("/")[0])}</a></li>`
    : "";
  return `<div class="cv-entry">
    <div class="cv-entry-head"><h3>${escapeHtml(row.Judul)}</h3></div>
    <ul><li>${escapeHtml(row.Deskripsi)}</li>${sumber}</ul>
  </div>`;
}

fetch(SHEETS_CONFIG.portofolio)
  .then(res => {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.text();
  })
  .then(text => {
    const rows = parseCSV(text);
    document.getElementById("cv-kegiatan-list").innerHTML = rows.map(renderKegiatan).join("");
  })
  .catch(err => {
    document.getElementById("cv-kegiatan-list").innerHTML =
      `<p class="cv-loading">Gagal memuat data kegiatan.</p>`;
    console.error("Gagal memuat kegiatan:", err);
  });

const tombolVersi = [...document.querySelectorAll(".toolbar-variant")];

function pakaiVersi(versi) {
  document.body.classList.toggle("versi-kegiatan", versi === "kegiatan");
  tombolVersi.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.versi === versi)));
  const url = new URL(location.href);
  url.searchParams.set("versi", versi);
  history.replaceState(null, "", url);
}

tombolVersi.forEach(b => b.addEventListener("click", () => pakaiVersi(b.dataset.versi)));
pakaiVersi(new URL(location.href).searchParams.get("versi") === "kegiatan" ? "kegiatan" : "akademik");

document.getElementById("btn-print").addEventListener("click", () => window.print());
