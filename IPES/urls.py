"""
URL configuration for IPES project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from .api import APIRoot

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", APIRoot.as_view(), name="api-root"),  # Public API root
    path("api/", include("apps.users.urls")),  # Users API
    path("api/", include("apps.organizations.urls")),  # Organizations API
    path("api/", include("apps.evaluations.urls")),  # Evaluations API
    path("api/", include("apps.portfolio.urls")),  # Portfolio API
    path("api/", include("apps.audit.urls")),  # Audit API
]
