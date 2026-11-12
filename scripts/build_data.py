"""Build assets/data/products.js and assets/img/*.jpg for the Epson TKDN & PDN Catalog.

Combines:
1. Official 2026 TKDN Certificate Registry (TKDN EPSON AllProduk.pdf, effective 28 Aug 2026)
2. Official Katalog Produk Epson TKDN FY25 (40-page PDF, including PDN products & specs)
3. Full technical specification tables and product images from epson.co.id
"""
import html, io, json, re, urllib.request
from pathlib import Path
from PIL import Image
import pymupdf

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "assets" / "img"
OUT_JS = ROOT / "assets" / "data" / "products.js"
SCRAPED = Path(r"D:\UserTemp\Qeea.Deeva\opencode\tkdn_scraped.json")
PDF_FY25 = Path(r"C:\Users\Qeea.Deeva\Desktop\5fe2e69b995d44a32ea5a171d9315528ccaff15d.pdf")
ECOTANK_PRODUCTS = Path(r"C:\Users\Qeea.Deeva\Documents\GitHub\epson-ecotank-catalog\assets\data\products.js")

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}

# Curated Indonesian tagline & key highlights for all 79 TKDN & PDN products
CURATED = {
    # 1. EcoTank Ink Tank Printers
    "L3211":  ("EcoTank L3211", "Printer All-in-One A4 TKDN (66,45%) untuk cetak, pindai dan salin dokumen harian yang super hemat.", "Print · Scan · Copy", "A4", "33 / 15 ppm (10 / 5 ipm)", "USB 2.0"),
    "L3251":  ("EcoTank L3251", "Printer All-in-One A4 Wi-Fi dengan nilai TKDN tertinggi (75,28%) dan dukungan Epson Smart Panel.", "Print · Scan · Copy · Wi-Fi", "A4", "33 / 15 ppm (10 / 5 ipm)", "USB 2.0, Wi-Fi, Wi-Fi Direct"),
    "L6550":  ("EcoTank L6550", "Printer bisnis A4/A3 dengan tinta pigmen DURABrite ET, duplex otomatis, ADF dan 2 kaset kertas.", "Print · Scan · Copy · Fax · ADF", "A4 / A3", "25 / 12 ipm", "Wi-Fi, Ethernet, USB"),
    "L6580":  ("EcoTank L6580", "Printer bisnis berkinerja tinggi dengan kecepatan cetak 25 ipm warna/hitam dan layar sentuh 4,3\".", "Print · Scan · Copy · Fax · ADF", "A4 / A3", "25 / 25 ipm", "Wi-Fi, Ethernet, USB"),
    "L15150": ("EcoTank L15150", "Printer bisnis A3+ penuh (cetak, pindai, salin, faks, duplex A3) dengan tinta pigmen 4 warna.", "Print · Scan · Copy · Fax · A3", "A3+", "25 / 12 ipm", "Wi-Fi, Ethernet, USB"),
    "L15160": ("EcoTank L15160", "Printer bisnis A3+ berkecepatan tinggi 25 ipm warna & monokrom dengan tinta pigmen penuh.", "Print · Scan · Copy · Fax · A3", "A3+", "25 / 25 ipm", "Wi-Fi, Ethernet, USB"),
    "L15180": ("EcoTank L15180", "Flagship EcoTank A3+ dengan kecepatan 25 ipm, duplex scan, layar sentuh 4,3\" dan PCL/PostScript.", "Print · Scan · Copy · Fax · A3", "A3+", "25 / 25 ipm", "Wi-Fi, Ethernet, USB"),
    "M15140": ("EcoTank M15140", "Printer monokrom A3+ TKDN (69,82%) dengan kecepatan 25 ipm dan cetak bolak-balik otomatis A3.", "Print · Scan · Copy · Mono A3", "A3+", "25 ipm (32 ppm)", "Wi-Fi, Ethernet, USB"),
    "M15180": ("EcoTank M15180", "Printer monokrom A3+ kelas bisnis (TKDN 69,82%) dengan ADF duplex, faks dan dukungan PCL.", "Print · Scan · Copy · Fax · Mono A3", "A3+", "25 ipm (32 ppm)", "Wi-Fi, Ethernet, USB"),

    # 2. WorkForce Pro & Enterprise Business Inkjet
    "WF-C5390": ("WorkForce Pro WF-C5390", "Printer bisnis warna A4 single-function berteknologi PrecisionCore Heat-Free, cepat dan hemat daya.", "Print · Duplex", "A4", "25 / 25 ipm", "Wi-Fi, Ethernet, USB"),
    "WF-C5890": ("WorkForce Pro WF-C5890", "Printer multifungsi bisnis warna A4 dengan ADF duplex satu-jalur dan kecepatan 25 ipm.", "Print · Scan · Copy · Fax · ADF", "A4", "25 / 25 ipm", "Wi-Fi, Ethernet, USB"),
    "WF-C579R": ("WorkForce Pro WF-C579R", "Printer bisnis A4 sistem RIPS (Replaceable Ink Pack) hingga 50.000 halaman hitam tanpa ganti tinta.", "Print · Scan · Copy · Fax · RIPS", "A4", "24 / 24 ipm", "Wi-Fi, Ethernet, USB"),
    "EM-C800":  ("WorkForce Pro EM-C800", "Printer multifungsi bisnis A4 RIPS generasi terbaru (TKDN 66,87%) berkecepatan 25 ipm.", "Print · Scan · Copy · Fax · RIPS", "A4", "25 / 25 ipm", "Wi-Fi, Ethernet, USB"),
    "WF-C878R": ("WorkForce Pro WF-C878R", "Printer multifungsi A3+ sistem RIPS untuk grup kerja dengan kapasitas tinta hingga 86.000 halaman.", "Print · Scan · Copy · Fax · A3 RIPS", "A3+", "25 / 24 ipm", "Wi-Fi, Ethernet, USB"),
    "WF-C879R": ("WorkForce Pro WF-C879R", "Printer multifungsi A3+ RIPS kelas berat dengan kecepatan pindai ADF 100 ipm duplex.", "Print · Scan · Copy · Fax · A3 RIPS", "A3+", "26 / 25 ipm", "Wi-Fi, Ethernet, USB"),
    "EM-C8100": ("WorkForce Pro EM-C8100", "Printer multifungsi A3+ RIPS generasi baru (TKDN 61,40%) dengan efisiensi energi Heat-Free.", "Print · Scan · Copy · Fax · A3", "A3+", "25 / 24 ipm", "Wi-Fi, Ethernet, USB"),
    "EM-C8101": ("WorkForce Pro EM-C8101", "Printer multifungsi A3+ RIPS generasi baru (TKDN 61,31%) untuk volume cetak korporat tinggi.", "Print · Scan · Copy · Fax · A3", "A3+", "26 / 25 ipm", "Wi-Fi, Ethernet, USB"),
    "AM-C400":  ("WorkForce Enterprise AM-C400", "MFP bisnis warna A4 kompak berteknologi Linehead PrecisionCore 40 ppm (TKDN 61,13%).", "Print · Scan · Copy · Linehead", "A4", "40 / 40 ipm", "Ethernet, USB, Opsi Wi-Fi"),
    "AM-C550":  ("WorkForce Enterprise AM-C550", "MFP bisnis warna A4 berkecepatan tinggi 55 ppm dengan layar sentuh 10,1\" (Produk Dalam Negeri).", "Print · Scan · Copy · Linehead", "A4", "55 / 55 ipm", "Ethernet, USB, Opsi Wi-Fi"),
    "AM-M5500": ("WorkForce Enterprise AM-M5500", "MFP departemen monokrom A3 berkecepatan 55 ppm dengan sertifikasi TKDN 60,78%.", "Print · Scan · Copy · Mono A3", "A3", "55 ipm", "Ethernet, USB, Opsi Wi-Fi"),
    "AM-C4000": ("WorkForce Enterprise AM-C4000", "MFP departemen warna A3 berkecepatan 40 ppm dengan teknologi Linehead Heat-Free.", "Print · Scan · Copy · A3", "A3", "40 / 40 ipm", "Ethernet, USB, Opsi Wi-Fi"),
    "AM-C5000": ("WorkForce Enterprise AM-C5000", "MFP departemen warna A3 berkecepatan 50 ppm dan pindai duplex 120 ipm.", "Print · Scan · Copy · A3", "A3", "50 / 50 ipm", "Ethernet, USB, Opsi Wi-Fi"),
    "AM-C6000": ("WorkForce Enterprise AM-C6000", "MFP departemen warna A3 berkecepatan 60 ppm untuk beban kerja korporat & pemerintahan.", "Print · Scan · Copy · A3", "A3", "60 / 60 ipm", "Ethernet, USB, Opsi Wi-Fi"),
    "WF-C20750": ("WorkForce Enterprise WF-C20750", "MFP produksi warna A3+ kecepatan ultra 75 ipm dengan konsumsi daya sangat rendah.", "Print · Scan · Copy · A3+", "A3+", "75 / 75 ipm", "Ethernet, USB, Opsi Wi-Fi"),
    "WF-C21000": ("WorkForce Enterprise WF-C21000", "Flagship MFP warna A3+ kecepatan 100 ipm untuk pusat cetak dan korporasi besar.", "Print · Scan · Copy · A3+", "A3+", "100 / 100 ipm", "Ethernet, USB, Opsi Wi-Fi"),
    "WF-M21000": ("WorkForce Enterprise WF-M21000", "Flagship MFP monokrom A3+ kecepatan 100 ipm untuk volume dokumen masif.", "Print · Scan · Copy · Mono A3+", "A3+", "100 ipm", "Ethernet, USB, Opsi Wi-Fi"),
    "WF-M5399": ("WorkForce Pro WF-M5399", "Printer bisnis monokrom A4 single-function dengan tinta hingga 40.000 halaman (PDN).", "Print · Duplex · Mono", "A4", "25 ipm", "Wi-Fi, Ethernet, USB"),
    "WF-M5899": ("WorkForce Pro WF-M5899", "Printer multifungsi bisnis monokrom A4 dengan ADF duplex dan tinta 40.000 halaman (PDN).", "Print · Scan · Copy · Fax · Mono", "A4", "25 ipm", "Wi-Fi, Ethernet, USB"),

    # 3. Document Scanners
    "DS-1630":   ("WorkForce DS-1630", "Scanner dokumen Flatbed A4 dilengkapi ADF duplex 50 lembar untuk arsip serbaguna.", "Flatbed + ADF Duplex", "A4", "25 ppm / 10 ipm", "USB 3.0"),
    "DS-1730":   ("WorkForce DS-1730", "Scanner dokumen Flatbed A4 + ADF duplex generasi terbaru (TKDN 55,91%).", "Flatbed + ADF Duplex", "A4", "30 ppm / 20 ipm", "USB 3.2 Gen 1"),
    "DS-C330":   ("WorkForce DS-C330", "Scanner sheet-fed ringkas jalur U-turn & lurus untuk meja kerja sempit (TKDN 52,83%).", "Sheet-fed Duplex Ringkas", "A4", "30 ppm / 60 ipm", "USB 2.0"),
    "DS-730N":   ("WorkForce DS-730N", "Scanner dokumen jaringan (Ethernet RJ45) mandiri dengan layar LCD 1,44\" dan kecepatan 40 ppm.", "Sheet-fed Duplex · Network", "A4", "40 ppm / 80 ipm", "Ethernet RJ45, USB 2.0"),
    "ES-580W":   ("WorkForce ES-580W", "Scanner dokumen nirkabel dengan layar sentuh 4,3\" — pindai langsung ke cloud/PC tanpa komputer.", "Sheet-fed Duplex · Wi-Fi", "A4", "35 ppm / 70 ipm", "Wi-Fi, Wi-Fi Direct, USB 3.2"),
    "DS-530II":  ("WorkForce DS-530II", "Scanner sheet-fed duplex A4 andal 35 ppm / 70 ipm dengan sensor ultrasonik anti-macet.", "Sheet-fed Duplex", "A4", "35 ppm / 70 ipm", "USB 3.2 Gen 1"),
    "DS-570WII": ("WorkForce DS-570WII", "Scanner sheet-fed duplex A4 35 ppm / 70 ipm dilengkapi konektivitas Wi-Fi & NFC.", "Sheet-fed Duplex · Wi-Fi", "A4", "35 ppm / 70 ipm", "Wi-Fi, Wi-Fi Direct, USB 3.0"),
    "DS-770II":  ("WorkForce DS-770II", "Scanner sheet-fed duplex A4 kecepatan 45 ppm / 90 ipm dengan ADF 100 lembar.", "Sheet-fed Duplex", "A4", "45 ppm / 90 ipm", "USB 3.2 Gen 1"),
    "DS-870":    ("WorkForce DS-870", "Scanner dokumen kecepatan tinggi 65 ppm / 130 ipm dengan siklus harian hingga 7.000 lembar.", "Sheet-fed Duplex", "A4", "65 ppm / 130 ipm", "USB 3.2 Gen 1"),
    "DS-970":    ("WorkForce DS-970", "Scanner dokumen ultra-cepat 85 ppm / 170 ipm dengan siklus harian hingga 9.000 lembar.", "Sheet-fed Duplex", "A4", "85 ppm / 170 ipm", "USB 3.2 Gen 1"),
    "DS-30000":  ("WorkForce DS-30000", "Scanner dokumen format besar A3 berkecepatan 70 ppm / 140 ipm untuk digitalisasi arsip.", "Sheet-fed Duplex A3", "A3", "70 ppm / 140 ipm", "USB 3.2 Gen 1"),
    "DS-32000":  ("WorkForce DS-32000", "Flagship scanner dokumen A3 kecepatan 90 ppm / 180 ipm dengan sasis putar fleksibel.", "Sheet-fed Duplex A3", "A3", "90 ppm / 180 ipm", "USB 3.2 Gen 1"),
    "ES-C320W":  ("WorkForce ES-C320W", "Scanner dokumen ringkas berfitur Wi-Fi untuk kantor modern (Produk Dalam Negeri).", "Sheet-fed Duplex · Wi-Fi", "A4", "30 ppm / 60 ipm", "Wi-Fi, Wi-Fi Direct, USB 2.0"),
    "ES-C380W":  ("WorkForce ES-C380W", "Scanner ringkas Wi-Fi mandiri dengan layar sentuh 2,4\" & Epson Connect (PDN).", "Sheet-fed Duplex · Wi-Fi", "A4", "30 ppm / 60 ipm", "Wi-Fi, Wi-Fi Direct, USB 3.2"),
    "DS-790WN":  ("WorkForce DS-790WN", "Scanner jaringan kelas korporat dengan Wi-Fi, Ethernet RJ45 dan layar sentuh 4,3\" (PDN).", "Sheet-fed Duplex · Network", "A4", "45 ppm / 90 ipm", "Wi-Fi, Ethernet, USB 3.2"),
    "Perfection V39II": ("Perfection V39II", "Scanner foto & dokumen flatbed A4 tipis bertenaga USB 4.800 dpi (Produk Dalam Negeri).", "Flatbed Scanner", "A4", "10 detik / halaman", "USB 2.0 Micro-B"),

    # 4. Dot Matrix & Passbook
    "LQ-310":  ("Epson LQ-310", "Printer dot matrix 24-pin 80 kolom legendaris — cepat (416 cps), tangguh, untuk faktur rangkap 4.", "Dot Matrix 24-Pin · 80 Kolom", "A4 / Continuous", "416 cps (12 cpi)", "USB, Paralel, Serial"),
    "LX-310":  ("Epson LX-310", "Printer dot matrix 9-pin 80 kolom berkecepatan 357 cps untuk kasir dan administrasi.", "Dot Matrix 9-Pin · 80 Kolom", "A4 / Continuous", "357 cps (12 cpi)", "USB, Paralel, Serial"),
    "LQ-2190": ("Epson LQ-2190", "Printer dot matrix 24-pin kereta lebar (136 kolom / A3) kecepatan 576 cps untuk laporan keuangan.", "Dot Matrix 24-Pin · 136 Kolom", "A3 / Continuous", "576 cps (12 cpi)", "USB, Paralel"),
    "PLQ-35":  ("Epson PLQ-35", "Printer buku tabungan (passbook) 24-pin dengan penyelarasan otomatis & kecepatan hingga 540 cps.", "Passbook Printer 24-Pin", "Passbook / A4", "540 cps (10 cpi)", "USB, Paralel, Serial"),
    "PLQ-50":  ("Epson PLQ-50", "Printer passbook 24-pin dilengkapi layar LCD untuk kemudahan operasional perbankan & koperasi.", "Passbook Printer 24-Pin · LCD", "Passbook / A4", "560 cps (10 cpi)", "USB, Paralel, Serial"),

    # 5. ColorWorks Label Printers
    "CW-C6050A": ("ColorWorks CW-C6050A", "Printer label warna industri lebar 4 inci dilengkapi pemotong otomatis (Auto-Cutter).", "Label Warna 4\" · Auto-Cutter", "Lebar 4,25\"", "119 mm/detik", "Ethernet, USB 2.0"),
    "CW-C6050P": ("ColorWorks CW-C6050P", "Printer label warna industri lebar 4 inci dilengkapi pengupas otomatis (Peeler).", "Label Warna 4\" · Peeler", "Lebar 4,25\"", "119 mm/detik", "Ethernet, USB 2.0"),
    "CW-C6550A": ("ColorWorks CW-C6550A", "Printer label warna industri lebar 8 inci (A4/GHS) dilengkapi Auto-Cutter.", "Label Warna 8\" · Auto-Cutter", "Lebar 8,5\"", "85 mm/detik", "Ethernet, USB 2.0"),
    "CW-C6550P": ("ColorWorks CW-C6550P", "Printer label warna industri lebar 8 inci dilengkapi pengupas label otomatis (Peeler).", "Label Warna 8\" · Peeler", "Lebar 8,5\"", "85 mm/detik", "Ethernet, USB 2.0"),

    # 6. SureColor Technical Plotter & Sublimation
    "SC-T3130":   ("SureColor SC-T3130", "Plotter teknis CAD/GIS ukuran 24 inci (A1) dengan stand, Wi-Fi dan tinta pigmen UltraChrome XD2.", "Plotter Teknis 24\" (A1)", "24\" (A1)", "34 detik / A1", "Wi-Fi, Ethernet, USB"),
    "SC-T3130N":  ("SureColor SC-T3130N", "Plotter teknis 24 inci (A1) model desktop (tanpa stand) yang hemat ruang dengan Wi-Fi.", "Plotter Teknis 24\" Desktop", "24\" (A1)", "34 detik / A1", "Wi-Fi, Ethernet, USB"),
    "SC-T3130X":  ("SureColor SC-T3130X", "Plotter teknis 24 inci (A1) dengan sistem tangki tinta isi ulang (Ink Tank) berbiaya rendah.", "Plotter Ink Tank 24\" (A1)", "24\" (A1)", "34 detik / A1", "Wi-Fi, Ethernet, USB"),
    "SC-T3130M":  ("SureColor SC-T3130M", "Plotter multifungsi 24 inci (A1) terintegrasi dengan pemindai (scanner) CIS 600 dpi.", "Plotter + Scanner 24\" (A1)", "24\" (A1)", "34 detik / A1", "Wi-Fi, Ethernet, USB"),
    "SC-T5130":   ("SureColor SC-T5130", "Plotter teknis CAD/GIS ukuran 36 inci (A0) dengan tinta pigmen tahan air UltraChrome XD2.", "Plotter Teknis 36\" (A0)", "36\" (A0)", "31 detik / A1", "Wi-Fi, Ethernet, USB"),
    "SC-T5130M":  ("SureColor SC-T5130M", "Plotter multifungsi 36 inci (A0) lengkap dengan scanner terintegrasi 36 inci.", "Plotter + Scanner 36\" (A0)", "36\" (A0)", "31 detik / A1", "Wi-Fi, Ethernet, USB"),
    "SC-T3435":   ("SureColor SC-T3435", "Plotter teknis 24 inci (A1) kelas produksi dengan kartrid besar hingga 700 ml.", "Plotter Produksi 24\" (A1)", "24\" (A1)", "25 detik / A1", "Wi-Fi, Ethernet, USB"),
    "SC-T5435":   ("SureColor SC-T5435", "Plotter teknis 36 inci (A0) kelas produksi berkecepatan 22 detik/A1 dan kartrid 700 ml.", "Plotter Produksi 36\" (A0)", "36\" (A0)", "22 detik / A1", "Wi-Fi, Ethernet, USB"),
    "SC-T5430M":  ("SureColor SC-T5430M", "Plotter multifungsi produksi 36 inci (A0) dengan scanner cepat 7,5 ips warna.", "Plotter + Scanner 36\" (A0)", "36\" (A0)", "22 detik / A1", "Wi-Fi, Ethernet, USB"),
    "SC-T3730D":  ("SureColor SC-T3730D", "Plotter produksi 24 inci 6 warna (termasuk Red) dengan Dual Roll & Adobe PostScript (PDN).", "Plotter 6-Warna 24\" · Dual Roll", "24\" (A1)", "16 detik / A1", "Wi-Fi, Gigabit Ethernet, USB"),
    "SC-T3730E":  ("SureColor SC-T3730E", "Plotter produksi 24 inci 6 warna UltraChrome XD3 dengan Single Roll (Produk Dalam Negeri).", "Plotter 6-Warna 24\" (A1)", "24\" (A1)", "16 detik / A1", "Wi-Fi, Gigabit Ethernet, USB"),
    "SC-T3730DE": ("SureColor SC-T3730DE", "Plotter produksi 24 inci 6 warna dengan sistem Dual Roll otomatis (Produk Dalam Negeri).", "Plotter 6-Warna 24\" · Dual Roll", "24\" (A1)", "16 detik / A1", "Wi-Fi, Gigabit Ethernet, USB"),
    "SC-T5730DM": ("SureColor SC-T5730DM", "Plotter multifungsi 36 inci 6 warna dengan scanner CIS 36\" & Dual Roll (PDN).", "Plotter + Scanner 36\" · Dual Roll", "36\" (A0)", "16 detik / A1", "Wi-Fi, Gigabit Ethernet, USB"),
    "SC-T7730D":  ("SureColor SC-T7730D", "Flagship plotter produksi 44 inci (B0+) 6 warna dengan Dual Roll (Produk Dalam Negeri).", "Plotter 6-Warna 44\" · Dual Roll", "44\" (B0+)", "16 detik / A1", "Wi-Fi, Gigabit Ethernet, USB"),
    "SC-F530":    ("SureColor SC-F530", "Printer sublimasi tekstil 24 inci dengan tinta UltraChrome DS untuk merchandise & garmen.", "Printer Sublimasi 24\"", "24\" (A1+)", "62 detik / A1", "Wi-Fi, Ethernet, USB"),
    "SC-F531":    ("SureColor SC-F531", "Printer sublimasi 24 inci dengan tinta Fluorescent Pink & Yellow untuk warna neon mencolok.", "Printer Sublimasi Fluorescent 24\"", "24\" (A1+)", "62 detik / A1", "Wi-Fi, Ethernet, USB"),

    # 7. Business Projectors
    "EB-E600": ("Proyektor EB-E600", "Proyektor 3LCD XGA 3.400 lumens bersertifikat TKDN (55,70%) untuk ruang kelas dan rapat.", "3LCD · XGA (1024×768)", "3.400 Lumens", "Kontras 15.000:1", "HDMI, 2× VGA, USB-B"),
    "EB-X600": ("Proyektor EB-X600", "Proyektor 3LCD XGA 3.600 lumens bersertifikat TKDN (55,02%) dengan port RJ45 LAN & opsi Wi-Fi.", "3LCD · XGA (1024×768)", "3.600 Lumens", "Kontras 16.000:1", "HDMI, RJ45 LAN, 2× VGA, USB-A/B"),

    # 8. Ink Bottles
    "T6641 Black":   ("Tinta Botol Epson T6641 (Black)", "Botol tinta hitam orisinal 70 ml seri 664 bersertifikat TKDN (25,23%) untuk L121.", "Tinta Dye Hitam · 70 ml", "Seri 664", "4.000 hal. hitam", "Botol 70 ml"),
    "T6642 Cyan":    ("Tinta Botol Epson T6642 (Cyan)", "Botol tinta cyan orisinal 70 ml seri 664 bersertifikat TKDN (25,25%).", "Tinta Dye Cyan · 70 ml", "Seri 664", "6.500 hal. warna", "Botol 70 ml"),
    "T6643 Magenta": ("Tinta Botol Epson T6643 (Magenta)", "Botol tinta magenta orisinal 70 ml seri 664 bersertifikat TKDN (25,27%).", "Tinta Dye Magenta · 70 ml", "Seri 664", "6.500 hal. warna", "Botol 70 ml"),
    "T6644 Yellow":  ("Tinta Botol Epson T6644 (Yellow)", "Botol tinta kuning orisinal 70 ml seri 664 bersertifikat TKDN (25,20%).", "Tinta Dye Yellow · 70 ml", "Seri 664", "6.500 hal. warna", "Botol 70 ml"),
    "003 Black":     ("Tinta Botol Epson 003 (Black)", "Botol tinta hitam anti-tumpah 65 ml seri 003 bersertifikat TKDN (25,65%) untuk L3211 / L3251 / L3311 / L3351 / L5290 / L5391.", "Tinta Dye Hitam · 65 ml", "Seri 003", "4.500 hal. hitam", "Botol Anti-Tumpah 65 ml"),
    "003 Cyan":      ("Tinta Botol Epson 003 (Cyan)", "Botol tinta cyan anti-tumpah 65 ml seri 003 bersertifikat TKDN (25,25%).", "Tinta Dye Cyan · 65 ml", "Seri 003", "7.500 hal. warna", "Botol Anti-Tumpah 65 ml"),
    "003 Magenta":   ("Tinta Botol Epson 003 (Magenta)", "Botol tinta magenta anti-tumpah 65 ml seri 003 bersertifikat TKDN (25,72%).", "Tinta Dye Magenta · 65 ml", "Seri 003", "7.500 hal. warna", "Botol Anti-Tumpah 65 ml"),
    "003 Yellow":    ("Tinta Botol Epson 003 (Yellow)", "Botol tinta kuning anti-tumpah 65 ml seri 003 bersertifikat TKDN (25,54%).", "Tinta Dye Yellow · 65 ml", "Seri 003", "7.500 hal. warna", "Botol Anti-Tumpah 65 ml"),
}

FALLBACK_SPECS = {
    "WF-M5399": {
        "Printer Type": {"Tipe Printer": "Print Only (Single-Function Monochrome Business Inkjet)"},
        "Printing Technology": {
            "Teknologi Cetak": "PrecisionCore Printhead (Heat-Free Technology)",
            "Resolusi Maksimum": "1,200 x 2,400 dpi",
            "Pencetakan Otomatis 2 Sisi": "Ya (Hingga A4)",
        },
        "Print Speed": {
            "Draf, A4 (Hitam)": "34 ppm",
            "ISO 24734, A4 Simpleks / Dupleks": "25 ipm / 16 ipm",
            "Waktu Keluar Halaman Pertama": "4,8 detik",
        },
        "Paper Handling": {
            "Kapasitas Input Kertas Standar": "330 lembar (250 lembar kaset + 80 lembar rear tray), maks. 1.830 lembar",
            "Ukuran Kertas Maksimum": "215.9 x 6,000 mm",
        },
        "Interface": {
            "USB": "USB 2.0",
            "Jaringan": "Ethernet, Wi-Fi IEEE 802.11b/g/n, Wi-Fi Direct",
            "Bahasa Cetak": "PCL5e, PCL6, PostScript 3, PDF (ver1.7), ESC/P-R",
        },
    },
    "DS-1630": {
        "Scanner": {
            "Tipe Pemindai": "A4 Flatbed Colour Image Scanner with Automatic Document Feeder (ADF)",
            "Tipe Sensor": "CIS (Contact Image Sensor)",
            "Resolusi Optik": "Flatbed: 1,200 x 1,200 dpi · ADF: 600 x 600 dpi",
            "Kapasitas ADF": "50 lembar (80 g/m²)",
            "Siklus Harian": "Hingga 1.500 halaman / hari",
        },
        "Scanning Speed": {
            "Kecepatan Pindai ADF (A4, 300 dpi)": "25 ppm / 10 ipm (Duplex)",
        },
        "Interface": {
            "Antarmuka": "USB 3.0 ( SuperSpeed ), Opsional Network Interface Unit",
        },
    },
}

INK_CROPS = {
    "T6641 Black":   (385, 240, 475, 455),
    "T6642 Cyan":    (830, 240, 920, 455),
    "T6643 Magenta": (385, 525, 475, 740),
    "T6644 Yellow":  (830, 525, 920, 740),
    "003 Black":     (385, 815, 475, 1030),
    "003 Cyan":      (830, 815, 920, 1030),
    "003 Magenta":   (385, 1095, 475, 1310),
    "003 Yellow":    (830, 1095, 920, 1310),
}

def get_bytes(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()

def strip_tags(s):
    return html.unescape(re.sub(r"<[^>]+>", " ", s)).strip()

def parse_specs(page_html):
    specs = {}
    for m in re.finditer(r'<div class="text-row" data-classificationId="([^"]+)">(.*?)</div>', page_html, re.S):
        cat = strip_tags(m.group(1)).rstrip(":")
        body = re.sub(r"<h4>.*?</h4>\s*<hr>", "", m.group(2), flags=re.S)
        rows = {}
        for rm in re.finditer(r'<strong style="display:block">(.*?)</strong>\s*(.*?)(?=<strong style="display:block">|$)', body, re.S):
            k = re.sub(r"\s+", " ", strip_tags(rm.group(1))).rstrip(":")
            v = re.sub(r"\s+", " ", strip_tags(rm.group(2).replace("<br/>", " · ").replace("<br>", " · ")))
            if k and v:
                rows[k] = v
        if rows:
            specs[cat] = rows
    return specs

def main():
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    OUT_JS.parent.mkdir(parents=True, exist_ok=True)

    scraped = json.load(open(SCRAPED, encoding="utf-8"))

    # Load EcoTank products for L3211 / L3251 specs
    ecotank_js = ECOTANK_PRODUCTS.read_text(encoding="utf-8")
    ecotank_list = json.loads(ecotank_js.split("window.PRODUCTS = ", 1)[1].rsplit(";", 1)[0])
    ecotank_by_model = {p["model"]: p for p in ecotank_list}

    # Fix CW-C6050A and CW-C6550A directly
    cw_fixes = {
        "CW-C6050A": (
            "https://www.epson.co.id/For-Work/Printers/PrecisionCore/Professional-Printers/Epson-ColorWorks-C6050A-Colour-Label-Printer-with-Auto-Cutter/p/C31CH76106",
            "https://mediaserver.goepson.com/adaptivemedia/rendition?id=eb281ce911e7beee55cbbe6c536d2d37a47bd3c6&vid=eb281ce911e7beee55cbbe6c536d2d37a47bd3c6&prid=515Wx515H&clid=SAPDAM&prclid=productpictures&assetDescr=4_ac_4"
        ),
        "CW-C6550A": (
            "https://www.epson.co.id/For-Work/Printers/PrecisionCore/Professional-Printers/Epson-ColorWorks-C6550A-Colour-Label-Printer-with-Auto-Cutter/p/C31CH77106",
            "https://mediaserver.goepson.com/adaptivemedia/rendition?id=a2b911d32c37c52a8a527782ee4d83065ab3184d&vid=a2b911d32c37c52a8a527782ee4d83065ab3184d&prid=515Wx515H&clid=SAPDAM&prclid=productpictures&assetDescr=8_ac_3"
        ),
    }

    # Extract Page 38 from PDF for clean Ink Bottle images
    doc = pymupdf.open(str(PDF_FY25))
    xref38 = doc[37].get_images(full=True)[0][0]
    page38_im = Image.open(io.BytesIO(doc.extract_image(xref38)["image"])).convert("RGB")

    out = []
    for r in scraped:
        model = r["model"]
        if model in cw_fixes:
            r["url"], _ = cw_fixes[model]
            try:
                ph = get_bytes(r["url"]).decode("utf-8", "ignore")
                r["specs"] = parse_specs(ph)
                m = re.search(r'src="(https://mediaserver\.goepson\.com/[^"]+4_ac_4|https://mediaserver\.goepson\.com/[^"]+8_ac_3)"', ph)
                if m:
                    r["imgUrl"] = html.unescape(m.group(1)).replace("96Wx96H", "515Wx515H").replace("300Wx300H", "515Wx515H")
            except Exception as e:
                print("CW fix err", model, e)

        if model in ecotank_by_model and not r["specs"]:
            r["specs"] = ecotank_by_model[model]["specs"]
        if model in FALLBACK_SPECS and not r["specs"]:
            r["specs"] = FALLBACK_SPECS[model]

        name, tagline, fn_summary, fmt_summary, speed_summary, conn_summary = CURATED[model]

        # Build clean specs with Sertifikasi TKDN / PDN at top
        clean_specs = {
            "Sertifikasi TKDN / PDN Kemenperin RI": {
                "Status Sertifikasi": "Tersertifikasi TKDN" if r["status"] == "TKDN" else "Produk Dalam Negeri (PDN)",
                "Kode Produk / SKU": r["tkdnCode"],
                "Nomor Sertifikat": r["certNo"],
                "Nilai TKDN": r["tkdnVal"],
                "Nilai BMP (Bobot Manfaat Perusahaan)": r["bmpVal"],
                "Total Nilai (TKDN + BMP)": r["totalVal"],
            }
        }
        if r["category"] == "ink":
            clean_specs["Spesifikasi Tinta Botol"] = {
                "Model Tinta": model,
                "Kode SKU": r["tkdnCode"],
                "Kapasitas": "65 ml (Botol Anti-Tumpah Key-Lock)" if "003" in model else "70 ml",
                "Hasil Cetak (Yield)": speed_summary,
                "Kompatibilitas Printer": "EcoTank L11050, L1256, L1310, L1350, L3211, L3216, L3251, L3256, L3311, L3316, L3351, L3356, L3550, L3556, L5290, L5296, L5391, L5590" if "003" in model else "EcoTank L121",
            }
            r["url"] = "https://www.epson.co.id/consumables"
        else:
            for c, kv in r["specs"].items():
                if c.startswith("_") or "Sertifikasi TKDN" in c or c == "Projectors Facets":
                    continue
                clean_specs[c] = kv

        # Image handling
        safe_sku = re.sub(r"[^A-Za-z0-9_-]", "_", r["tkdnCode"])
        img_rel = f"assets/img/{safe_sku}.jpg"
        img_dest = ROOT / img_rel

        if model in INK_CROPS:
            if not img_dest.exists():
                box = INK_CROPS[model]
                crop = page38_im.crop(box)
                canvas = Image.new("RGB", (400, 400), (255, 255, 255))
                # scale crop to height 340
                w, h = crop.size
                nh = 340
                nw = int(w * (nh / h))
                crop_r = crop.resize((nw, nh), Image.Resampling.LANCZOS)
                canvas.paste(crop_r, ((400 - nw) // 2, (400 - nh) // 2))
                canvas.save(img_dest, quality=92)
        else:
            if not img_dest.exists() and r["imgUrl"]:
                try:
                    raw = get_bytes(r["imgUrl"])
                    im = Image.open(io.BytesIO(raw))
                    if im.mode in ("RGBA", "LA", "P"):
                        bg = Image.new("RGB", im.size, (255, 255, 255))
                        im_rgba = im.convert("RGBA")
                        bg.paste(im_rgba, mask=im_rgba.split()[3])
                        bg.save(img_dest, "JPEG", quality=90)
                    else:
                        im.convert("RGB").save(img_dest, "JPEG", quality=90)
                except Exception as e:
                    print("Image download failed:", model, e)
                    img_rel = ""

        # Compute numeric TKDN+BMP score for sorting/filtering
        score_num = 0.0
        if r["status"] == "TKDN":
            try:
                score_num = float(r["totalVal"].replace("%", "").replace(",", "."))
            except ValueError:
                score_num = 0.0

        spec_blob = json.dumps(clean_specs, ensure_ascii=False).lower()
        conn_l = conn_summary.lower()
        fn_l = fn_summary.lower()

        out.append({
            "model": model,
            "name": name,
            "sku": r["tkdnCode"],
            "url": r["url"] or "https://www.epson.co.id",
            "image": img_rel,
            "category": r["category"],
            "tagline": tagline,
            "status": r["status"],           # "TKDN" or "PDN"
            "tkdnVal": r["tkdnVal"],
            "bmpVal": r["bmpVal"],
            "totalVal": r["totalVal"],
            "scoreNum": score_num,
            "certNo": r["certNo"],
            "is2026Cert": "/2026" in r["certNo"],
            "fnSummary": fn_summary,
            "fmtSummary": fmt_summary,
            "speedSummary": speed_summary,
            "connSummary": conn_summary,
            "wifi": "wi-fi" in conn_l or "wifi" in conn_l,
            "ethernet": "ethernet" in conn_l or "rj45" in conn_l or "lan" in conn_l,
            "duplex": "duplex" in fn_l or "duplex" in tagline.lower() or "2 sisi" in spec_blob,
            "largeFormat": any(x in fmt_summary for x in ("A3", "24\"", "36\"", "44\"", "8,5\"")),
            "pdfPage": r["pdfPage"],
            "specs": clean_specs,
        })

    cat_order = ["ecotank", "workforce", "scanner", "dotmatrix", "label", "plotter", "projector", "ink"]
    out.sort(key=lambda x: (cat_order.index(x["category"]), 0 if x["status"] == "TKDN" else 1, -x["scoreNum"], x["model"]))

    OUT_JS.write_text(
        "// Generated by scripts/build_data.py — Epson TKDN & PDN Official Catalog\nwindow.PRODUCTS = "
        + json.dumps(out, ensure_ascii=False, indent=1) + ";\n",
        encoding="utf-8"
    )
    print(f"Built {len(out)} products ({sum(1 for x in out if x['status']=='TKDN')} TKDN, {sum(1 for x in out if x['status']=='PDN')} PDN), {sum(1 for x in out if x['image'])} images.")

if __name__ == "__main__":
    main()
