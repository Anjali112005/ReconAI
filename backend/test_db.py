from app.database import engine


try:
    with engine.connect() as connection:
        print("SUCCESS: Connected to MySQL!")

except Exception as error:
    print("ERROR: Could not connect to MySQL.")
    print(error)