from flask_wtf import FlaskForm
from flask_wtf.file import FileField,FileAllowed
from flask_login import current_user
from wtforms import StringField, PasswordField, SubmitField,BooleanField, IntegerField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError, NumberRange
from bank.models import User

class RegistrationForm(FlaskForm):
    username = StringField('Username', 
                           validators=[DataRequired(),Length(min=2,max=15)])
    
    email = StringField('Email',validators=[DataRequired(), Email()])

    password = PasswordField('Password', validators=[DataRequired()])

    confirm_password = PasswordField('Confirm Password', 
                                     validators=[DataRequired(),EqualTo('password')])
    
    submit = SubmitField('Đăng Kí')
    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('Username đã được sử dụng')
        
    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email đã được sử dụng')

class LoginForm(FlaskForm):
    email = StringField('Email',validators=[DataRequired(), Email()])

    password = PasswordField('Password', validators=[DataRequired()])

    remember = BooleanField('Remember Me')
    
    submit = SubmitField('Login')

class UpdateAccountForm(FlaskForm):
    username = StringField('Username', 
                           validators=[DataRequired(),Length(min=2,max=15)])
    
    email = StringField('Email',validators=[DataRequired(), Email()])
    
    submit = SubmitField('Đổi thông tin tài khoản')

    picture = FileField('Đổi Ảnh Đại Diện', validators=[FileAllowed(['jpg','png'])])
    

    def validate_username(self, username):
        if username.data != current_user.username:
            user = User.query.filter_by(username=username.data).first()
            if user:
                raise ValidationError('Username đã được sử dụng')
        
    def validate_email(self, email):
        if email.data != current_user.email:
            user = User.query.filter_by(email=email.data).first()
            if user:
                raise ValidationError('Email đã được sử dụng')
            
class ForgotPassword(FlaskForm):
    email = StringField('Email', validators=[DataRequired(),Email()])
    submit = SubmitField('Xác Nhận')
    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is None:
            raise ValidationError('Email không tồn tại!')
        
class ResetPassword(FlaskForm):
    otp = IntegerField('OTP', validators=[DataRequired(),NumberRange(min=100000,max=999999)])
    password = PasswordField('Mật khẩu mới', validators=[DataRequired()])
    confirm_password = PasswordField('Xác nhận mật khẩu', 
                                     validators=[DataRequired(),EqualTo('password')])
    submit = SubmitField('Thay đổi mật khẩu')


class Deposit(FlaskForm):
    amount = IntegerField('Nhập số tiền',validators=[DataRequired(),NumberRange(min=10000)])
    submit = SubmitField('Xác nhận nạp tiền')

class WithDraw(FlaskForm):
    amount = IntegerField('Nhập số tiền muốn rút', validators=[DataRequired()])
    submit = SubmitField('Xác nhận rút tiền')

    def validate_amount(self, amount):
        if amount.data > current_user.balance:
            raise ValidationError('Số dư không đủ để rút tiền')
        

class Transfer(FlaskForm):
    receiver_account = IntegerField('Nhập số tài khoản người nhận: ',validators=[DataRequired()])
    amount = IntegerField("Số tiền: ",validators=[DataRequired()])
    submit = SubmitField("Chuyển tiền")
    def validate_amount(self,amount):
        if amount.data > current_user.balance:
            raise ValidationError("Số dư không đủ")
        
    def validate_receiver_account(self,receiver_account):
        user = User.query.filter_by(user_id = receiver_account.data).first()
        if user is None:
            raise ValidationError('Tài khoản người nhận không tồn tại')

class ChangePass(FlaskForm):
    oldpass = PasswordField('Nhập mật khẩu cũ',validators=[DataRequired()])
    newpass = PasswordField('Nhập mật khẩu mới',validators=[DataRequired()])
    confirm_newpass = PasswordField('Nhập lại mật khẩu mới',validators=[DataRequired(),EqualTo('newpass')])
    submit = SubmitField("Đổi mật khẩu")