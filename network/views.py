from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

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
        first_name = request.POST["first_name"]
        last_name = request.POST["last_name"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password, first_name = first_name, last_name = last_name)
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
    if data == "all_posts":
        posts = Post.objects.all()
        posts = posts.order_by("-timestamp").all()
    elif data == "following":
        #Get the users who the request.user follows
        following = request.user.following.all()
        #Create an empty list
        posts = []
        for user in following:
            query = Post.objects.filter(user = user)
            for post in query:
                posts += [post]
        posts.sort(key=lambda x: x.timestamp, reverse=True)
    #If filter does not match any of the above then it is an username
    else:
        try:
            user = User.objects.get(username = data)
            posts = Post.objects.filter(user=user)
            posts = posts.order_by("-timestamp").all()
        except:
            return JsonResponse({"error": "Invalid filter for posts."}, status=400)


    #Create the paginator
    paginator = Paginator(posts, 10)
    #Get the page number requested
    page_number = request.GET.get('page')
    #Filter the posts for that page
    page = paginator.page(page_number)

    #build json response
    response = [post.serialize() for post in page.object_list]
    response += [{
        'data_name' : 'page',
        'number' : page_number,
        'has_previous' : page.has_previous(),
        'has_next' : page.has_next()
        }]
    return JsonResponse(response, safe=False)


@csrf_exempt
@login_required(login_url='/login')
def get_profile(request, username):
    try:
        user = User.objects.get(username=username)
        return JsonResponse([user.serialize()], safe=False)
    except:
        return JsonResponse({"error": "User profile not found."}, status=404)

@csrf_exempt
@login_required
def edit_post(request, post_id):
    # try to get the requested post object
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    #if post has been found...
    if request.method == "PUT":
        data = json.loads(request.body)
        #case edit post
        if data.get("action") == 'edit':
            if(post.user == request.user): # for security
                post.body = data["body"]
                post.save()
                return JsonResponse({
                    "message": f'Post {post.id} edited successfully'
                }, status=201)
            else:
                return JsonResponse({"error": "Acess Denied"}, status=403)
        #case like
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

# For now, this view only implements the follow/unfollo functionality
# in the future i intend to add more 'actions' to edit an user's
# profile
@csrf_exempt
@login_required
def edit_profile(request, username):
    # Query for requested post
    try:
        user = request.user
        target_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        if data.get("action") == 'follow':
            user.following.add(target_user)
            user.save()
            return JsonResponse({
                "message": f'User {target_user} followed successfully by ${user}'
            }, status=201)
        elif data.get("action") == 'unfollow':
            user.following.remove(target_user)
            user.save()
            return JsonResponse({
                "message": f'User {target_user} unfollowed successfully by ${user}'
            }, status=201)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)