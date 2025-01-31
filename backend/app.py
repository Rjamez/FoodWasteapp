from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy  # Import SQLAlchemy
from flask_cors import CORS
import jwt
import datetime
from functools import wraps
import os
from dotenv import load_dotenv
from flask_migrate import Migrate  # Importing Migrate

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv('CORS_ORIGIN', 'http://localhost:5173'),
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Use environment variable for secret key
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'development-secret-key-123')

# Set the SQLAlchemy database URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'  # Example for SQLite

# Initialize SQLAlchemy
db = SQLAlchemy(app)  # Create an instance of SQLAlchemy

# Mock database (replace with a real database in production)
users = {}
food_items = {}
donations = {}

# Initialize Flask-Migrate
migrate = Migrate(app, db)  # Initialize Flask-Migrate

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            token = token.split()[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'message': str(e)}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if any(u['email'] == data['email'] for u in users.values()):
        return jsonify({'message': 'Email already registered'}), 400
    
    user_id = str(len(users) + 1)
    user = {
        'id': user_id,
        'name': data['name'],
        'email': data['email'],
        'password': data['password'],  # In production, hash the password!
        'isVerified': True,
        'isAdmin': False
    }
    users[user_id] = user
    
    token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, app.config['SECRET_KEY'])
    
    return jsonify({
        'token': token,
        'user': {k: v for k, v in user.items() if k != 'password'}
    })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    user = next((u for u in users.values() if u['email'] == data['email']), None)
    if not user or user['password'] != data['password']:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, app.config['SECRET_KEY'])
    
    return jsonify({
        'token': token,
        'user': {k: v for k, v in user.items() if k != 'password'}
    })

@app.route('/api/food-items', methods=['GET', 'POST'])
@token_required
def food_items_route(current_user):
    if request.method == 'GET':
        user_items = [item for item in food_items.values() 
                     if item['userId'] == current_user['id']]
        return jsonify(user_items)
    
    data = request.get_json()
    if not all(k in data for k in ('name', 'quantity', 'expiryDate')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    item_id = str(len(food_items) + 1)
    item = {
        'id': item_id,
        'name': data['name'],
        'quantity': data['quantity'],
        'expiryDate': data['expiryDate'],
        'userId': current_user['id']
    }
    food_items[item_id] = item
    return jsonify(item), 201

@app.route('/api/food-items/<item_id>', methods=['DELETE'])
@token_required
def delete_food_item(current_user, item_id):
    item = food_items.get(item_id)
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    if item['userId'] != current_user['id']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    del food_items[item_id]
    return '', 204

@app.route('/api/donations', methods=['GET', 'POST'])
@token_required
def donations_route(current_user):
    if request.method == 'GET':
        user_donations = [d for d in donations.values() 
                         if d['userId'] == current_user['id']]
        return jsonify(user_donations)
    
    data = request.get_json()
    if not all(k in data for k in ('foodItemId',)):
        return jsonify({'message': 'Missing required fields'}), 400
    
    food_item = food_items.get(data['foodItemId'])
    if not food_item:
        return jsonify({'message': 'Food item not found'}), 404
    if food_item['userId'] != current_user['id']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    donation_id = str(len(donations) + 1)
    donation = {
        'id': donation_id,
        'foodItemId': data['foodItemId'],
        'userId': current_user['id'],
        'donationDate': datetime.datetime.utcnow().isoformat()
    }
    donations[donation_id] = donation
    return jsonify(donation), 201

if __name__ == '__main__':
    app.run(debug=True)
