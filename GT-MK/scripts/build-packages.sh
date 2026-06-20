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

build_apk() {
  step "تحزيمُ أندرويد (Capacitor)"
  if [ ! -d "$ROOT/node_modules/@capacitor/cli" ]; then
    step "تثبيتُ Capacitor (مرّةً واحدة، --no-save)"
    npm install --no-save @capacitor/cli@^6 @capacitor/core@^6 @capacitor/android@^6 || { err "فشل تثبيت Capacitor"; exit 1; }
  fi
  do_build
  [ -d "$ANDROID" ] || { step "إنشاءُ مشروع أندرويد"; npx cap add android || { err "cap add android فشل"; exit 1; }; }
  npx cap sync android 2>&1 | tail -8
  [ -n "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" ] || wrn "ANDROID_HOME غير مضبوط — قد يفشل gradlew"
  ( cd "$ANDROID" && chmod +x gradlew && ./gradlew assembleDebug 2>&1 | tail -12 )
  local apk="$ANDROID/app/build/outputs/apk/debug/app-debug.apk"
  [ -f "$apk" ] && { cp "$apk" "$RELEASE/$APP_NAME-$VERSION-debug.apk"; ok "APK في release/$APP_NAME-$VERSION-debug.apk"; } || err "لم يُنتَج APK"
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
  deb)       do_build; build_linux "deb" ;;
  rpm)       do_build; build_linux "rpm" ;;
  linux)     do_build; build_linux "AppImage deb rpm" ;;
  apk)       build_apk ;;
  all)       do_build; build_linux "AppImage deb rpm"; build_apk ;;
  check-deps) check_deps ;;
  *) err "هدفٌ غير معروف: $TARGET"; exit 1 ;;
esac
echo -e "${GRN}انتهى. المخرجاتُ في: release/${NC}"
