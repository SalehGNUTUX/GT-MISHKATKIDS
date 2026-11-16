package com.gnutux.gtmishkatkids;

// التحديثُ من داخلِ التطبيق (أندرويد): تنزيلُ حزمةِ APK من إصدارِ GitHub ← تحقّقٌ بالبصمة ← تسليمُها لمثبِّتِ النظام.
// المصدرُ هنا في scripts/android/ (مُلتزَم)؛ build-packages.sh يَنسخُه إلى android/ المولَّدِ ويسجّلُه في MainActivity.
// الفحصُ نفسُه (قراءةُ قائمةِ الإصدارات) يجري في الواجهة (src/updater.js)؛ هذا المكوّنُ للتنزيلِ والتثبيتِ فقط.
// GNU GPL v3.

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;

@CapacitorPlugin(name = "MishkatUpdater")
public class MishkatUpdaterPlugin extends Plugin {

    private volatile boolean cancelled = false;
    private volatile boolean busy = false;

    private File updatesDir() {
        // داخلَ cacheDir: يُشاركُه FileProvider الخاصُّ بـCapacitor (cache-path ".") بلا صلاحيّةِ تخزين.
        File d = new File(getContext().getCacheDir(), "updates");
        if (!d.exists()) d.mkdirs();
        return d;
    }

    private static String sha256(File f) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        try (InputStream in = new FileInputStream(f)) {
            byte[] buf = new byte[65536];
            int n;
            while ((n = in.read(buf)) > 0) md.update(buf, 0, n);
        }
        StringBuilder sb = new StringBuilder();
        for (byte b : md.digest()) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    private void prune(String keep) {
        File[] files = updatesDir().listFiles();
        if (files == null) return;
        for (File f : files) {
            String n = f.getName();
            if (!n.equals(keep) && !n.equals(keep + ".part")) f.delete();
        }
    }

    @PluginMethod
    public void download(final PluginCall call) {
        final String url = call.getString("url", "");
        final String name = call.getString("name", "");
        final long size = call.getLong("size", 0L);
        final String sha = call.getString("sha256", "");
        // لا يُقبَلُ إلّا رابطُ إصدارٍ على github.com واسمُ ملفٍّ بلا مسار.
        if (!url.startsWith("https://github.com/") || name.isEmpty() || name.contains("/") || !name.endsWith(".apk")) {
            call.reject("حزمةٌ غيرُ صالحة");
            return;
        }
        if (busy) { call.reject("ثمّةَ تنزيلٌ جارٍ بالفعل"); return; }
        busy = true;
        cancelled = false;

        new Thread(() -> {
            File dest = new File(updatesDir(), name);
            File part = new File(updatesDir(), name + ".part");
            try {
                // منزَّلٌ سابقًا وسليم — لا يُعادُ تنزيلُه
                if (dest.exists() && (size == 0 || dest.length() == size) && (sha.isEmpty() || sha256(dest).equals(sha))) {
                    prune(name);
                    JSObject r = new JSObject(); r.put("file", dest.getAbsolutePath()); r.put("reused", true);
                    call.resolve(r);
                    return;
                }
                long from = (part.exists() && part.length() > 0 && part.length() < size) ? part.length() : 0;
                if (from == 0 && part.exists()) part.delete();

                HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                c.setInstanceFollowRedirects(true); // github.com ← objects.githubusercontent.com (https→https)
                c.setConnectTimeout(15000);
                c.setReadTimeout(30000);
                c.setRequestProperty("User-Agent", "GT-MISHKATKIDS");
                if (from > 0) c.setRequestProperty("Range", "bytes=" + from + "-");
                int code = c.getResponseCode();
                if (code != 200 && code != 206) throw new Exception("HTTP " + code);
                if (from > 0 && code != 206) from = 0; // تُجوهِلَ المدى — من الصفر

                long received = from, last = 0;
                try (InputStream in = c.getInputStream(); FileOutputStream out = new FileOutputStream(part, from > 0)) {
                    byte[] buf = new byte[65536];
                    int n;
                    while ((n = in.read(buf)) > 0) {
                        if (cancelled) { call.reject("cancelled", "CANCELLED"); return; } // الجزءُ يبقى ليُستأنَف
                        out.write(buf, 0, n);
                        received += n;
                        long now = System.currentTimeMillis();
                        if (now - last >= 250) {
                            last = now;
                            JSObject p = new JSObject();
                            p.put("received", received); p.put("total", size);
                            p.put("percent", size > 0 ? Math.min(100.0, received * 100.0 / size) : 0);
                            notifyListeners("progress", p);
                        }
                    }
                } finally { c.disconnect(); }

                if (size > 0 && part.length() != size) throw new Exception("الحجمُ لا يطابق: " + part.length() + " بدل " + size);
                if (!sha.isEmpty() && !sha256(part).equals(sha)) {
                    part.delete();
                    throw new Exception("البصمةُ لا تطابقُ المنشورة — حُذِفتِ الحزمة");
                }
                if (dest.exists()) dest.delete();
                if (!part.renameTo(dest)) throw new Exception("تعذّرَ حفظُ الحزمة");
                prune(name);
                JSObject r = new JSObject(); r.put("file", dest.getAbsolutePath());
                call.resolve(r);
            } catch (Exception e) {
                call.reject(e.getMessage() == null ? "تعذّرَ التنزيل" : e.getMessage());
            } finally {
                busy = false;
            }
        }).start();
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        cancelled = true;
        call.resolve();
    }

    // أندرويد 8+: «تثبيتُ تطبيقاتٍ غيرِ معروفة» إذنٌ لكلِّ تطبيقٍ يمنحُه المستخدمُ من الإعدادات.
    @PluginMethod
    public void canInstall(PluginCall call) {
        boolean ok = Build.VERSION.SDK_INT < Build.VERSION_CODES.O || getContext().getPackageManager().canRequestPackageInstalls();
        JSObject r = new JSObject(); r.put("allowed", ok);
        call.resolve(r);
    }

    @PluginMethod
    public void openInstallSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
        }
        call.resolve();
    }

    @PluginMethod
    public void install(PluginCall call) {
        try {
            File f = new File(call.getString("file", ""));
            // داخلَ مجلّدِ التحديثاتِ وحدَه
            if (!f.exists() || !f.getCanonicalPath().startsWith(updatesDir().getCanonicalPath() + File.separator)) {
                call.reject("الحزمةُ غيرُ موجودة");
                return;
            }
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", f);
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(uri, "application/vnd.android.package-archive");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage() == null ? "تعذّرَ فتحُ المثبِّت" : e.getMessage());
        }
    }

    @PluginMethod
    public void clear(PluginCall call) {
        File[] files = updatesDir().listFiles();
        if (files != null) for (File f : files) f.delete();
        call.resolve();
    }
}
