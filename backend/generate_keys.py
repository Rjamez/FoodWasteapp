import os  

# Generate a secure secret key  
secret_key = os.urandom(24).hex()  
print(f"SECRET_KEY: {secret_key}")  

# Generate a secure JWT secret key  
jwt_secret_key = os.urandom(24).hex()  
print(f"JWT_SECRET_KEY: {jwt_secret_key}")