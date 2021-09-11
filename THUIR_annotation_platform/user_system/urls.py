#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django.conf.urls import url, patterns

from . import views

urlpatterns = [
    url(r'^check/$', views.check),
    url(r'^login/$', views.login),
    url(r'^logout/$', views.logout),
    url(r'^signup/$', views.signup),
    url(r'^info/$', views.info),
    url(r'^edit_info/$', views.edit_info),
    url(r'^edit_password/$', views.edit_password),
    url(r'^reset_password/([a-zA-Z0-9]{12})/$', views.reset_password),
    url(r'^forget_password/$', views.forget_password),
    # url(r'^auth_failed/(\w+)/$', views.auth_failed),
]

