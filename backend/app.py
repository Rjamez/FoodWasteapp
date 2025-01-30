from flask import Flask, request, jsonify  
from flask_cors import CORS  
from flask_sqlalchemy import SQLAlchemy  
from flask_migrate import Migrate  
import jwt  
import datetime  
from functools import wraps  
from models import Donation, FoodItem, User, db  # Import the db object from models.py  
import logging  
from werkzeug.security import generate_password_hash, check_password_hash  # For password hashing  

# Set up logging  
logging.basicConfig(level=logging.INFO)  

app = Flask(__name__)  
CORS(app)  

# Database configuration  
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'  # Example using SQLite  
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  

# Initialize database and migration  
db.init_app(app)  # Initialize the db with the app  
migrate = Migrate(app, db)  

# This should be a secure secret key in production  
app.config['SECRET_KEY'] = 'your-secret-key'  

# Initialize the database  
with app.app_context():  
    db.create_all()  

def token_required(f):  
    @wraps(f)  
    def decorated(*args, **kwargs):  
        token = request.headers.get('Authorization')  
        if not token:  
            return jsonify({'message': 'Token is missing'}), 401  
        try:  
            token = token.split()[1]  # Remove 'Bearer ' prefix  
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])  
            current_user = User.query.get(data['user_id'])  
            if not current_user:  
                return jsonify({'message': 'User not found'}), 401  
        except jwt.ExpiredSignatureError:  
            return jsonify({'message': 'Token has expired'}), 401  
        except jwt.InvalidTokenError:  
            return jsonify({'message': 'Token is invalid'}), 401  
        return f(current_user, *args, **kwargs)  
    return decorated  

# Auth routes  
@app.route('/api/register', methods=['POST'])  
def register():  
    data = request.get_json()  
    if not all(k in data for k in ('name', 'email', 'password')):  
        return jsonify({'message': 'Missing required fields'}), 400  
    
    if User.query.filter_by(email=data['email']).first():  
        return jsonify({'message': 'Email already registered'}), 400  
    
    # Hash the password before storing  
    hashed_password = generate_password_hash(data['password'], method='sha256')  
    
    user = User(  
        name=data['name'],  
        email=data['email'],  
        password=hashed_password,  # Store hashed password  
        is_verified=True,  
        is_admin=False  
    )  
    db.session.add(user)  
    db.session.commit()  
    
    token = jwt.encode({  
        'user_id': user.id,  
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)  
    }, app.config['SECRET_KEY'])  
    
    return jsonify({  
        'token': token,  
        'user': {k: v for k, v in user.__dict__.items() if k != 'password'}  
    })  

@app.route('/api/login', methods=['POST'])  
def login():  
    data = request.get_json()  
    logging.info(f"Login attempt with data: {data}")  # Log incoming data  
    if not all(k in data for k in ('email', 'password')):  
        logging.warning("Missing required fields in login data.")  
        return jsonify({'message': 'Missing required fields'}), 400  
    
    user = User.query.filter_by(email=data['email']).first()  
    if not user or not check_password_hash(user.password, data['password']):  # Verify hashed password  
        logging.warning("Invalid credentials for email: %s", data['email'])  
        return jsonify({'message': 'Invalid credentials'}), 401  
    
    token = jwt.encode({  
        'user_id': user.id,  
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)  
    }, app.config['SECRET_KEY'])  
    
    return jsonify({  
        'token': token,  
        'user': {k: v for k, v in user.__dict__.items() if k != 'password'}  
    })  

# Food items routes  
@app.route('/api/food-items', methods=['GET', 'POST'])  
@token_required  
def food_items_route(current_user):  
    if request.method == 'GET':  
        user_items = FoodItem.query.filter_by(user_id=current_user.id).all()  
        return jsonify([item.to_dict() for item in user_items])  
    
    data = request.get_json()  
    if not all(k in data for k in ('name', 'quantity', 'expiryDate')):  
        return jsonify({'message': 'Missing required fields'}), 400  
    
    item = FoodItem(  
        name=data['name'],  
        quantity=data['quantity'],  
        expiry_date=data['expiryDate'],  
        user_id=current_user.id  
    )  
    db.session.add(item)  
    db.session.commit()  
    return jsonify(item.to_dict()), 201  

# Donations routes  
@app.route('/api/donations', methods=['GET', 'POST'])  
@token_required  
def donations_route(current_user):  
    if request.method == 'GET':  
        user_donations = Donation.query.filter_by(user_id=current_user.id).all()  
        return jsonify([d.to_dict() for d in user_donations])  
    
    data = request.get_json()  
    if not all(k in data for k in ('foodItemId',)):  
        return jsonify({'message': 'Missing required fields'}), 400  
    
    food_item = FoodItem.query.get(data['foodItemId'])  
    if not food_item:  
        return jsonify({'message': 'Food item not found'}), 404  
    if food_item.user_id != current_user.id:  
        return jsonify({'message': 'Unauthorized'}), 403  
    
    donation = Donation(  
        food_item_id=data['foodItemId'],  
        user_id=current_user.id  
    )  
    db.session.add(donation)  
    db.session.commit()  
    return jsonify(donation.to_dict()), 201  

if __name__ == '__main__':  
    app.run(debug=True)