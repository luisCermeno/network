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

function showSection(section){
    console.log(`showSection() entered with value of section: ${section}`)
    switch (parseInt(section)){
        case 1:
            console.log(`Loading section ${section}`)
            load_user()
            break
        case 2:
            console.log(`Loading section ${section}`)
            load_allposts()
            break;
        case 3:
            console.log(`Loading section ${section}`)
            load_following()
    }
}

function load_allposts(){
    document.querySelector('#posts-wrapper').style.display = 'flex'
    document.querySelector('#following-wrapper').style.display = 'none'
    document.querySelector('#user-wrapper').style.display = 'none'
}

function load_following(){
    document.querySelector('#posts-wrapper').style.display = 'none'
    document.querySelector('#following-wrapper').style.display = 'flex'
    document.querySelector('#user-wrapper').style.display = 'none'
}

function load_user(){
    document.querySelector('#posts-wrapper').style.display = 'none'
    document.querySelector('#following-wrapper').style.display = 'none'
    document.querySelector('#user-wrapper').style.display = 'flex'
}