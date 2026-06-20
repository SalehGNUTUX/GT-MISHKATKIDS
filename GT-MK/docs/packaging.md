# التحزيمُ والنشر — Linux · Android · PWA

> كيف تُبنى النسخةُ الأولى وتُحزَّم وتُنشَر. اللغةُ عربيّةٌ فصحى. الملخّصُ في
> [`../CLAUDE.md`](../CLAUDE.md) (قسم «النشر والتحزيم والرخصة»). الإصدارُ في
> `package.json` (`version`)، وسجلُّ الإصدارات في [`../../CHANGELOG.md`](../../CHANGELOG.md).

## النظرةُ العامّة

أساسُ التطبيق **PWA** (Vite + vite-plugin-pwa) يُبنى إلى `dist/`. مِن نفسِ مخرجِ
`npm run build` تُشتَقُّ كلُّ صور التوزيع:

| الهدف | الأداة | المخرَج |
|---|---|---|
| الويب (الموقع + `/app`) | GitHub Actions (`.github/workflows/deploy.yml`) | GitHub Pages |
| Linux: AppImage · DEB | **electron-builder** (يَلُفُّ `dist/` في Electron) | `release/*.AppImage` · `*.deb` |
| Linux: RPM | **alien** (تحويلُ DEB → RPM) | `release/*.rpm` |
| Android: APK | **Capacitor** (`cap add/sync` + `gradlew`) | `release/*.apk` |

كلُّها **محلّيّةٌ تعمل offline**. أحجامٌ تقريبيّة: AppImage ~245م · DEB ~205م · RPM ~243م · APK ~145م
(كبيرةٌ لأنّ المقاطعَ الصوتيّةَ المُدمَجةَ ~60م + وقتُ تشغيل Electron/WebView).

## الأوامر

```bash
cd GT-MK
npm run pkg:linux        # AppImage + DEB + RPM
npm run pkg:apk          # APK أندرويد (debug، غير موقَّع)
npm run pkg:all          # الكلّ
bash scripts/build-packages.sh <هدف>   # build|icons|appimage|deb|rpm|linux|apk|all|check-deps
```

السكربتُ **`scripts/build-packages.sh`** ينسّقُ كلَّ شيء: يبني الويب، يولّد الأيقونات، يُثبّت
الأدواتِ الثقيلةَ عند الطلب، ثمّ يحزّم. المخرجاتُ كلُّها في `release/`.

## السقالة (الملفّات)

- `electron/main.cjs` — عمليّةُ Electron الرئيسيّة: نافذةٌ تُحمّل `dist/home.html` (الفهرس/المُشغِّل)، بلا قائمة، الروابطُ الخارجيّةُ في المتصفّح.
- `capacitor.config.json` — `appId: com.gnutux.gtmishkatkids`، `webDir: dist`. (مدخلُ WebView = `dist/index.html` الذي يُحوّل تلقائيًّا إلى `home.html`.)
- `package.json` → `main` + قسمُ `build` (electron-builder: appId، أهدافُ Linux، الأيقونة `build/icons`، مدخلُ سطح المكتب، `appImage/deb/rpm.artifactName`) + `homepage`/`author` (يتطلّبهما DEB/RPM).
- `scripts/build-packages.sh` — المنسّق.
- `assets/` — مصادرُ الأيقونة وشاشةِ البدء (انظر أدناه).

## الأيقوناتُ وشاشةُ البدء

المصدرُ الفنّيُّ: `public/logo-full.png` (الآليُّ والطفلُ + العنوان، **خلفيّتُه شفّافة**؛ الأخضرُ يُضاف).

- `assets/icon-background.png` — أخضرُ متدرّجٌ (radial) 1024.
- `assets/icon-foreground.png` — الشخصيّاتُ (شفّافةً) في ~74% للمنطقة الآمنة.
- `assets/icon.png` — المسطّحة (الشخصيّاتُ على الأخضر) → منها `public/icon.png` و`icon-192/512`/`apple-touch`/`maskable` و`build/icons` (electron).
- `assets/splash.png` / `splash-dark.png` — الشعارُ **الكاملُ بالعنوان** على الأخضر (2732²).

**أندرويد:** `npx @capacitor/assets generate --android` (يُستدعى داخل `build_apk` بعد `cap sync`)
يكتبُ **كلَّ المقاسات** في `android/app/src/main/res`: `mipmap-*` (أيقونةٌ متكيّفةٌ خضراء، بلا نصّ)
و`drawable-*` (شاشةُ البدء بالعنوان، فاتح/داكن، طوليّ/عرضيّ). **الأيقونةُ بلا نصّ** (مناسبةٌ للمُشغِّل)،
**والعنوانُ في شاشةِ البدء فقط**. المصدرُ `assets/` مُلتزَمٌ؛ مخرجاتُ `android/` مُولَّدةٌ (في `.gitignore`).

## مبدأُ التبعيّات (لئلّا يَثقُلَ نشرُ الويب)

- **في `package.json`:** حزمُ Capacitor الصغيرةُ (`@capacitor/core`/`cli`/`android` @^6) — لا تَنّاتٌ أصليّة، وثابتةٌ ليبقى مشروعُ `android/` قابلاً للبناء.
- **عند الطلب (`--no-save`، يُثبّتُها السكربت):** `electron`+`electron-builder` (~150م) و`@capacitor/assets` (يجرُّ `sharp` الثقيل).
- **عند الالتزام:** اجعلْ `package-lock.json` مطابقًا لـ`package.json` فقط (`npm install --package-lock-only`) فلا يتسرّبَ electron/sharp إلى `npm ci` في النشر.

## المزالقُ (مُعالَجة)

- **DEB:** electron-builder يتطلّب `homepage` في `package.json` وإلّا يفشل.
- **RPM:** `fpm` المرفقُ في electron-builder (1.9.3) **لا يوافق `rpmbuild` الحديث (4.20+)** فيفشل توليدُه؛ لذا نبني DEB ثمّ نحوّله RPM بـ`alien` (`rpm_from_deb`، يتطلّب `alien`+`fakeroot`).
- **Capacitor `--no-save` يَحذِفُ سابقَه:** `npm install --no-save @capacitor/assets` حذفَ حزمَ Capacitor المثبّتةَ سابقًا بـ`--no-save` (لأنّها غيرُ مذكورةٍ في `package.json`) فانهارَ بناءُ APK بخطأ `Could not resolve project :capacitor-android`. **الحلّ:** Capacitor في `package.json`؛ و`assets --no-save` بعده لا يَضرُّها. حافِظْ على **توافقِ إصدارات Capacitor** (`core`/`cli`/`android` نفسُ الـmajor).
- **نسخةٌ قديمةٌ زائفةُ النجاح:** `build_apk` يَحذِفُ `app-debug.apk` قبل `gradlew` لئلّا يُنسَخَ APK قديمٌ ويُبلَّغَ نجاحًا عند فشلِ gradle.
- **مسارٌ بأحرفٍ عربيّةٍ ومسافات:** يعملُ مع electron-builder/Capacitor، لكنّ بعضَ الأدوات حسّاسة — راقِبْ.

## متطلّباتُ جهاز التحزيم

`node`+`npm` · `ImageMagick (magick)` · (Linux) `electron-builder` تلقائيّ + `alien`+`fakeroot` للـrpm ·
(Android) **JDK 17+** و**Gradle** و**Android SDK** (`ANDROID_HOME`). فحصٌ: `bash scripts/build-packages.sh check-deps`.

## النشرُ على الويب (تلقائيّ)

الدفعُ إلى `main` → Actions يبني (`npm ci && npm run build` داخل `GT-MK/`, Node 20) ويجمّع
`_site/` (الموقعُ الرسميُّ على `/` + التطبيقُ على `/app/`) → Pages. **لا تَبْنِ يدويًّا للنشر؛ ادفعْ فقط**،
و**لا ترفعْ حتى يَختبرَ المستخدمُ ويقولَ «ارفع و انشر»**.

## للنشر على متاجر أندرويد

الـAPK الحاليُّ **debug غيرُ موقَّع**. لإصدارِ متجرٍ: أنشئْ keystore، ووقّعْ `assembleRelease` (AAB/APK موقَّع).
