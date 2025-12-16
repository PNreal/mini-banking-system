from datetime import datetime
from bank import db, login_manager
from flask_login import UserMixin
import secrets

def generate_otp():
    return secrets.randbelow(900000000) + 100000000


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer,primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    image_file = db.Column(db.String(20), nullable=False, default='default.jpg')
    password = db.Column(db.String(60),nullable=False)
    user_id = db.Column(db.Integer, nullable=False, default=generate_otp,unique=True)
    balance = db.Column(db.Integer, nullable=False,default=0)
    posts = db.relationship('Post',backref='author',lazy=True)
    is_frozen = db.Column(db.Boolean, nullable=False,default=False)
    is_admin = db.Column(db.Boolean,nullable=False,default=False)

    def __repr__(self):
        return f"User('{self.username}','{self.email}','{self.image_file}','{self.user_id}','{self.is_frozen}','{self.is_admin}')"
    
class Post(db.Model): 
    id = db.Column(db.Integer,primary_key=True)
    title = db.Column(db.String(100),nullable=False)
    date = db.Column(db.DateTime, nullable=False,default = datetime.utcnow)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),nullable=False)

    def __repr__(self):
        return f"Post('{self.title}','{self.date}'"