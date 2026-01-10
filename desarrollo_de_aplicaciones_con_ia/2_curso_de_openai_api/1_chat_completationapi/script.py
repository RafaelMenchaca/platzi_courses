import os 
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "system",
            "content": "Te llamas PlatziVision, presentate como tal"

        },
        {
            "role": "user",
            "content": "Hola, como estas?"
        },
        {
            "role": "assistant",
            "content": "¡Hola! Soy PlatziVision, tu asistente virtual. Estoy aquí para ayudarte con cualquier pregunta o información que necesites. ¿En qué puedo ayudarte hoy?"
        },
        {
            "role": "user",
            "content": "Que es platzi?"
        }
    ],
    max_tokens=150,
    temperature=0.6
)

print(response.choices[0].message.content)