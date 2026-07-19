# tools/piper_synth.py — توليد مقاطع صوتٍ عربيّة بمحرّك Piper العصبيّ (يُحمَّل النموذج مرّةً واحدة).
# يُستدعى من gen-audio.mjs:  python piper_synth.py <tasks.json> <manifest_out.json> <model.onnx>
#   tasks.json : [{"key": "<النصّ الأصليّ>", "text": "<المنطوق>", "out": "<مسار mp3>", "file": "<hash>.mp3"}, ...]
# يكتب المانيفست (نصّ → ملفّ) للمقاطع الناجحة فقط، كي لا يُحال إلى ملفٍّ مفقود (= صمت).
# محلّيٌّ بالكامل دون إنترنت. يتطلّب: piper-tts + imageio-ffmpeg.
import sys, json, os, wave, tempfile, subprocess
from piper import PiperVoice
import imageio_ffmpeg


def main():
    tasks_path, manifest_path, model_path = sys.argv[1], sys.argv[2], sys.argv[3]
    # معامِلٌ اختياريّ رابع: رقمُ المتحدّث (للنماذج متعدّدة الأصوات كـfr_FR-upmc). فارغٌ/غائب = الافتراضيّ.
    speaker = int(sys.argv[4]) if len(sys.argv) > 4 and str(sys.argv[4]).strip() != "" else None
    syn = None
    if speaker is not None:
        try:
            from piper import SynthesisConfig
            syn = SynthesisConfig(speaker_id=speaker)
        except Exception:  # noqa: BLE001
            syn = None
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    voice = PiperVoice.load(model_path)
    # نصوصُنا مُشكَّلةٌ مسبقًا؛ نُعطّل طبقةَ التشكيل الآليّ (libtashkeel) تفاديًا لإعادة التشكيل وللتنزيل.
    try:
        voice.use_tashkeel = False
    except Exception:  # noqa: BLE001
        pass
    with open(tasks_path, encoding="utf-8") as f:
        tasks = json.load(f)

    manifest, ok, fail, skip = {}, 0, 0, 0
    total = len(tasks)
    # تخطّي المقاطعِ الموجودةِ سلفًا: التوليدُ تفاضليٌّ فلا يُعادُ بناءُ الألفِ لأجلِ عبارةٍ جديدة.
    # (المفتاحُ = نصُّ العبارةِ نفسُه، فتغييرُ النصِّ يُنتِجُ ملفًّا جديدًا تلقائيًّا.)
    # FORCE=1 يُعيدُ توليدَ كلِّ شيءٍ عند الحاجةِ (تغييرُ النموذجِ أو إعداداتِ التركيب).
    force = os.environ.get("PIPER_FORCE") == "1"
    for i, t in enumerate(tasks):
        key, text, out, file = t["key"], t["text"], t["out"], t["file"]
        if not force and os.path.exists(out) and os.path.getsize(out) > 0:
            manifest[key] = file
            skip += 1
            continue
        wav_path = None
        try:
            fd, wav_path = tempfile.mkstemp(suffix=".wav")
            os.close(fd)
            with wave.open(wav_path, "wb") as wf:
                voice.synthesize_wav(text, wf, syn_config=syn)
            subprocess.run(
                [ffmpeg, "-y", "-loglevel", "error", "-i", wav_path,
                 "-codec:a", "libmp3lame", "-q:a", "6", out],
                check=True,
            )
            manifest[key] = file
            ok += 1
        except Exception as e:  # noqa: BLE001
            fail += 1
            sys.stderr.write(f"FAIL: {key} :: {e}\n")
        finally:
            if wav_path and os.path.exists(wav_path):
                try:
                    os.unlink(wav_path)
                except OSError:
                    pass
        if (i + 1) % 40 == 0:
            print(f"... {i + 1}/{total}", flush=True)

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, separators=(",", ":"))
    print(f"✅ {ok} مقطعًا جديدًا · {skip} موجودًا (تُخُطِّي) · {fail} فشل -> {manifest_path}")
    sys.exit(0 if (ok + skip) > 0 and fail == 0 else 1)


if __name__ == "__main__":
    main()
