from openai import OpenAI
import requests
import json
import os
from dotenv import load_dotenv
import time

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

assistant_id = "your-assistant-id-here"  # Reemplaza con tu assistant_id
thread = client.beta.threads.create()

print(f"Thread created with ID: {thread.id}")

message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="Cuanto es 16284+991893-771939*12456? puedes ejecutar codigo python para solucionar esto",
)

print("Message sent to assistant.")
run = client.beta.threads.runs.create(
    thread_id=thread.id,
    assistant_id=assistant_id,
)

while True:
    run = client.beta.threads.runs.retrieve(
        thread_id=thread.id,
        run_id=run.id,
        )
    
    if run.status == "completed":
        print("se completo la respuesta")
        break
    time.sleep(1)

if run.status == "completed":
    run_steps = client.beta.threads.runs.steps.list(
        thread_id=thread.id,
        run_id=run.id,
    )

    for step in run_steps:
        if step.step_details.type == "tool_calls":
            for tool_call in step.step_details.tool_calls:
                if tool_call.type == "code_interpreter":
                    print("Output from Python tool:")
                    print(tool_call.code_interpreter.input)

    messages = client.beta.threads.messages.list(
        thread_id=thread.id,
        order="desc",
        limit=1
    )

    for msg in messages:
        if msg.role == "assistant":
            for content_block in msg.content:
                print(content_block.text.value)
