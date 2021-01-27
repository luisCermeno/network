// When back arrow is clicked, show previous section
window.onpopstate = function(event) {
    showSection(event.state.section);
}

//Get who the user is
const request_user = JSON.parse(document.getElementById('request_user').textContent);


//Start script once the content is loaded
document.addEventListener('DOMContentLoaded', function() {
    
    //Listen for click on section of the navbar
    document.querySelectorAll('.section-btn').forEach(button => {
        button.onclick = function() {
            const section = this.dataset.section;
            const section_name = this.innerHTML
            // Add the current state to the history
            history.pushState({section: section}, "", ``);
            showSection(section);
        };
    });

    //By default, load allpost first
    showSection(2)
});

//Toogle between sections
function showSection(section){
    console.log(`Running showSection() with value of section = ${section}`)
    switch (parseInt(section)){
        case 1:
            profile_view(request_user)
            break
        case 2:
            allposts_view()
            break;
        case 3:
            following_view()
    }
}
//All posts section
function allposts_view(){
    console.log('Running allposts_view()')
    document.querySelector('#all-posts-wrapper').style.display = 'block'
    document.querySelector('#posts-wrapper').style.display = 'block'
    document.querySelector('#user-wrapper').style.display = 'none'
    document.querySelector('#following-wrapper').style.display = 'none'
    
    //Request posts from database
    load_posts('all_posts',1)
    //Listen for new post submission
    listen_new_post()
}

function listen_new_post(){
    console.log('Running listen_new_posts()')
    // Select the submit button and input field to be used later
    const submit = document.querySelector('#submit');
    const input_field = document.querySelector('#new-post-body');
    // Clear out composition fields
    input_field.value = '';

    // Disable submit button by default:
    submit.disabled = true;

    // Listen for input to be typed into the input field
    input_field.onkeyup = () => {
        if (input_field.value.length > 0) {
            submit.disabled = false;
        }
        else {
            submit.disabled = true;
        }
    }
    // Listen for form submission
    document.querySelector('#new-post-form').onsubmit = () => {
        console.log('Form has been submitted')
        //Get body 
        const body = input_field.value
        //Send POST request to server
        fetch('/post', {
            method: 'POST',
            body: JSON.stringify({
                body: body,
            })
          })
          .then(response => response.json())
          .then(result => {
              // Print result
              console.log(result);
          })
          //Once client has goten the response, load all posts again
          .then( () => {allposts_view()} )
        //Stop form from submitting
        return false
    }
}

//Load posts function
function load_posts(filter,page){
    console.log(`Running load_posts('${filter}',${page})`)
    //Clear wrapper
    document.querySelector('#posts-wrapper').innerHTML = ''
    //Fetch from API
    fetch(`/get/posts/${filter}?page=${page}`, {
        method: 'GET',
    })
    //Then, get the response and convert it to jason
    .then(response => response.json())
    //Then, build html with data
    .then(data => {
        //Log the JSON response to console
        console.log(data)
        //Store the last object in a variable that will contain page data
        page = data[data.length - 1]
        // Traverse the json object gotten from the response
        for (i = 0; i < data.length - 1; i++) {
            //Store the object in a new variable
            let post = data[i]
            //For each post create a col div
            const col_post = document.createElement('div');
            col_post.className = 'col col-md-6 border mx-auto'
            col_post.dataset.post_id = post.id;
            //Create colums inside the fiv
            for(j = 0; j < 5; j++){
                section = document.createElement('div')
                section.className = 'post-section'
                section.dataset.section = j
                col_post.append(section)
            }

            //Create a likes span
            nLikes_div = document.createElement("span")
            nLikes_div.className = 'post-nLikes'
            nLikes_div.dataset.post_id = post.id
            nLikes_div.innerHTML = `${post.likes.length}`
            // Clone the like svg from index.html and style depending on liked status
            like_btn = document.querySelector('.like-btn').cloneNode(true)
            like_btn.style.display = 'inline'
            like_btn.dataset.post_id = post.id
            like_btn.dataset.liked = 'false'
            if (post.likes.includes(request_user)){
                like_btn.dataset.liked = 'true'
            }
            //Create an anchor for user profile
            user_link = document.createElement("a")
            user_link.innerHTML = `@${post.user}`
            user_link.className = 'profile-btn'
            user_link.dataset.username = post.user
            //Create a timestamp span
            timestamp = document.createElement("span")
            timestamp.className = 'timestamp'
            timestamp.innerHTML = ` &middot ${post.timestamp}`
            //Create a div for the body
            post_body = document.createElement("div")
            post_body.className = 'post-body'
            post_body.dataset.post_id = post.id
            //Create edit button
            edit_btn = document.createElement("button")
            edit_btn.className = 'edit-btn btn btn-link'
            edit_btn.innerHTML = 'Edit'
            edit_btn.dataset.post_id = post.id
            //Clone the edit form from index.html (initialy display none)
            edit_form = document.querySelector('.edit-form').cloneNode(true)
            edit_form.className = 'edit-form'
            edit_form.dataset.post_id = post.id
            edit_form.style.display = 'block'


            //Get the colums created and fill them with data
            for (j = 0; j < col_post.children.length; j++) {
                //Inject post id in the dataset
                col_post.children[j].dataset.post_id = post.id
                //Build html depending on the section
                switch(parseInt(col_post.children[j].dataset.section)){
                    //User section
                    case 0:
                        col_post.children[j].className = 'post-usertime-section'
                        col_post.children[j].append(user_link)
                        col_post.children[j].append(timestamp)
                        break
                    //Body section
                    case 1:
                        col_post.children[j].className = 'post-body-section'
                        post_body.innerHTML = post.body
                        col_post.children[j].append(post_body)
                        if (request_user == post.user){
                            col_post.children[j].append(edit_btn)
                        }
                        break
                    //Edit section
                    case 2:
                        col_post.children[j].className = 'post-edit_form-section'
                        col_post.children[j].append(edit_form)
                        col_post.children[j].style.display = 'none'
                        break
                    //Likes section
                    case 3:
                        col_post.children[j].className = 'post-likes-section'
                        col_post.children[j].append(like_btn)
                        col_post.children[j].append(nLikes_div)
                        break
                    //Comments section
                    case 4:
                        col_post.children[j].className = 'post-comments-section'
                        col_post.children[j].innerHTML = 'Comments:'
                        break
                }
            }
            //Append post col to the posts wrapper
            document.querySelector('#posts-wrapper').append(col_post);  
        }
    })
    //Built the paginator
    .then( () => {
        //Clear paginator wrapper
        document.querySelector('#paginator-wrapper').innerHTML = ''
        //If page has either previous or next, clone paginator element and inject it in the wrapper
        if (page.has_previous || page.has_next){
            pag_ul = document.querySelector('.pagination').cloneNode(true)
            document.querySelector('#paginator-wrapper').append(pag_ul)

            //Configure the navigation buttons
            previous_btn = document.querySelector('#previous-btn')
            next_btn = document.querySelector('#next-btn')
            if (page.has_previous){
                console.log('This page has previous!')
                previous_btn.className = 'page-item enabled'
                previous_btn.dataset.toPage = parseInt(page.number) - 1
                previous_btn.dataset.filter = filter
            }
            else{
                console.log('This page does not has previous!')
                previous_btn.className = 'page-item disabled'
            }
            if (page.has_next){
                console.log('This page has next!')
                next_btn.className = 'page-item enabled'
                next_btn.dataset.toPage = parseInt(page.number) + 1
                next_btn.dataset.filter = filter
            }
            else{
                console.log('This page does not has next!')
                next_btn.className = 'page-item disabled'
            }
        }
    })
    //Once the HTML is built, listen for edit and likes buttons
    .then( () => {
        console.log('Posts Loaded, HTML built')
        listen_profile()
        listen_edit()
        listen_like()
        listen_pagination()
    })
}

function listen_profile(){
    console.log('Running listen_profile()')
    document.querySelectorAll('.profile-btn').forEach(button => {
        button.onclick = () => {
            //Get the username of the user
            username = button.dataset.username
            console.log(`Profile button clicked for user ${username}`)
            //Show the users profile
            profile_view(username)
        }
    })
}

function listen_like(){
    console.log('Running listen_like()')
    document.querySelectorAll('.like-btn').forEach(button => {
        button.onclick = () => {
            //Get the id of the post
            post_id = button.dataset.post_id
            //Get the counter of likes
            nLikes_div = document.querySelector(`[data-post_id="${post_id}"].post-nLikes`)
            nLikes = parseInt(nLikes_div.innerHTML)
            console.log(`Like button clicked for post ${post_id}`)
            //Like post
            if (button.dataset.liked == 'false'){
                // Submit PUT request to API
                fetch(`/edit/post/${post_id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                            action: 'like'
                        }),
                })
                .then(response => {
                    //If liking is successful
                    if (response.status == 201){
                    console.log(`Post ${post_id} liked successfully`);
                    //Increment counter
                    nLikes++
                    nLikes_div.innerHTML = nLikes.toString()
                    //Change button style
                    button.dataset.liked = 'true'
                    }
                })
            }
            //Unlike post
            else{
                // Submit PUT request to API
                fetch(`/edit/post/${post_id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                            action: 'unlike'
                        }),
                })
                .then(response => {
                    //If liking is successful
                    if (response.status == 201){
                    console.log(`Post ${post_id} unliked successfully`);
                    //Increment counter
                    nLikes--
                    nLikes_div.innerHTML = nLikes.toString()
                    //Change button style
                    button.dataset.liked = 'false'
                    }
                })
            }
        }
    })
}


//Edit post function
function listen_edit(){
    console.log('Running listen_edit()')
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.onclick = () => {
            //Get the id of the post
            post_id = button.dataset.post_id
            console.log(`Edit button clicked for post ${post_id}`)
            //Show the form section and hide the body section
            document.querySelector(`[data-post_id="${post_id}"].post-body-section`).style.display = 'none'
            document.querySelector(`[data-post_id="${post_id}"].post-edit_form-section`).style.display = 'block'
            //Prefill the form with existing body of post
            textarea = document.querySelector(`[data-post_id="${post_id}"].edit-form textarea`)
            textarea.value = document.querySelector(`[data-post_id="${post_id}"].post-body`).innerHTML
            //Listen for edit forms
            listen_edit_form()
        }
    })
}

//Pagination function
function listen_pagination(){
    console.log('Running listen_pagination()')
    document.querySelectorAll('.enabled').forEach(button => {
        button.onclick = () => {
            //Get what page the button is referring to and the filter
            page = button.dataset.toPage
            filter = button.dataset.filter
            //Load the posts of that page
            load_posts(filter,page)
            //here the function keeps listening for buttons that are disabled
        }
    })
}

function listen_edit_form(){
    console.log('Running listen_edit_form()')
    //Get the forms currently active
    document.querySelectorAll('.edit-form').forEach(form => {
        form.onsubmit = () => {
            //Get the post id
            var post_id = form.dataset.post_id
            // Get the textarea value
            var new_body = document.querySelector(`[data-post_id="${post_id}"].edit-form textarea`).value
            // Submit PUT request to API
            fetch(`/edit/post/${post_id}`, {
                method: 'PUT',
                body: JSON.stringify({
                        action: 'edit',
                        body: new_body
                      }),
              })
            .then(response => {
                //If editing is successful
                if (response.status == 201){
                console.log(`Post ${post_id} edited successfully`);
                //Replace the body with new body
                    document.querySelector(`[data-post_id="${post_id}"].post-body`).innerHTML = new_body
                    //Show the body section and hide the form section
                    document.querySelector(`[data-post_id="${post_id}"].post-body-section`).style.display = 'block'
                    document.querySelector(`[data-post_id="${post_id}"].post-edit_form-section`).style.display = 'none'
                }
            })
            //Stop form from submitting
            return false;
        }
    })
    //Get the cancel buttons currently active
    document.querySelectorAll('.cancel-btn').forEach(button => {
        button.onclick = () => {
            //Get the post id
            var post_id = button.parentElement.dataset.post_id
            //Show the form section and hide the body section
            document.querySelector(`[data-post_id="${post_id}"].post-body-section`).style.display = 'block'
            document.querySelector(`[data-post_id="${post_id}"].post-edit_form-section`).style.display = 'none'
        }  
    })
}

//Following section
function following_view(){
    //Show section and hide others
    document.querySelector('#posts-wrapper').style.display = 'block'
    document.querySelector('#user-wrapper').style.display = 'none'
    document.querySelector('#all-posts-wrapper').style.display = 'none'
    document.querySelector('#following-wrapper').style.display = 'block'
    //Fetch data from API
    load_posts('following',1)
}

//User section
function profile_view(username){
    console.log(`Running profile_view(${username})`)
    document.querySelector('#posts-wrapper').style.display = 'none'
    document.querySelector('#user-wrapper').style.display = 'block'
    document.querySelector('#all-posts-wrapper').style.display = 'none'
    document.querySelector('#following-wrapper').style.display = 'none'
    fetch(`get/profile/${username}`)
    .then(response => response.json())
    .then(data => {
        //Store the data in a variable called user
        var user = data[0]
        console.log(user)
        //Build HTML
        document.querySelector('#profile-name').innerHTML = `${user.first_name} ${user.last_name}`
        document.querySelector('#profile-username').innerHTML = `@${user.username}`
        document.querySelector('#profile-nFollowers').innerHTML = `${user.followers.length}`
        document.querySelector('#profile-nFollowing').innerHTML = `${user.following.length}`
        //Get the data from the request user in order to build follow functionality 
        fetch(`get/profile/${request_user}`).then(response => response.json()).then(data => {
            var request_user_data = data[0]
            console.log(request_user_data)
            //If the user is in a foreign profile, start follow functionality
            if (request_user != user.username){
                document.querySelector('#follow-btn').style.display = 'inline'
                document.querySelector('#follow-btn').dataset.username = user.username
                if (request_user_data.following.includes(user.username)){
                    document.querySelector('#follow-btn').dataset.followed = 'true'
                    document.querySelector('#follow-btn').innerHTML = 'Unfollow'
                }
                else{
                    document.querySelector('#follow-btn').dataset.followed = 'false'
                    document.querySelector('#follow-btn').innerHTML = 'Follow'
                }
                //Listen here for follow button
                listen_follow()
            }
            else{
                document.querySelector('#follow-btn').style.display = 'none'
            }
        })
    })
    //Load post from user
    document.querySelector('#posts-wrapper').style.display = 'block'
    load_posts(username,1)
    
}

function listen_follow(){
    console.log('Running listen_follow()')
    document.querySelector('#follow-btn').onclick = function() {
        //Get the user to follow
        username = this.dataset.username
        console.log(`Follow button clicked for user ${username}`)
        //Get the counter of followers
        nFollowers_span = document.querySelector('#profile-nFollowers')
        nFollowers = parseInt(nFollowers_span.innerHTML)
        //Follow user
        if (this.dataset.followed == 'false'){
            // Submit PUT request to API
            fetch(`/edit/profile/${username}`, {
                method: 'PUT',
                body: JSON.stringify({
                        action: 'follow'
                    }),
            })
            .then(response => {
                //If following is successful
                if (response.status == 201){
                console.log(`User ${username} followed successfully`);
                //Increment counter
                nFollowers++
                nFollowers_span.innerHTML = nFollowers.toString()
                //Change button dataset
                this.dataset.followed = 'true'
                this.innerHTML = 'Unfollow'
                }
            })
        }
        //Unlike post
        else{
            // Submit PUT request to API
            fetch(`/edit/profile/${username}`, {
                method: 'PUT',
                body: JSON.stringify({
                        action: 'unfollow'
                    }),
            })
            .then(response => {
                //If unfollowing is successful
                if (response.status == 201){
                console.log(`User ${username} unfollowed successfully`);
                //Decrement counter
                nFollowers--
                nFollowers_span.innerHTML = nFollowers.toString()
                //Change button dataset
                this.dataset.followed = 'false'
                this.innerHTML = 'Follow'
                }
            })
        }
    }
}