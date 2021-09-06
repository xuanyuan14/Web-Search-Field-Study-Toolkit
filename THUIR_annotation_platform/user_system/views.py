#!/usr/bin/env python
# -*- coding: utf-8 -*-
__author__ = 'defaultstr'

from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.template import RequestContext

from .forms import *
from .models import User, ResetPasswordRequest, TimestampGenerator
from .utils import *

import datetime


@csrf_exempt
def check(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        error_code, user = authenticate(username, password)
        return HttpResponse(error_code)


def login(request):
    form = LoginForm()
    error_message = None

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            if not request.session.test_cookie_worked():
                error_message = u'Cookie错误，请再试一次'
            else:
                username = form.cleaned_data['username']
                password = form.cleaned_data['password']
                error_code, user = authenticate(username, password)
                if error_code == 0:
                    user.login_num += 1
                    user.last_login = datetime.datetime.now()
                    user.save()
                    store_in_session(request, user)
                    return redirect_to_prev_page(request, '/task/home/')
                elif error_code == 1:
                    error_message = u'用户不存在，请检查用户名是否正确'
                elif error_code == 2:
                    error_message = u'密码错误，请重新输入密码'
        else:
            error_message = u'表单输入错误'

    request.session.set_test_cookie()
    return render_to_response(
        'login.html',
        {
            'form': form,
            'error_message': error_message,
        },
        RequestContext(request)
    )


def signup(request):
    form = SignupForm()
    error_message = None

    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = User()
            user.username = form.cleaned_data['username']
            user.password = form.cleaned_data['password']
            user.name = form.cleaned_data['name']
            user.sex = form.cleaned_data['sex']
            user.age = form.cleaned_data['age']
            user.phone = form.cleaned_data['phone']
            user.email = form.cleaned_data['email']
            user.field = form.cleaned_data['field']
            user.search_frequency = form.cleaned_data['search_frequency']
            user.search_history = form.cleaned_data['search_history']
            user.signup_time = datetime.datetime.now()
            user.last_login = datetime.datetime.now()
            user.login_num = 0
            user.save()
            return HttpResponseRedirect('/user/login/')
        else:
            error_message = form.errors

    return render_to_response(
        'signup.html',
        {'form': form,
         'error_message': error_message,
         },
        RequestContext(request)
    )


def logout(request):
    if 'username' in request.session:
        del request.session['username']
    if 'prev_page' in request.session:
        del request.session['prev_page']
    return HttpResponseRedirect('/user/login/')


@require_login
def info(user, request):
    # user_group_string = get_user_groups_string(user.user_groups)
    search_frequency_choices = {
        '': u'',
        'frequently': u'每天使用多次',
        'usually': u'平均每天使用一次',
        'sometimes': u'每周偶尔使用两三次',
        'rarely': u'平均每周使用不超过一次'
    }
    search_history_choices = {
        '': u'',
        'very long': u'5年以上',
        'long': u'3年~5年',
        'short': u'1年~3年',
        'very short': u'1年以内'
    }
    search_frequency = search_frequency_choices[user.search_frequency]
    search_history = search_history_choices[user.search_history]
    return render_to_response(
        'info.html',
        {
            'cur_user': user,
            'search_frequency': search_frequency,
            'search_history': search_history
            # 'user_group_string': user_group_string
        },
        RequestContext(request),
    )


@require_login
def edit_info(user, request):
    form = EditInfoForm(
        {
            'name': user.name,
            'sex': user.sex,
            'age': user.age,
            'phone': user.phone,
            'email': user.email,
            'field': user.field,
            'search_frequency': user.search_frequency,
            'search_history': user.search_history
        })
    error_message = None

    if request.method == 'POST':
        form = EditInfoForm(request.POST)
        if form.is_valid():
            user.name = form.cleaned_data['name']
            user.sex = form.cleaned_data['sex']
            user.age = form.cleaned_data['age']
            user.phone = form.cleaned_data['phone']
            user.email = form.cleaned_data['email']
            user.field = form.cleaned_data['field']
            user.search_frequency = form.cleaned_data['search_frequency']
            user.search_history = form.cleaned_data['search_history']
            user.save()
            return HttpResponseRedirect('/user/info/')
        else:
            error_message = form.errors

    return render_to_response(
        'edit_info.html',
        {
            'cur_user': user,
            'form': form,
            'error_message': error_message,
        },
        RequestContext(request),
    )


@require_login
def edit_password(user, request):
    form = EditPasswordForm()
    error_message = None

    if request.method == 'POST':
        form = EditPasswordForm(request.POST)
        if form.is_valid():
            if user.password == form.cleaned_data['cur_password']:
                user.password = form.cleaned_data['new_password']
                user.save()
                return HttpResponseRedirect('/user/info/')
            else:
                error_message = '原密码错误'
        else:
            error_message = form.errors

    return render_to_response(
        'edit_password.html',
        {
            'cur_user': user,
            'form': form,
            'error_message': error_message,
        },
        RequestContext(request),
    )


def forget_password(request):
    form = ForgetPasswordForm()
    error_message = None

    if request.method == 'POST':
        form = ForgetPasswordForm(request.POST)
        if form.is_valid():
            user = User.objects.filter(email=form.cleaned_data['email'])
            if user is None or len(user) == 0:
                error_message = u'Email地址不存在'
            else:
                user = user[0]
                reset_request = ResetPasswordRequest.objects.create(
                    user=user
                )
                reset_request.save()
                send_reset_password_email(request, reset_request)
                return HttpResponseRedirect('/user/login/')
        else:
            error_message = form.errors

    return render_to_response(
        'forget_password.html',
        {
            'form': form,
            'error_message': error_message,
        },
        RequestContext(request),
    )


def reset_password(request, token_str):
    form = ResetPasswordForm()
    token = None
    error_message = None

    try:
        token = ResetPasswordRequest.objects.get(token=token_str)
        print TimestampGenerator(0)()
        print token.expire
        if TimestampGenerator(0)() > token.expire:
            error_message = u'Token已失效，请重新找回密码'
    except ResetPasswordRequest.DoesNotExist:
        error_message = u'链接地址错误，请重新找回密码'

    if error_message is not None:
        return render_to_response(
            'reset_password.html',
            {
                'form': None,
                'error_message': error_message
            },
            RequestContext(request),
        )

    if request.method == 'POST':
        form = ResetPasswordForm(request.POST)
        if form.is_valid():
            user = token.user
            user.password = form.cleaned_data['new_password']
            user.save()
            token.delete()
            return HttpResponseRedirect('/user/login/')
        else:
            error_message = form.errors

    return render_to_response(
        'reset_password.html',
        {
            'form': form,
            'error_message': error_message,
        },
        RequestContext(request),
    )

# @require_login
# def auth_failed(user, request, missing_group):
#     user_group_string = get_user_groups_string(user.user_groups)
#     missing_group_string = get_user_groups_string([missing_group])
#     return render_to_response(
#         'auth_failed.html',
#         {
#             'cur_user': user,
#             'user_group_string': user_group_string,
#             'missing_group_string': missing_group_string,
#         },
#         RequestContext(request),
#     )
