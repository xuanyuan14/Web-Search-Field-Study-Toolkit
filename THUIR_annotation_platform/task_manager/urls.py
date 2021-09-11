#!/usr/bin/env python
# -*- coding: utf-8 -*-
from django.conf.urls import patterns, include, url
from . import views

urlpatterns = [
    url(r'^home/$', views.task_home),
    url(r'^data/$', views.data),
    url(r'^partition/$', views.task_partition),
    url(r'^annotation/$', views.annotation_home),
    url(r'^task_annotation1/([0-9]+)/$', views.task_annotation1),
    url(r'^pre_query_annotation/([0-9]+)/$', views.pre_query_annotation),
    url(r'^query_annotation/([0-9]+)/$', views.query_annotation),
    url(r'^task_annotation2/([0-9]+)/$', views.task_annotation2),
    url(r'^show_page/([0-9]+)/$', views.show_page),
    url(r'^page_annotation/([0-9]+)/$', views.page_annotation),
    url(r'^page_annotation_submit/([0-9]+)/$', views.page_annotation_submit),
    url(r'^show_me_serp/([0-9]+)/$', views.show_me_serp)
]
