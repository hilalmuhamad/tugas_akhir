import zipfile, re, sys

p = r"C:\Users\USER\Downloads\Hilal_Laporan Tugas Akhir.docx"
z = zipfile.ZipFile(p)
x = z.read("word/document.xml").decode("utf-8", "ignore")

# split into paragraphs
paras = re.findall(r"<w:p[ >].*?</w:p>", x, re.S)
out = []
for para in paras:
    texts = re.findall(r"<w:t[^>]*>(.*?)</w:t>", para, re.S)
    t = "".join(texts)
    t = (t.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
          .replace("&quot;", '"').replace("&apos;", "'"))
    t = t.strip()
    if t:
        out.append(t)

full = "\n".join(out)
sys.stdout.reconfigure(encoding="utf-8")

kw = sys.argv[1] if len(sys.argv) > 1 else "Identifikasi"
span = int(sys.argv[2]) if len(sys.argv) > 2 else 40

for i, line in enumerate(out):
    if re.search(kw, line, re.I):
        print("\n=== HIT line %d: %s" % (i, line[:90]))
        for j in range(i, min(i + span, len(out))):
            print("%4d | %s" % (j, out[j]))
        print("=== end hit\n")
