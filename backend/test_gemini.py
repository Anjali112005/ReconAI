import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("API key found:", bool(api_key))

if not api_key:
    print("ERROR: GEMINI_API_KEY was not found.")
    raise SystemExit()

client = genai.Client(
    api_key=api_key
)

try:
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents="Say hello in one short sentence."
    )

    print("\nGemini response:")
    print(response.text)

except Exception as error:
    print("\nGemini error:")
    print(error)