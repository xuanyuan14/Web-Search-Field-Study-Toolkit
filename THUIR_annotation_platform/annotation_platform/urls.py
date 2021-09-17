from django.urls import include, path

from django.contrib import admin
from . import views
from django.views import static
admin.autodiscover()

urlpatterns = [
    # Examples:
    # url(r'^$', 'annotation_platform.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    path('admin/', admin.site.urls),
    path('user/', include('user_system.urls')),
    path('task/', include('task_manager.urls')),
    path('', views.index),
]
