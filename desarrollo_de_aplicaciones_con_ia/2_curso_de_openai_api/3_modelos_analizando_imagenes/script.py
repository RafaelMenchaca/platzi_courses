import os 
from dotenv import load_dotenv
from openai import OpenAI
import requests
import json
import base64

load_dotenv()

api_key = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

messages = [
    {
        "role": "system",
        "content": "Eres un asistente que analiza las imagenes a gran detalle"
    },
    {
        "role": "user",
        "content": [
            {
                "type": "input_text",
                "text": "Hola, puedes analizar esta imagen?"
            },
            {
                "type": "input_image",
                "image_url": f"data:image/png;base64,{encode_image_to_base64('./image.png')}"
                
            }
        ]
    }
]

response = client.responses.create(
    model="gpt-4o",
    input=messages
)

print("Respuesta del analisis de la imagen")
print(response.output_text)