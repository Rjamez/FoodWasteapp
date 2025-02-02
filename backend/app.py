import os  
import datetime  
from flask import Flask, request, jsonify  
from flask_cors import CORS  
from flask_jwt_extended import JWTManager  
from flask_sqlalchemy import SQLAlchemy  
from flask_migrate import Migrate  
from flask_mail import Mail  
from dotenv import load_dotenv  # For loading environment variables  
from functools import wraps  

# Load environment variables  
load_dotenv()  

app = Flask(__name__)  

# Configuration  
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')  # Use DATABASE_URI from .env  
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  
app.config["JWT_SECRET_KEY"] = os.getenv("a7551d6ef74dde57eb7b5096f98b5edb832a9b9442d79152")  # JWT secret key  
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(minutes=5)  
app.config['SECRET_KEY'] = os.getenv('28ae0b4b4307ec7ef2e32da779538e26f4bb3046f20b48c1')  # Flask secret key  
app.config["MAIL_SERVER"] = 'smtp.gmail.com'  
app.config["MAIL_PORT"] = 587  
app.config["MAIL_USE_TLS"] = True  
app.config["MAIL_USE_SSL"] = False  
app.config["MAIL_USERNAME"] = os.getenv("robin.adhola@student.moringaschool.com")  # Email username  
app.config["MAIL_PASSWORD"] = os.getenv("sqdb dysz pous crhy")  # Email password  
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("robin.adhola@student.moringaschool.com")  # Default sender email  

# Initialize extensions  
db = SQLAlchemy(app)  
migrate = Migrate(app, db)  
jwt = JWTManager(app)  
mail = Mail(app)  

# CORS setup  
CORS(app, resources={  
    r"/api/*": {  
        "origins": os.getenv("CORS_ORIGIN"),  # Allowed origins  
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],  
        "allow_headers": ["Content-Type", "Authorization"]  
    }  
})  

def token_required(f):  
    @wraps(f)  
    def decorated(*args, **kwargs):  
        token = request.headers.get('Authorization')  
        if not token:  
            return jsonify({'message': 'Token is missing'}), 401  
        try:  
            token = token.split()[1]  # Remove 'Bearer ' prefix  
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=["HS256"])  
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
    print(f"Received data: {new_item}")  # Debug log for received data  
    
    if 'name' not in new_item or 'quantity' not in new_item or 'expiry_date' not in new_item:  
        return jsonify({'message': 'Missing required fields: name, quantity, expiry_date'}), 400  
    
    food_item = FoodItem(name=new_item['name'], quantity=new_item['quantity'], expiry_date=new_item['expiry_date'])  
    try:  
        db.session.add(food_item)  
        db.session.commit()  
    except Exception as e:  
        db.session.rollback()  # Rollback in case of error  
        return jsonify({'message': 'Error adding food item', 'error': str(e)}), 500  
    
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
    port = int(os.getenv('PORT', 5000))  # Use PORT from environment or default to 5000  
    app.run(host='0.0.0.0', port=port)