function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }

  const headers = rows.shift().map(h => h.trim());
  return rows
    .filter(r => r.some(cell => cell.trim() !== ""))
    .map(r => {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = (r[idx] || "").trim(); });
      return obj;
    });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function renderPubItem(row) {
  const doi = row.DOI ? row.DOI.trim() : "";
  const doiLink = doi
    ? ` &middot; DOI: <a href="https://doi.org/${escapeHtml(doi)}" target="_blank" rel="noopener">${escapeHtml(doi)}</a>`
    : "";
  return `<li>
    <span class="pub-year">${escapeHtml(row.Tahun)}</span>
    <span class="pub-title">${escapeHtml(row.Judul)}</span>
    <span class="pub-venue">${escapeHtml(row.Venue)}${doiLink}</span>
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

      utamaEl.innerHTML = utama.length
        ? utama.map(renderPubItem).join("")
        : `<li class="data-loading">Belum ada data publikasi.</li>`;

      if (lainnya.length) {
        lainnyaEl.innerHTML = lainnya.map(renderPubItem).join("");
        summaryEl.textContent = `Publikasi lainnya (${lainnya.length})`;
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
