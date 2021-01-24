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
            history.pushState({section: section}, "", `${section_name}`);
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
            user_view()
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
    document.querySelector('#posts-wrapper').style.display = 'block'
    document.querySelector('#following-wrapper').style.display = 'none'
    document.querySelector('#user-wrapper').style.display = 'none'
    //Clear wrapper in case post have already been apended
    document.querySelector('#posts-wrapper').innerHTML = document.querySelector('#col_form').outerHTML
    //Listen for new post submission
    listen_new_post()
    //Request posts rom database
    load_posts('all_posts')
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
function load_posts(filter){
    console.log('Running load_posts()')
    //Fetch from API
    fetch(`/get/posts/${filter}`)
    //Then, get the response and convert it to jason
    .then(response => response.json())
    //Then, build html with data
    .then(posts => {
        //Log the JSON response to console
        console.log(posts)
        // Traverse the json object gotten from the response
        for (i = 0; i < posts.length; i++) {
            //Store the object in a new variable
            let post = posts[i]
            //For each post create a col div
            const col_post = document.createElement('div');
            col_post.className = 'col col-12 border'
            col_post.dataset.post_id = post.id;
            //Create colums inside the fiv
            for(j = 0; j < 5; j++){
                section = document.createElement('div')
                section.className = 'post-section'
                section.dataset.section = j
                col_post.append(section)
            }

            //Create a likes span
            likes = document.createElement("span")
            likes.innerHTML = `${post.likes.length}`
            //Create a clone of the heart svg span
            heart = document.querySelector('.heart-button').cloneNode(true)
            heart.style.display = 'inline'
            heart.dataset.post_id = post.id
            //Create an anchor for user profile
            user_link = document.createElement("a")
            user_link.href = ''
            user_link.innerHTML = `@${post.user}`
            //Create a timestamp span
            timestamp = document.createElement("span")
            timestamp.className = 'timestamp'
            timestamp.innerHTML = ` &middot ${post.timestamp}`
            //Create edit button
            edit_btn = document.createElement("button")
            edit_btn.className = 'edit-btn btn btn-link'
            edit_btn.innerHTML = 'Edit'
            edit_btn.dataset.post_id = post.id


            //Get the colums created and fill them with data
            for (j = 0; j < col_post.children.length; j++) {
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
                        col_post.children[j].dataset.post_id = post.id
                        col_post.children[j].innerHTML = post.body
                        break
                    //Edit section
                    case 2:
                        col_post.children[j].className = 'post-edit-section'
                        if (request_user == post.user){
                            col_post.children[j].append(edit_btn)
                        }
                        
                    //Likes section
                    case 3:
                        col_post.children[j].className = 'post-likes-section'
                        col_post.children[j].append(heart)
                        col_post.children[j].append(likes)
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
    //Once the HTML is built, listen for edit and likes buttons
    .then( () => {
        console.log('Posts Loaded, HTML built')
        listen_edit()
    })
}

//Edit post function
function listen_edit(){
    console.log('Running listen_edit()')
    document.querySelectorAll('.edit-btn').forEach(button => {
        console.log(button)
        button.onclick = () => {
            //Get the id of the post
            post_id = button.dataset.post_id
            console.log(`Button Edit for post ${post_id} pressed`)
            //Get the edit form (initialy display none)
            edit_form = document.querySelector('.edit-form').cloneNode(true)
            edit_form.dataset.post_id = post_id
            edit_form.style.display = 'block'
            //Get the body section of that post and inject the form
            body = document.querySelector(`[data-post_id="${post_id}"].post-body-section`)
            body.innerHTML = edit_form.outerHTML
            button.style.display = 'none'
            console.log(edit_form)
            //Listen for form submission
            edit_form.onsubmit = () => {
                console.log(`Edit form for post ${post_id} trying to submit`)
                //Stop form from submitting
                return false;
            }


        }
    })  
}


//Following section
function following_view(){
    document.querySelector('#posts-wrapper').style.display = 'none'
    document.querySelector('#following-wrapper').style.display = 'block'
    document.querySelector('#user-wrapper').style.display = 'none'
}
//User section
function user_view(){
    document.querySelector('#posts-wrapper').style.display = 'none'
    document.querySelector('#following-wrapper').style.display = 'none'
    document.querySelector('#user-wrapper').style.display = 'block'
}