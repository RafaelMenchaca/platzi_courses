import openai
import random

openai.api_key = "su_api_key_aqui"

# response = openai.chat.completions.create(
#     model= "gpt-3.5-turbo",
#     messages = [
#       {
#         "role": "developer",
#         "content": "You are a helpful assistant."
#       },
#       {
#         "role": "user",
#         "content": "Hello!"
#       }
#     ],
# )

def get_clue():
    words = ["elefante", "leon", "jirafa", "hipopotamo", "mono"]
    random_word = random.choice(words)
    prompt = "adivina la palabra que estoy pensando. Es un animal que vive en la selva"
    return prompt, random_word

def check_answer(user_input, answer):
    if user_input == answer:
        return True
    return False

def give_propety(animal):
    response = openai.chat.completions.create(
        model= "gpt-4",
        messages= [
            {
                "role": "user",
                "content": f"Dame una característica o propiedad del {animal}, pero no digas el nombre del animal."
            }
        ],
        max_tokens=100,
    )
    return response.choices[0].message.content

def play_game():
    prompt, answer = get_clue()
    print("Adivina el animal que estoy pensando.")
    attempts = 3

    while attempts > 0:
        user_input = input(f"Tienes {attempts} intentos restantes. Ingresa tu respuesta: ")

        if check_answer(user_input.lower(), answer):
            print("¡Felicidades! Has adivinado el animal correctamente.")
            return
        else:
            attempts -= 1
            if attempts > 0:
                clue = give_propety(answer)
                print(f"Incorrecto. Aquí tienes una pista: {clue}")
            else:
                print(f"Lo siento, has agotado tus intentos. El animal era: {answer}")