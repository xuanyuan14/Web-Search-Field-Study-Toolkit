#!/usr/bin/env python
# -*- coding: utf-8 -*-
__author__ = 'defaultstr'

from django.http import HttpResponseRedirect


def index(request):
    return HttpResponseRedirect('/task/home/')


