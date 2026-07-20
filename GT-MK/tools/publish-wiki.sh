#!/usr/bin/env bash
# tools/publish-wiki.sh — نشرُ وثائقِ docs/ إلى ويكي المستودع (وتحديثُها لاحقًا).
#
#   الاستعمال:  bash tools/publish-wiki.sh
#
# ⚠️ شرطٌ لمرّةٍ واحدةٍ فقط: يجبُ إنشاءُ **أوّلِ صفحةِ ويكي يدويًّا** من الواجهة، لأنّ GitHub
#    لا يُنشئُ مستودعَ <repo>.wiki.git إلّا حينئذٍ (ولا API لإنشائه):
#      https://github.com/SalehGNUTUX/GT-MISHKATKIDS/wiki  →  Create the first page  →  Save
#    بعدَها يُشغَّلُ هذا السكربتُ متى شئتَ فيُزامِنُ كلَّ شيء.
#
# المبدأ: **docs/ هو المصدرُ الوحيدُ للحقيقة**؛ الويكي مرآةٌ مولَّدةٌ منه — فلا يُحرَّرُ الويكي يدويًّا
# (أيُّ تحريرٍ يدويٍّ يُدهَسُ في المزامنةِ التالية).
set -euo pipefail

REPO="${WIKI_REPO:-SalehGNUTUX/GT-MISHKATKIDS}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOCS="$ROOT/docs"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

step() { printf '\n▶ %s\n' "$1"; }

step "استنساخُ الويكي"
if ! git clone --quiet "https://github.com/$REPO.wiki.git" "$WORK/wiki" 2>/dev/null; then
  cat >&2 <<'EOF'
❌ مستودعُ الويكي غيرُ مُهيَّأ.
   افتحْ صفحةَ الويكي وأنشِئْ أوّلَ صفحةٍ (أيَّ محتوًى) ثمّ احفظْها، وأعِدْ تشغيلَ السكربت:
     https://github.com/SalehGNUTUX/GT-MISHKATKIDS/wiki
EOF
  exit 1
fi

step "نسخُ الوثائق"
# أسماءُ صفحاتِ الويكي: اسمُ الملفِّ كما هو (بلا .md في العنوان). Home.md هي الصفحةُ الرئيسة.
cp "$DOCS"/*.md "$WORK/wiki/"
rm -f "$WORK/wiki/README.md"                       # فهرسُ docs يُستبدَلُ بصفحةِ Home أدناه
rm -f "$WORK/wiki/صفحة-توثيق-مشكاة-الطفل-و-الآلي.md"  # صفحةٌ تمهيديّةٌ أُدمِجَ معناها في Home

cat > "$WORK/wiki/Home.md" <<'HOME'
# 🪔 مِشكاةُ الطفلِ والآليّ — التوثيقُ الشامل

مرحبًا بكم في قسمِ التوثيقِ الشاملِ لمشروعِ **مِشكاةُ الطفلِ والآليّ** الحرِّ مفتوحِ المصدر.

> تطبيقٌ تعليميٌّ للأطفال (4–10) بفكرةٍ معكوسة: **الطفلُ يُعلّم، والآليُّ يَستنير**.
> **محلّيٌّ بالكامل · يعملُ دون اتصال · بلا ذكاءٍ اصطناعيٍّ وقتَ التشغيل · بياناتُ طفلِك لا تغادرُ جهازك.**

## 📚 ابدأْ من هنا

| الوثيقة | لماذا تقرؤها |
|---|---|
| [عن المشروع](Project-README) | نظرةٌ عامّةٌ: المبادئُ والمكوّناتُ والمحتوى والتشغيل |
| [البنية](architecture) | المرجعُ التقنيُّ الحيّ: القراراتُ والمكوّنات |
| [**دليلُ Piper TTS**](piper-tts-guide) | **بناءُ نطقٍ عصبيٍّ محلّيٍّ عربيٍّ** — الإعدادُ وخصائصُ اللغاتِ وإصلاحُ النطق |
| [نظامُ الصوتِ والنطق](audio-pronunciation) | طبقاتُ الصوتِ وترتيبُ التشكيلِ ولفظُ الجلالة |
| [**سجلُّ الحالاتِ والحلول**](pitfalls-and-solutions) | كلُّ مشكلةٍ عالجناها: العَرَض ← الجذر ← الحلّ ← الموضع |
| [**دروسٌ مستخلَصة**](lessons-learned) | خلاصةُ الحُكمِ والقرارِ عبرَ إصداراتِ المشروع |
| [تنسيقُ المحتوى](content-format) | كيف تُضيفُ ذكرياتٍ وقصصًا وألغازًا |
| [التحزيمُ والإصدار](packaging) | AppImage · DEB · RPM · APK |
| [خطّةُ الإصدارات](PLAN) | ما أُنجِزَ وما هو قادم |
| [سجلُّ التغييرات](CHANGELOG) | تفصيلُ كلِّ إصدار |
| [نسبةُ الفضلِ والرخص](CREDITS) | المصادرُ والرخص |

## 🤝 لمن هذا التوثيق؟

كتبْناه ليُفيدَ **من هو خارجَ المشروع** أيضًا:
- من يبني **نطقًا عربيًّا عصبيًّا محلّيًّا** — توثيقُه نادرٌ عمليًّا، فأفردْنا له [دليلًا كاملًا](piper-tts-guide).
- من يبني تطبيقًا **يعملُ دون إنترنتٍ** بالكامل — القراراتُ وأثمانُها في [البنية](architecture) و[الدروس](lessons-learned).
- من يواجهُ مشكلةً شبيهةً — ابحثْ في [سجلِّ الحالات](pitfalls-and-solutions) بالعَرَض.

**الرخصة:** GPL-3.0 — انسخْ واقتبسْ بحرّيّة.
HOME

# سجلُّ التغييراتِ والإقرأني من الجذرِ — يفيدانِ زائرَ الويكي
cp "$ROOT/../CHANGELOG.md" "$WORK/wiki/CHANGELOG.md" 2>/dev/null || true
cp "$ROOT/../README.md"    "$WORK/wiki/Project-README.md" 2>/dev/null || true

step "تصحيحُ الروابطِ الداخليّة (ملفّاتٌ → صفحاتُ ويكي)"
# في الويكي: [نصّ](صفحة) بلا امتداد. نحوّلُ (x.md) → (x) و(README.md) → (Home).
python3 - "$WORK/wiki" <<'PY'
import re, sys, pathlib
d = pathlib.Path(sys.argv[1])
for f in d.glob("*.md"):
    s = f.read_text(encoding="utf-8")
    s = re.sub(r"\]\((?:GT-MK/)?(?:docs/)?README(?:\.md)?\)", "](Home)", s)   # فهرسُ docs = صفحةُ Home
    s = re.sub(r"\]\(([A-Za-z0-9._-]+)\.md\)", r"](\1)", s)          # روابطُ الأشقّاء
    s = re.sub(r"\]\(GT-MK/docs/([A-Za-z0-9._-]+)\.md\)", r"](\1)", s)  # روابطُ README الجذر
    s = re.sub(r"\]\(docs/([A-Za-z0-9._-]+)\.md\)", r"](\1)", s)
    f.write_text(s, encoding="utf-8")
print("  ✅ رُوجِعت الروابط")
PY

step "بناءُ الشريطِ الجانبيّ"
cat > "$WORK/wiki/_Sidebar.md" <<'EOF'
### 🪔 مِشكاةُ الطفلِ والآليّ

**البداية**
- [الرئيسة](Home)
- [عن المشروع](Project-README)
- [سجلُّ التغييرات](CHANGELOG)

**المرجعُ التقنيّ**
- [البنية](architecture)
- [نظامُ الصوتِ والنطق](audio-pronunciation)
- [**دليلُ Piper TTS**](piper-tts-guide)
- [تنسيقُ المحتوى](content-format)
- [التحزيمُ والإصدار](packaging)

**الخبرةُ المتراكمة**
- [**سجلُّ الحالاتِ والحلول**](pitfalls-and-solutions)
- [**دروسٌ مستخلَصة**](lessons-learned)
- [خطّةُ الإصدارات](PLAN)
- [نسبةُ الفضلِ والرخص](CREDITS)
EOF

cat > "$WORK/wiki/_Footer.md" <<'EOF'
---
📖 هذا الويكي **مرآةٌ مولَّدةٌ** من `GT-MK/docs/` في المستودع — حرّرِ الملفَّ هناك ثمّ شغّلْ `bash tools/publish-wiki.sh`.
رخصةُ المشروعِ والوثائق: **GPL-3.0**.
EOF

step "الدفع"
cd "$WORK/wiki"
git add -A
if git diff --cached --quiet; then
  echo "  لا تغييرَ — الويكي محدَّثٌ سلفًا."
  exit 0
fi
git -c user.name="SalehGNUTUX" -c user.email="kharbouch.btp@gmail.com" \
    commit -q -m "توثيق: مزامنةُ الويكي مع docs/ (مولَّدٌ بـtools/publish-wiki.sh)"
git push --quiet origin HEAD
echo "  ✅ نُشِرَ إلى https://github.com/$REPO/wiki"
