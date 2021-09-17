#!/usr/bin/env python
# -*- coding: utf-8 -*-

from .models import User, ResetPasswordRequest, user_group_list
from django.http import HttpResponseRedirect
from django.http import HttpRequest
from django.core.mail import EmailMultiAlternatives
import smtplib


def get_user_from_request(req):
    user = User.objects.get(username=req.session['username'])
    return user


def authenticate(username, password):
    '''
    :param username: username
    :param password: password
    :return: error_code and authenticated User object
    error_code:
    0   success
    1   no such user
    2   password is wrong
    '''
    try:
        user = User.objects.get(username=username)
        if user.password == password:
            return 0, user
        else:
            return 2, None
    except User.DoesNotExist as e:
        return 1, None


def store_in_session(request, user):
    request.session.delete_test_cookie()
    request.session['username'] = user.username
    request.session.set_expiry(0)


def redirect_to_prev_page(request, default_url):
    if 'prev_page' not in request.session:
        return HttpResponseRedirect(default_url)
    else:
        prev_page = request.session['prev_page']
        del request.session['prev_page']
        return HttpResponseRedirect(prev_page)


def login_redirect(request, login_url='/user/login/'):
    request.session['prev_page'] = request.get_full_path()
    request.session.set_expiry(0)
    return HttpResponseRedirect(login_url)


def auth_failed_redirect(request, missing_group):
    return HttpResponseRedirect('/user/auth_failed/%s/' % missing_group)


def require_login(func):
    def ret(*args):
        req = args[0]
        assert isinstance(req, HttpRequest)
        if 'username' not in req.session:
            return login_redirect(req)
        try:
            user = User.objects.get(username=req.session['username'])
            args = [user] + list(args)
            return func(*args)
        except User.DoesNotExist as e:
            return login_redirect(req)
    return ret


def require_auth(user_groups):

    def require_login_with_auth(func):

        def ret(*args):
            req = args[0]
            assert isinstance(req, HttpRequest)
            if 'username' not in req.session:
                return login_redirect(req)
            try:
                user = User.objects.get(username=req.session['username'])
                # check if all the user group requirements are satisfied
                # if no, show auth failed page
                for g in user_groups:
                    if g not in list(user.user_groups):
                        return auth_failed_redirect(req, g)

                # if yes, pass the user as first parm
                args = [user] + list(args)
                return func(*args)
            except User.DoesNotExist as e:
                return login_redirect(req)

        return ret

    return require_login_with_auth


def get_user_groups_string(user_groups):
    return u' | '.join([val for key, val in user_group_list if key in user_groups])


def send_reset_password_email(request, reset_req):
    subject = u'THUIR Annotation Platform Forget Password'

    user = reset_req.user

    message = u'If you are user %s' % user.username + ','

    message += u'Please click or copy the link below to your browser address bar to reset your password:'
    host = u'http://' + request.get_host()
    url = unicode(host + '/user/reset_password/%s/' % reset_req.token)
    html_content = message + u'<a href="%s">%s</a>.' % (url, url)
    message += url

    source = 'thuir_annotation@163.com'
    target = reset_req.user.email
    msg = EmailMultiAlternatives(subject, message, source, [target])
    msg.attach_alternative(html_content, 'text/html')
    try:
        msg.send()
    except smtplib.SMTPException as e:
        print (type(e))
        print (e)




