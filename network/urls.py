
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    # API routes
    path("post", views.post, name="post"),
    path("get/posts/<str:data>", views.get_posts, name="get_posts"),
    path("get/profile/<str:username>", views.get_profile, name="get_profile"),
    path("edit/post/<str:post_id>", views.edit_post, name="edit_post")
]
