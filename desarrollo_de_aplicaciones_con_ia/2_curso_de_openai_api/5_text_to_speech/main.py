from openai import OpenAI
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

with client.audio.speech.with_streaming_response.create(
    model="tts-1",
    voice="alloy",
    input="Me despierto y hay nuevos avances en tecnologia"
) as response:
    response.stream_to_file("output.mp3")