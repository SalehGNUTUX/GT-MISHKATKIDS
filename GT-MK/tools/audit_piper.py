# tools/audit_piper.py — يُفنِّمُ نصوصًا بمُفنِّمِ Piper نفسِه (PiperVoice.phonemize) ويَعُدُّ أنماطَ الخطأ المعروفة.
# يُستدعى من tools/audit-piper.mjs:  python audit_piper.py <in.json> <out.json> <model.onnx>
# in.json = [{ t, old, new }] (نصُّ التركيبِ قبلَ/بعدَ التصحيح) — out.json = الفونيماتُ وعدّاداتُ الأنماط.
import sys, json, re
from piper import PiperVoice
CONS = "bdfhjklmnqrstvwxzðħʃʒʕʔθɣ"
PATTERNS = {
  "triple": re.compile(r"([%s])\1\1" % CONS),                 # حرفٌ مثلَّث (ال + شمسيّة مشدّدة): ʔarrr
  "bi_aal": re.compile(r"bi[ˈˌ]?aː[ˈˌ]?l"),                    # «بِالـ» ← biaːl
  "wasl_hamza": re.compile(r"[aiu]ː? [ˈˌ]?ʔa([%s])\1" % CONS), # همزةٌ وسطَ الكلامِ قبلَ شمسيّة: raʔaː ʔann
  "wasl_al": re.compile(r"[aiu]ː? [ˈˌ]?al[%s]" % CONS),        # «ال» منطوقةٌ بعدَ حركة: fiː albait
  "ta_un": re.compile(r"at[ˈˌ]?un\b"),                           # تنوينٌ على «ةُ» (قد يكونُ زائدًا): ʔazzahratun
}
def ph(v, t): return " ".join("".join(s) for s in v.phonemize(t))
def count(p): return {k: len(r.findall(p)) for k, r in PATTERNS.items()}
v = PiperVoice.load(sys.argv[3])
items = json.load(open(sys.argv[1], encoding="utf-8"))
out = []
for it in items:
    a = ph(v, it["old"]); b = ph(v, it["new"]) if it["new"] != it["old"] else a
    out.append({**it, "ph_old": a, "ph_new": b, "c_old": count(a), "c_new": count(b)})
json.dump(out, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=0)
