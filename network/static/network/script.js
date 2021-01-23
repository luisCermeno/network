// When back arrow is clicked, show previous section
window.onpopstate = function(event) {
    showSection(event.state.section);
}

document.addEventListener('DOMContentLoaded', function() {
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
        //Listen for new post again
        listen_new_post()()
        //Stop form from submitting
        return false
    }
}

//Load posts function
function load_posts(filter){
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
      //For each post create a col div
      const col_post = document.createElement('div');
      col_post.className = 'col col-12 border'
      col_post.dataset.postid = posts[i].id;
      col_post.innerHTML = posts[i].body;
      //Append post col to the posts wrapper
      document.querySelector('#posts-wrapper').append(col_post);
    }
    });
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