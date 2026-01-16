from app import create_app
import os

app = create_app()

@app.route('/')
def index():
    return "Welcome to the Platzi Vision API! Backend is running."

if __name__ == '__main__':
    app.run(debug=True)
