import os 
from dotenv import load_dotenv
from openai import OpenAI
import requests
import json

load_dotenv()

api_key = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)


def get_weather(latitude: float, longitude: float) -> str:
    print("Geting Weather...")
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true"
    response = requests.get(url)
    weather_data = response.json()

    return json.dumps(weather_data)

messages = [
    {
        "role": "system",
        "content": "Eres un asistente que entrega datos del clima del mundo en tiempo real puedes usar la funcion get_weather"
    },
    {
        "role": "user",
        "content": "Cual es el clima de Buenos Aires"
    }
]

functions = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Usa esta funcion para obtener informacion sobre el clima",
            "parameters": {
                "type": "object",
                "properties": {
                    "latitude": {"type": "number", "description": "latitud de la ubicacion"},
                    "longitude": {"type": "number", "description": "longitud de la ubicacion"}
                },
                "required": ["latitude", "longitude"]

            },
            "output": {
                "type": "string",
                "description": "Clima de la ubicacion pedida por el usuario"
            },
        }
    }
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=functions
)

assistant_message = response.choices[0].message

print("Respuesta del assistente")
print(assistant_message)

if assistant_message.tool_calls:
    for tool_call in assistant_message.tool_calls:
        if tool_call.type == "function":
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)
            print("El asistente esta llamando  la funcion get_weather")

            if function_name == "get_weather":
                weather_info = get_weather(
                    latitude=function_args.get("latitude"),
                    longitude=function_args.get("longitude")
                )

                messages.append(assistant_message)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": function_name,
                    "content": weather_info
                })

second_response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages
)

final_reply = second_response.choices[0].message.content

print("Respuesta final del asistente")
print(final_reply)

