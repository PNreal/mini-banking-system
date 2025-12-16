import os
import secrets
from flask import Flask, render_template, url_for, flash, redirect, request, session
from bank.forms import RegistrationForm, LoginForm, UpdateAccountForm, ForgotPassword,ResetPassword,Deposit, WithDraw,Transfer,ChangePass
from bank.models import User, Post
from bank import app, db, bcrypt
from flask_login import login_user, current_user,logout_user, login_required


@app.route("/")
@app.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html")



@app.route("/about")
def about():
    return render_template("about.html", title='About')

@app.route("/register",methods=['GET','POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        user = User(username = form.username.data, email=form.email.data,password=hashed_password)
        db.session.add(user)
        db.session.commit()
        flash('Tai Khoan Da Duoc Tao', 'success')
        return redirect(url_for('login'))
    return render_template('register.html',title = 'Register', form = form)

@app.route("/login",methods=['GET','POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user,remember=form.remember.data)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('dashboard'))
        else: flash('Sai Thông Tin Đăng Nhập','danger')
    return render_template('login.html',title = 'Login', form = form)

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('dashboard'))


def save_picture(form_picture):
    random_hex = secrets.token_hex(8)
    f_name, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(app.root_path,'static',picture_fn)
    form_picture.save(picture_path)
    return picture_fn


@app.route("/settings", methods=['GET','POST'])
@login_required
def settings():
    form = UpdateAccountForm()
    if form.validate_on_submit():
        if form.picture.data:
            picture_file = save_picture(form.picture.data)
            current_user.image_file = picture_file
        current_user.username = form.username.data
        current_user.email = form.email.data
        db.session.commit()
        flash('Thông tin đã được thay đổi', 'success')
        return redirect(url_for('settings'))
    elif request.method == 'GET':
        form.username.data = current_user.username
        form.email.data = current_user.email
    image_file = url_for('static', filename = current_user.image_file)
    return render_template('settings.html',title = 'Setting',
                           image_file=image_file,form=form)

def generate_otp():
    return str(secrets.randbelow(900000) + 100000)

@app.route("/forgot-password", methods=['GET','POST'])
def forgot_password():
    form = ForgotPassword()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            session['reset_password'] = form.email.data
            session[form.email.data] = generate_otp()
            flash('Mã OTP đã được gửi tới email của bạn' + session[form.email.data],'success')
            return redirect(url_for('reset_password'))
        else: flash('Email không tồn tại!','danger')
    return render_template('forgot-password.html',form=form)

@app.route("/reset-password",methods=['GET','POST'])
def reset_password():
    if 'reset_password' not in session:
        return redirect(url_for('forgot_password'))
    form = ResetPassword()
    if form.validate_on_submit():
        flash(session[session['reset_password']],'success')
        if str(form.otp.data) == session[session['reset_password']]:
            user = User.query.filter_by(email=session['reset_password']).first()
            hashed_pw = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
            user.password = hashed_pw
            db.session.commit()
            session.pop(session['reset_password'],None)
            session.pop('reset_password',None)
            flash('Mật khẩu đã được thay đổi thành công!','success')
            return redirect(url_for('login'))
        else: flash('Mã OTP không chính xác','danger')

    return render_template('reset-password.html', form=form)

@app.route("/deposit",methods=['GET','POST'])
def deposit():
    if current_user.is_frozen:
        return redirect(url_for('dashboard'))
    form = Deposit()
    return render_template('deposit.html',form=form)

@app.route("/withdraw",methods=['GET','POST'])
def withdraw():
    if current_user.is_frozen:
        return redirect(url_for('dashboard'))
    form = WithDraw()
    if form.validate_on_submit():
        flash('Rút Tiền thành công','success')
    return render_template('withdraw.html',form=form)


@app.route("/transfer",methods=['GET','POST'])
def transfer():
    if current_user.is_frozen:
        return redirect(url_for('dashboard'))
    form = Transfer()
    if form.validate_on_submit():
        user = User.query.filter_by(user_id = form.receiver_account.data).first()
        if user.is_frozen:
            flash('Người nhận đang tạm khóa tài khoản!','danger')
        else:
            user.balance += form.amount.data
            current_user.balance -= form.amount.data
            db.session.commit()
            flash('Chuyển tiền thành công','success')
    return render_template('transfer.html',form=form)


@app.route("/freeze",methods=['GET','POST'])
def freeze():
    current_user.is_frozen ^= 1
    db.session.commit()
    return render_template("dashboard.html")

@app.route("/change-password",methods = ['GET','POST'])
def change_password():
    form = ChangePass()
    if form.validate_on_submit():
        #old_pass = bcrypt.generate_password_hash(form.oldpass.data).decode('utf-8')
        if bcrypt.check_password_hash(current_user.password,form.oldpass.data):
            current_user.password = bcrypt.generate_password_hash(form.newpass.data).decode('utf-8')
            db.session.commit()
            flash('Thay đổi mật khẩu thành công','success')
        else: flash('Mật khẩu cũ không đúng!','danger')
    return render_template('change-password.html',form=form)