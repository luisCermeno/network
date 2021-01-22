// When back arrow is clicked, show previous section
window.onpopstate = function(event) {
    console.log(event.state.section);
    showSection(event.state.section);
}

document.addEventListener('DOMContentLoaded', function() {
    //Listen for click on buttons in the navbar
    allposts_btn = document.querySelector('#nav-allposts-btn');
    following_btn = document.querySelector('#nav-following-btn')
    user_btn = document.querySelector('#nav-user-btn');
    allposts_btn.onclick = () => {
        // Add the current state to the history
        history.pushState({section: allposts_btn.innerHTML}, "", `${allposts_btn.innerHTML}`);
        // Load section
        load_allposts();
    } 
    following_btn.onclick = () => {
        // Add the current state to the history
        history.pushState({section: following_btn.innerHTML}, "", `${following_btn.innerHTML}`);
        // Load section
        load_following();
    } 
    user_btn.onclick = () => {
        // Add the current state to the history
        history.pushState({section: user_btn.firstChild.innerHTML}, "", `${user_btn.firstChild.innerHTML}`);
        load_user();
    } 

    //By default, load allpost first
    load_allposts()
});

function showSection(section){
    switch (section){
        case 1:
            load_allposts()
            break
        case 2:
            load_following()
            break;
        case 3:
            load_user()
    }
}
function load_allposts()
{

    document.querySelector('#posts-wrapper').style.display = 'flex'
    document.querySelector('#following-wrapper').style.display = 'none'
    document.querySelector('#user-wrapper').style.display = 'none'
}

function load_following()
{
    console.log('click on following')
    document.querySelector('#posts-wrapper').style.display = 'none'
    document.querySelector('#following-wrapper').style.display = 'flex'
    document.querySelector('#user-wrapper').style.display = 'none'
}

function load_user()
{
    console.log('click on user')
    document.querySelector('#posts-wrapper').style.display = 'none'
    document.querySelector('#following-wrapper').style.display = 'none'
    document.querySelector('#user-wrapper').style.display = 'flex'
}