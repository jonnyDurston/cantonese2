from uuid import uuid4
from gtts import gTTS


def generate_cantonese_tts(cantonese: str):
    mp3_id = str(uuid4())

    # Remove any text in brackets before converting to speech
    text = cantonese.split("(", maxsplit=1)[0]

    tts = gTTS(text=text, lang="yue")
    tts.save(f"static/audio/{mp3_id}.mp3")

    return mp3_id
