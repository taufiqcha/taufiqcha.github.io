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
    document.getElementById("cv-pub-list").innerHTML = rows.map(renderCvPub).join("");
    document.getElementById("cv-pub-count").textContent = `(${rows.length} publikasi)`;
  })
  .catch(err => {
    document.getElementById("cv-pub-list").innerHTML =
      `<li class="cv-loading">Gagal memuat data publikasi.</li>`;
    console.error("Gagal memuat publikasi:", err);
  });

document.getElementById("btn-print").addEventListener("click", () => window.print());
