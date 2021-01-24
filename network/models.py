from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField("User", related_name='followers',blank=True)
    def __str__(self):
        return f"{self.username}"
    
    def serialize(self):
        return {
            "username" : self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "following": [user.username for user in self.following.all()],
            "followers": [user.username for user in self.followers.all()]
        }

class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField("User", related_name="posts_liked", blank=True)

    def __str__(self):
        return f"Post by {self.user} on {self.timestamp}: {self.body}"

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
            "likes": [user.username for user in self.likes.all()], 
        }