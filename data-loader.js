function renderPubItem(row) {
  const doi = row.DOI ? row.DOI.trim() : "";
  const doiLink = doi
    ? ` &middot; DOI: <a href="https://doi.org/${escapeHtml(doi)}" target="_blank" rel="noopener">${escapeHtml(doi)}</a>`
    : "";
  const file = (row.File || row.file || "").trim();
  const fileLink = file
    ? ` <a href="${escapeHtml(file)}" target="_blank" rel="noopener" class="pub-pdf">PDF</a>`
    : "";
  return `<li>
    <span class="pub-year">${escapeHtml(row.Tahun)}</span>
    <span class="pub-title">${escapeHtml(row.Judul)}</span>
    <span class="pub-venue">${escapeHtml(row.Venue)}${doiLink}${fileLink}</span>
  </li>`;
}

function loadPublikasi() {
  const utamaEl = document.getElementById("pub-list-utama");
  const lainnyaWrap = document.getElementById("pub-list-lainnya-wrap");
  const lainnyaEl = document.getElementById("pub-list-lainnya");
  const summaryEl = document.getElementById("pub-lainnya-summary");

  fetch(SHEETS_CONFIG.publikasi)
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(text => {
      const rows = parseCSV(text).sort((a, b) => (b.Tahun || "").localeCompare(a.Tahun || ""));
      const utama = rows.filter(r => (r.Utama || "").toLowerCase().startsWith("y"));
      const lainnya = rows.filter(r => !(r.Utama || "").toLowerCase().startsWith("y"));

      const jurnal = utama.filter(r => (r.Jenis || "").toLowerCase().startsWith("j"));
      const konferensi = utama.filter(r => !(r.Jenis || "").toLowerCase().startsWith("j"));

      const grup = (label, daftar) => daftar.length
        ? `<li class="pub-group">${label}</li>` + daftar.map(renderPubItem).join("")
        : "";

      utamaEl.innerHTML = utama.length
        ? grup("Jurnal", jurnal) + grup("Konferensi", konferensi)
        : `<li class="data-loading">Belum ada data publikasi.</li>`;

      if (lainnya.length) {
        lainnyaEl.innerHTML = lainnya.map(renderPubItem).join("");
        const berkas = lainnya.filter(r => (r.File || r.file || "").trim()).length;
        summaryEl.textContent = berkas
          ? `Publikasi lainnya (${lainnya.length}, ${berkas} dengan PDF)`
          : `Publikasi lainnya (${lainnya.length})`;
        lainnyaWrap.style.display = "";
      }
    })
    .catch(err => {
      utamaEl.innerHTML = `<li class="data-loading">Gagal memuat data publikasi. Cek koneksi atau URL sheet.</li>`;
      console.error("Gagal memuat publikasi:", err);
    });
}

function renderPortfolioCard(row) {
  return `<div class="portfolio-card">
    <div class="portfolio-thumb"><img src="${escapeHtml(row.Gambar)}" alt="${escapeHtml(row.Judul)}" loading="lazy"></div>
    <h3>${escapeHtml(row.Judul)}</h3>
    <p>${escapeHtml(row.Deskripsi)}</p>
    <a href="${escapeHtml(row.Link)}" target="_blank" rel="noopener" class="link">Lihat detail &rarr;</a>
  </div>`;
}

function loadPortofolio() {
  const gridEl = document.getElementById("portfolio-grid");

  fetch(SHEETS_CONFIG.portofolio)
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(text => {
      const rows = parseCSV(text);
      gridEl.innerHTML = rows.length
        ? rows.map(renderPortfolioCard).join("")
        : `<p class="data-loading">Belum ada data portofolio.</p>`;
    })
    .catch(err => {
      gridEl.innerHTML = `<p class="data-loading">Gagal memuat portofolio. Cek koneksi atau URL sheet.</p>`;
      console.error("Gagal memuat portofolio:", err);
    });
}

loadPublikasi();
loadPortofolio();
