from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import *

@login_required(login_url='/login')
def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required(login_url='/login')
def post(request):
    # Adding a post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get body of the post
    data = json.loads(request.body)
    body = data.get("body", "")

    # Create a post object and save it
    new_post = Post(user = request.user, body = body)
    new_post.save()
    return JsonResponse({"message": "Post save successfully."}, status=201)

@csrf_exempt
@login_required(login_url='/login')
def get_posts(request, data):
    # Filter emails returned based on mailbox
    if data == "all_posts":
        posts = Post.objects.all()
    elif data == "own_posts":
        posts = Post.objects.filter(user=request.user)
    else:
        return JsonResponse({"error": "Invalid filter for posts."}, status=400)

    # Return emails in reverse chronologial order
    posts = posts.order_by("-timestamp").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)

@csrf_exempt
@login_required
def edit_post(request, post_id):
    # Query for requested post
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        if data.get("action") == 'edit':
            if(post.user == request.user):
                post.body = data["body"]
                post.save()
                return JsonResponse({
                    "message": f'Post {post.id} edited successfully'
                }, status=201)
            else:
                return JsonResponse({"error": "Acess Denied"}, status=403)

        elif data.get("action") == 'like':
            post.likes.add(request.user)
            post.save()
            return JsonResponse({
                "message": f'Post {post.id} liked successfully'
            }, status=201)
        elif data.get("action") == 'unlike':
            post.likes.remove(request.user)
            post.save()
            return JsonResponse({
                "message": f'Post {post.id} unliked successfully'
            }, status=201)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)
