import sys
from faster_whisper import WhisperModel

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="ignore")

audio_path = sys.argv[1]

model = WhisperModel("small",device="cpu", compute_type="int8")

segments, _ = model.transcribe(audio_path, language="en")

text = ""
for segment in segments:
    text += segment.text + " "

print(text.strip())