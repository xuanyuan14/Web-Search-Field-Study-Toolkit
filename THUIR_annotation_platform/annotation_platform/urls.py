from django.conf.urls import patterns, include, url

from django.contrib import admin
from . import views
from django.views import static
admin.autodiscover()

urlpatterns = [
    # Examples:
    # url(r'^$', 'annotation_platform.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^user/', include('user_system.urls')),
    url(r'^task/', include('task_manager.urls')),
    url(r'^$', views.index),
]
