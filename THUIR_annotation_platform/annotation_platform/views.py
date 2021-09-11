#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django.http import HttpResponseRedirect


def index(request):
    return HttpResponseRedirect('/task/home/')


