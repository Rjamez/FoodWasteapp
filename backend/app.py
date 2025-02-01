from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
import jwt
import datetime
from functools import wraps
import os
from dotenv import load_dotenv
from models import db, FoodItem, User  # Import models

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Flask mail configuration
app.config["MAIL_SERVER"] = 'smtp.gmail.com'
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USE_SSL"] = False
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")  # Use environment variable
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")  # Use environment variable
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER")  # Use environment variable

mail = Mail(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")  # Use environment variable
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(minutes=5)

jwt = JWTManager(app)

CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv('CORS_ORIGIN', '*'),
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize database and migration
db.init_app(app)  # Initialize db with the app
migrate = Migrate(app, db)

# Use environment variable for secret key with a strong default
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', os.urandom(24).hex())

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            token = token.split()[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])  # Use User model
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

@app.errorhandler(404)
def not_found(e):
    return jsonify({'message': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/food-items', methods=['GET'])
def get_food_items():
    items = FoodItem.query.all()
    return jsonify([{'id': item.id, 'name': item.name, 'quantity': item.quantity, 'expiry_date': item.expiry_date} for item in items]), 200

@app.route('/api/food-items', methods=['POST'])
def add_food_item():
    new_item = request.json
    if 'name' not in new_item or 'quantity' not in new_item or 'expiry_date' not in new_item:
        return jsonify({'message': 'Missing required fields: name, quantity, expiry_date'}), 400
    food_item = FoodItem(name=new_item['name'], quantity=new_item['quantity'], expiry_date=new_item['expiry_date'])
    db.session.add(food_item)
    db.session.commit()
    return jsonify({'id': food_item.id, 'name': food_item.name, 'quantity': food_item.quantity, 'expiry_date': food_item.expiry_date}), 201

@app.route('/api/food-items/<int:item_id>', methods=['DELETE'])
def delete_food_item(item_id):
    food_item = FoodItem.query.get(item_id)
    if food_item:
        db.session.delete(food_item)
        db.session.commit()
        return jsonify({'message': 'Item deleted'}), 200
    return jsonify({'message': 'Item not found'}), 404

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
