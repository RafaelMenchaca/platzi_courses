from openai import OpenAI
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

audio_file = open("output.mp3", "rb")

transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
)

print("Transcripted Text:")
print(transcript.text)