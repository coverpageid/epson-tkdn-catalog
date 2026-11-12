/* Generate CERTIFICATES.md (daftar semua nomor sertifikat) from certs.js. */
const fs = require("fs"), vm = require("vm"), path = require("path");
const ROOT = path.join(__dirname, "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "assets/data/certs.js"), "utf8"), ctx);
const C = ctx.window.TKDN_CERTS || [];
const real = C.filter((c) => c.isReal);
const fake = C.filter((c) => !c.isReal);
const esc = (s) => String(s).replace(/\|/g, "\\|");

let out = `# Daftar Nomor Sertifikat TKDN — Katalog Epson\n\n`;
out += `Di-generate otomatis dari \`assets/data/products.js\` oleh \`scripts/build_certs.js\`.\n`;
out += `**${real.length} nomor sertifikat Kemenperin RI** mencakup **${real.reduce((a, c) => a + c.products.length, 0)} model**; `;
out += `sisanya berstatus PDN atau referensi katalog tanpa nomor sertifikat.\n\n`;
out += `Klik nomor sertifikat di katalog (kartu produk, halaman detail, tabel sertifikat, atau tabel bandingkan) `;
out += `untuk membuka **popup Keterangan Sertifikat**. Tautan langsung: `;
out += `\`#/cert/<nomor sertifikat di-encode>\`.\n\n`;
out += `## 42 Nomor Sertifikat Resmi\n\n`;
out += `| # | Nomor Sertifikat | Jenis | Periode | Model | Rentang TKDN | Rentang TKDN+BMP |\n`;
out += `|---|---|---|---|---|---|---|\n`;
real.forEach((c, i) => {
  const models = c.products.map((p) => p.model).join(", ");
  const tk = c.tkdnMin === c.tkdnMax ? c.tkdnMin : `${c.tkdnMin} – ${c.tkdnMax}`;
  const tt = c.totalMin === c.totalMax ? c.totalMin : `${c.totalMin} – ${c.totalMax}`;
  out += `| ${i + 1} | \`${esc(c.certNo)}\` | ${esc(c.kind)} | ${esc(c.period)} | ${c.productCount} — ${esc(models)} | ${esc(tk)} | ${esc(tt)} |\n`;
});
out += `\n## Bukan nomor sertifikat (${fake.length} entri placeholder)\n\n`;
fake.forEach((c) => {
  out += `- \`${esc(c.certNo)}\` — ${c.products.length} produk: ${esc(c.products.map((p) => p.model).join(", "))}\n`;
});
out += `\n## Catatan\n\n`;
out += `- Pemegang seluruh sertifikat: **PT Indonesia Epson Industry**. Nilai BMP perangkat keras: **13,65%**.\n`;
out += `- Beberapa nomor surat mencakup banyak model, mis. \`725/SJ-IND.8/E-TKDN/3/2024\` (7 model) dan \`6109/SJ-IND.8/E-TKDN/5/2025\` (L3251 & L3211).\n`;
out += `- Situs resmi Kemenperin **tidak mencantumkan nomor tanda sah** pada basis data publiknya (\`cert_no\` kosong). `;
out += `Pencarian nomor utuh di \`tkdn.kemenperin.go.id/sertifikat?q=...&by=cert\` dapat mengembalikan puluhan ribu baris. `;
out += `Popup memakai data katalog internal (efektif 28 Agustus 2026) dan menyediakan tombol verifikasi ke situs resmi.\n`;
out += `- Regenerasi: \`node scripts/build_certs.js && node scripts/build_cert_list.js\`.\n`;

const dest = path.join(ROOT, "CERTIFICATES.md");
fs.writeFileSync(dest, out, "utf8");
console.log("wrote", dest, `(${real.length} sertifikat)`);
