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
            load_user()
            break
        case 2:
            load_allposts()
            break;
        case 3:
            load_following()
    }
}
//All posts section
function load_allposts(){
    console.log('Running load_allposts()')
    document.querySelector('#posts-wrapper').style.display = 'flex'
    document.querySelector('#following-wrapper').style.display = 'none'
    document.querySelector('#user-wrapper').style.display = 'none'
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
        //Load posts again
        listen_new_post()()
        //Stop form from submitting
        return false
    }
}



//Following section
function load_following(){
    document.querySelector('#posts-wrapper').style.display = 'none'
    document.querySelector('#following-wrapper').style.display = 'flex'
    document.querySelector('#user-wrapper').style.display = 'none'
}
//User section
function load_user(){
    document.querySelector('#posts-wrapper').style.display = 'none'
    document.querySelector('#following-wrapper').style.display = 'none'
    document.querySelector('#user-wrapper').style.display = 'flex'
}