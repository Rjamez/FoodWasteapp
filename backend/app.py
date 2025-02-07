from flask import Flask, request, jsonify
from models import User, FoodItem  # Importing models
from flask_sqlalchemy import SQLAlchemy  # Importing SQLAlchemy
from flask_cors import CORS
import jwt
import datetime
from functools import wraps
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv('CORS_ORIGIN', '*'),
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Use environment variable for secret key with a strong default
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', os.urandom(24).hex())

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Database models will replace the mock database

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
            return jsonify({'message': 'Authentication error'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    if user:
        return jsonify({'message': 'Email already registered'}), 400
    
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=data['password'],  # In production, hash the password!
        isVerified=True,
        isAdmin=False
    )
    db.session.add(new_user)
    db.session.commit()
    
    token = jwt.encode({
        'user_id': new_user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, app.config['SECRET_KEY'])
    
    return jsonify({
        'token': token,
        'user': {
            'id': new_user.id,
            'name': new_user.name,
            'email': new_user.email,
            'isVerified': new_user.isVerified,
            'isAdmin': new_user.isAdmin
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    if not user or user.password != data['password']:  # In production, verify hashed password!
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, app.config['SECRET_KEY'])
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'isVerified': user.isVerified,
            'isAdmin': user.isAdmin
        }
    })

@app.route('/api/food-items', methods=['GET'])
@token_required
def get_food_items(current_user):
    user_items = FoodItem.query.filter_by(userId=current_user['id']).all()
    return jsonify(user_items)

@app.route('/api/food-items', methods=['POST'])
@token_required
def add_food_item(current_user):
    data = request.get_json()
    if not all(k in data for k in ('name', 'quantity', 'expiryDate')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    new_item = FoodItem(
        name=data['name'],
        quantity=data['quantity'],
        expiryDate=data['expiryDate'],
        userId=current_user['id']
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item), 201

@app.route('/api/food-items/<item_id>', methods=['DELETE'])
@token_required
def delete_food_item(current_user, item_id):
    item = FoodItem.query.get(item_id)
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    if item.userId != current_user['id']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item deleted'})

@app.errorhandler(404)
def not_found(e):
    return jsonify({'message': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'message': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
