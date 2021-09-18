#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django.urls import path, re_path

from . import views

urlpatterns = [
    path('check/', views.check),
    path('login/', views.login),
    path('logout/', views.logout),
    path('signup/', views.signup),
    path('info/', views.info),
    path('edit_info/', views.edit_info),
    path('edit_password/', views.edit_password),
    re_path(r'^reset_password/([a-zA-Z0-9]{12})/$', views.reset_password),
    path('forget_password/', views.forget_password),
    # re_path(r'^auth_failed/(\w+)/$', views.auth_failed),
]

