#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  مِشكاةُ الطفلِ والآليّ (GT-MISHKATKIDS) — سكربتُ البناء والتحزيم
#  يبني: AppImage · DEB · RPM (عبر electron-builder) · APK أندرويد (عبر Capacitor)
#  مُقتبَسٌ من نهج GT-MARKDAWIN-v3.0. المطوّر: SalehGNUTUX — GNU GPL v3.
#
#  الاستعمال: ./scripts/build-packages.sh [هدف]
#    all | linux | appimage | deb | rpm | apk | build | icons | check-deps
# ══════════════════════════════════════════════════════════════════════════════
set -uo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
DIST="$ROOT/dist"
RELEASE="$ROOT/release"
ICONS="$ROOT/build/icons"
ICON_SRC="$ROOT/public/icon.png"
ANDROID="$ROOT/android"
APP_NAME="gt-mishkatkids"
VERSION="$(node -pe "require('./package.json').version" 2>/dev/null || echo 1.0.0)"
TARGET="${1:-all}"
mkdir -p "$RELEASE"

if [ -t 1 ]; then GRN='\033[0;32m'; RED='\033[0;31m'; YLW='\033[1;33m'; CYN='\033[0;36m'; NC='\033[0m'; else GRN=''; RED=''; YLW=''; CYN=''; NC=''; fi
step(){ echo -e "${CYN}▶ $*${NC}"; }
ok(){ echo -e "${GRN}  ✅ $*${NC}"; }
err(){ echo -e "${RED}  ❌ $*${NC}"; }
wrn(){ echo -e "${YLW}  ⚠ $*${NC}"; }

gen_icons() {
  step "توليدُ مقاسات الأيقونة من $ICON_SRC"
  [ -f "$ICON_SRC" ] || { err "أيقونةُ المصدر غير موجودة: public/icon.png"; return 1; }
  command -v magick >/dev/null || { err "ImageMagick (magick) مطلوب"; return 1; }
  mkdir -p "$ICONS"
  for s in 16 32 48 64 128 256 512; do magick "$ICON_SRC" -resize ${s}x${s} "$ICONS/${s}x${s}.png"; done
  cp "$ICONS/512x512.png" "$ROOT/build/icon.png"
  ok "أيقوناتٌ في build/icons/ (16…512)"
}

do_build() {
  step "بناءُ تطبيق الويب (Vite)"
  npm run build 2>&1 | grep -E "(✓|error|built in|precache)" || true
  [ -d "$DIST" ] || { err "فشلَ البناء — لا dist/"; exit 1; }
  ok "dist/ جاهز"
}

ensure_eb() {
  if [ ! -d "$ROOT/node_modules/electron-builder" ]; then
    step "تثبيتُ electron + electron-builder (مرّةً واحدة، --no-save لإبقاء نشرِ الويب خفيفًا)"
    npm install --no-save electron@^33 electron-builder@^25 || { err "فشل التثبيت"; exit 1; }
  fi
}

build_linux() { # $1 = أهداف electron-builder (مثل: "AppImage deb rpm")
  ensure_eb; gen_icons
  step "electron-builder → $1"
  local args=""; for t in $1; do args="$args --linux $t"; done
  npx electron-builder $args 2>&1 | tail -20
  cp "$ROOT"/release/*.AppImage "$ROOT"/release/*.deb "$ROOT"/release/*.rpm "$RELEASE"/ 2>/dev/null || true
  ls -1 "$RELEASE" 2>/dev/null | grep -iE "appimage|\.deb|\.rpm" && ok "حزمُ لينكس في release/" || wrn "راجِعْ مخرجَ electron-builder"
}

# rpm: fpm المرفقُ في electron-builder (1.9.3) لا يوافق rpmbuild الحديث (4.20+)، فنحوّلُ الـdeb العاملَ
# إلى rpm عبر alien — أوثقُ على الأنظمة الحديثة.
# يحقن ملفَّ الرخصة (Debian copyright) ووصفَ AppStream في الـdeb (يقرؤهما مديرُ البرامج لعرض الرخصة).
# يُستدعى قبل rpm_from_deb فيرثُهما الـrpm عبر alien أيضًا.
inject_deb_metadata() {
  command -v dpkg-deb >/dev/null || { wrn "dpkg-deb غير متوفّر — تُخطّى إضافةُ الرخصة/الوصف"; return 0; }
  local deb; deb="$(ls -1 "$RELEASE"/*"-$VERSION-"*.deb 2>/dev/null | head -1)"
  [ -f "$deb" ] || return 0
  step "إضافةُ الرخصة (copyright) ووصفِ AppStream إلى $(basename "$deb")"
  local tmp; tmp="$(mktemp -d)"
  if dpkg-deb -R "$deb" "$tmp" >/dev/null 2>&1; then
    mkdir -p "$tmp/usr/share/metainfo" "$tmp/usr/share/doc/tilmithi"
    cp "$ROOT/scripts/com.gnutux.gtmishkatkids.metainfo.xml" "$tmp/usr/share/metainfo/com.gnutux.gtmishkatkids.metainfo.xml"
    cp "$ROOT/scripts/deb-copyright" "$tmp/usr/share/doc/tilmithi/copyright"
    # نُلحِقُ مجاميعَ الملفّين الجديدين بـmd5sums القائم (لا نعيدُ توليدَه كي لا تُفقَدَ مداخلُ /opt).
    ( cd "$tmp" && md5sum usr/share/metainfo/com.gnutux.gtmishkatkids.metainfo.xml usr/share/doc/tilmithi/copyright >> DEBIAN/md5sums 2>/dev/null )
    dpkg-deb -b "$tmp" "$deb" >/dev/null 2>&1 && ok "أُضيفت الرخصةُ ووصفُ AppStream" || err "تعذّر إعادةُ بناء الـdeb"
  else err "تعذّر فكُّ الـdeb لإضافة الرخصة"; fi
  rm -rf "$tmp"
}

rpm_from_deb() {
  command -v alien >/dev/null || { wrn "alien غير متوفّر — تُخطّى rpm (مستخدمو rpm يمكنهم AppImage)"; return 0; }
  # نختارُ deb الإصدارِ الحاليّ تحديدًا (لا أوّلَ نتيجةٍ أبجديّة، فقد تبقى حزمُ إصداراتٍ سابقةٍ في release/).
  local deb; deb="$(ls -1 "$RELEASE"/*"-$VERSION-"*.deb 2>/dev/null | head -1)"
  [ -n "$deb" ] || deb="$(ls -t "$RELEASE"/*.deb 2>/dev/null | head -1)"   # احتياط: الأحدث
  [ -n "$deb" ] || { err "لا deb لتحويله إلى rpm"; return 1; }
  local base; base="$(basename "$deb")"
  step "تحويلُ deb→rpm عبر alien ($base)"
  ( cd "$RELEASE" && fakeroot alien --to-rpm --scripts "$base" >/dev/null 2>&1 )
  # alien يُسمّي المُخرَجَ باسم الحزمة الداخليّ (tilmithi)؛ نُعيدُ تسميتَه ليُطابقَ AppImage/deb.
  local out; out="$(ls -t "$RELEASE"/tilmithi-*.rpm 2>/dev/null | head -1)"
  local want="$RELEASE/${base%%-$VERSION-*}-${VERSION}-x86_64.rpm"
  if [ -n "$out" ] && [ -f "$out" ]; then mv -f "$out" "$want"; ok "rpm في release/$(basename "$want")"
  else ls -1 "$RELEASE"/*.rpm >/dev/null 2>&1 && ok "rpm في release/" || err "فشل توليد rpm"; fi
}

# يُعيدُ توليدَ أيقونات أندرويد من الشعار الكامل بالعنوان (assets/icon.png = الشعارُ على الأخضر، محشوٌّ ضمن المنطقة الآمنة):
# @capacitor/assets يولّدُها بأحجامٍ صغيرة (≤192px) ويملأُ الإطارَ فتبدو رديئةً وتَقُصُّها أقنعةُ أندرويد. وبطلب المستخدم: الأيقونةُ = الشعارُ الكاملُ بالنصّ دون اجتزاء.
fix_android_icons() {
  command -v magick >/dev/null || { wrn "ImageMagick مطلوب لضبط الأيقونات — تُخطّى"; return 0; }
  local res="$ANDROID/app/src/main/res" MASTER="$ROOT/assets/icon.png"
  [ -f "$MASTER" ] || return 0
  step "ضبطُ أيقونات أندرويد: الشعارُ الكاملُ بالعنوان بدقّةٍ عالية في كلّ الكثافات (دون اجتزاء)"
  local dens="ldpi mdpi hdpi xhdpi xxhdpi xxxhdpi" fgsz="81 108 162 216 324 432" lasz="36 48 72 96 144 192" i=1
  for d in $dens; do
    local dir="$res/mipmap-$d"
    local f l; f="$(echo $fgsz | cut -d' ' -f$i)"; l="$(echo $lasz | cut -d' ' -f$i)"; i=$((i+1))
    [ -d "$dir" ] || continue
    magick "$MASTER" -resize ${f}x${f} "$dir/ic_launcher_foreground.png"        # واجهةٌ تكيّفيّة (الشعارُ الكاملُ على الأخضر)
    magick "$MASTER" -resize ${l}x${l} "$dir/ic_launcher.png"                    # قديمةٌ مربّعة
    magick "$MASTER" -resize ${l}x${l} \
      \( -size ${l}x${l} xc:none -fill white -draw "circle $((l/2)),$((l/2)) $((l/2)),0" \) -alpha set -compose DstIn -composite "$dir/ic_launcher_round.png"  # قديمةٌ دائريّة
  done
  ok "أُعيد توليدُ أيقونات أندرويد بالشعار الكامل بالعنوان"
}

build_apk() {
  step "تحزيمُ أندرويد (Capacitor)"
  # Capacitor (core/cli/android) في package.json — يُثبَّت عاديًّا. (assets ثقيلٌ بـsharp → عند الطلب فقط.)
  [ -d "$ROOT/node_modules/@capacitor/android" ] || { step "تثبيتُ تبعيّات Capacitor"; npm install || { err "فشل npm install"; exit 1; }; }
  do_build
  [ -d "$ANDROID" ] || { step "إنشاءُ مشروع أندرويد"; npx cap add android || { err "cap add android فشل"; exit 1; }; }
  npx cap sync android 2>&1 | tail -8
  # أيقوناتُ التطبيقِ وشاشةُ البدء من assets/ → كلّ مجلّدات res. (assets --no-save لا يَحذِفُ تبعيّاتِ package.json.)
  if [ -f "$ROOT/assets/icon.png" ]; then
    [ -d "$ROOT/node_modules/@capacitor/assets" ] || npm install --no-save @capacitor/assets@^3 >/dev/null 2>&1
    step "توليدُ أيقونات أندرويد وشاشةِ البدء (@capacitor/assets)"
    npx @capacitor/assets generate --android --iconBackgroundColor '#39562a' --iconBackgroundColorDark '#1d3214' --splashBackgroundColor '#39562a' --splashBackgroundColorDark '#1d3214' 2>&1 | tail -3
    fix_android_icons   # يُصحّحُ ما يُفسدُه @capacitor/assets: واجهةٌ بدقّةٍ عالية ومحشوّةٌ بدل أحجامٍ صغيرةٍ مملوءةٍ تَقُصُّها الأقنعة
  fi
  # صلاحيةُ الميكروفون (تسجيلُ نُطق الطفل) — تُضاف للـmanifest المُولَّد إن غابت (android/ مُولَّدٌ فيُعاد كلَّ بناء).
  local mani="$ANDROID/app/src/main/AndroidManifest.xml"
  if [ -f "$mani" ] && ! grep -q "RECORD_AUDIO" "$mani"; then
    sed -i 's#<application#<uses-permission android:name="android.permission.RECORD_AUDIO" />\n    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />\n\n    <application#' "$mani"
    step "أُضيفت صلاحيّةُ RECORD_AUDIO إلى AndroidManifest"
  fi
  # صلاحيّةُ الموقعِ (اتجاهُ القِبلةِ في البوصلةِ الحقيقيّة) — تُحسَبُ محلّيًّا على الجهازِ ولا تُرسَلُ لأيِّ جهة.
  if [ -f "$mani" ] && ! grep -q "ACCESS_COARSE_LOCATION" "$mani"; then
    sed -i 's#<application#<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />\n    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n\n    <application#' "$mani"
    step "أُضيفت صلاحيّةُ الموقعِ (اتجاهُ القبلة) إلى AndroidManifest"
  fi
  # فتحُ ملفّاتِ .json بتطبيقنا (استيرادُ النسخةِ الاحتياطيّة): intent-filter للـVIEW على application/json في النشاطِ الرئيس.
  if [ -f "$mani" ] && ! grep -q 'android:mimeType="application/json"' "$mani"; then
    sed -i '0,/<\/intent-filter>/s|</intent-filter>|</intent-filter>\n            <intent-filter>\n                <action android:name="android.intent.action.VIEW" />\n                <category android:name="android.intent.category.DEFAULT" />\n                <category android:name="android.intent.category.BROWSABLE" />\n                <data android:mimeType="application/json" />\n            </intent-filter>|' "$mani"
    step "أُضيف intent-filter لاستقبالِ ملفّاتِ JSON (فتحُ النسخةِ الاحتياطيّة)"
  fi
  [ -n "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" ] || wrn "ANDROID_HOME غير مضبوط — قد يفشل gradlew"
  local apk="$ANDROID/app/build/outputs/apk/debug/app-debug.apk"
  rm -f "$apk"  # لئلّا يُنسَخَ APK قديمٌ إن فشل البناء
  ( cd "$ANDROID" && chmod +x gradlew && ./gradlew assembleDebug 2>&1 | tail -12 )
  [ -f "$apk" ] && { cp "$apk" "$RELEASE/$APP_NAME-$VERSION-debug.apk"; ok "APK في release/$APP_NAME-$VERSION-debug.apk"; } || { err "لم يُنتَج APK"; return 1; }
}

check_deps() {
  step "فحصُ المتطلبات"
  for t in node npm npx magick java gradle; do command -v "$t" >/dev/null && echo "  ✓ $t" || echo "  ✗ $t"; done
  echo "  ANDROID_HOME=${ANDROID_HOME:-${ANDROID_SDK_ROOT:-<unset>}}"
}

echo -e "${CYN}مِشكاةُ الطفلِ والآليّ — تحزيمٌ v$VERSION — الهدف: $TARGET${NC}"
case "$TARGET" in
  build)     do_build ;;
  icons)     gen_icons ;;
  appimage)  do_build; build_linux "AppImage" ;;
  deb)       do_build; build_linux "deb"; inject_deb_metadata ;;
  rpm)       do_build; build_linux "deb"; inject_deb_metadata; rpm_from_deb ;;
  linux)     do_build; build_linux "AppImage deb"; inject_deb_metadata; rpm_from_deb ;;
  apk)       build_apk ;;
  all)       do_build; build_linux "AppImage deb"; inject_deb_metadata; rpm_from_deb; build_apk ;;
  check-deps) check_deps ;;
  *) err "هدفٌ غير معروف: $TARGET"; exit 1 ;;
esac
echo -e "${GRN}انتهى. المخرجاتُ في: release/${NC}"
