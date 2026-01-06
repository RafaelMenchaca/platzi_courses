import openai
import APIkey

# Clave API
openai.api_key = APIkey.apikey

# Modelo
model = "gpt-4o-mini"

response = openai.chat.completions.create(
    model=model,
    messages=[
        {"role": "system", "content": "Eres un asistente que da informacion a dudas"},
        {"role": "user", "content": "¿Quién es Katherine Johnson?"}
    ],
    temperature = 0.9,
    max_tokens = 100,
    top_p = 1,
    n = 1,
    stream = True
)

for chunk in response:
    # print(chunk)
    choices = chunk.choices
    if choices:
        delta = choices[0].delta
        if delta.content:
            print(delta.content, end='', flush=True)  # Imprimir en tiempo real