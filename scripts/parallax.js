function parallax(element, direction, speed) {
    speed = speed/10;
    var scrollY = window.scrollY;
    const rect = element.getBoundingClientRect();
    if (direction == "up") {
        element.style.transform = `translate3d(0, ${scrollY * -speed}px, 0)`;
    } else if (direction == "down") {
        element.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
    } else if (direction == "left") {
        element.style.transform = `translate3d(${scrollY * -speed}px, 0px, 0)`;
    } else if (direction == "right") {
        element.style.transform = `translate3d(${scrollY * speed}px, 0px, 0)`;
    }
}
function isOnScreen(element) {
      
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    return (rect.bottom <= (windowHeight+rect.height-300));
}

function appearsOnScroll(element) {
    
    if (isOnScreen(element) && !element.classList.contains("visible")) {
        element.classList.add("visible");
    }
}

let project = document.querySelector(".project");

let main = document.querySelector("main");

let parallaxElem = document.querySelectorAll(".parallax");

let background = document.querySelector(".background");

let hamburgerButton = document.querySelector(".hamburger");

let nav = document.querySelector("nav");


hamburgerButton.addEventListener("click", () => {
    if (nav.classList.contains("nav-expand")) {
        nav.classList.remove("nav-expand");
        hamburgerButton.classList.remove("hamburger-open");
    } else {
        nav.classList.add("nav-expand");
        hamburgerButton.classList.add("hamburger-open");
    }
    
});


window.addEventListener("scroll", function() {
    parallaxElem.forEach(function(element, index) {
        if (element.classList.contains("p-up")) {
            parallax(element, "up", 1);
        }
        if (element.classList.contains("p-down")) {
            parallax(element, "down", 1);
        }
        if (element.classList.contains("p-left")) {
            parallax(element, "left", 1);
        }
        if (element.classList.contains("p-right")) {
            parallax(element, "right", 1);
        }
        if (element.classList.contains("scroll-appears")) {
            appearsOnScroll(element);
        }
    });    
    

    if (this.window.scrollY<150) {
        if (background.classList.contains("background-scrolled")) {
            background.classList.remove("background-scrolled");
        }    } else {
        if (!background.classList.contains("background-scrolled")) {
            background.classList.add("background-scrolled");
        }
    }
    


});

if (window.innerWidth <= 800) {
    let body = document.querySelector("body");

    window.addEventListener("scroll", function() {
        if (this.window.scrollY<150) {
            if (body.classList.contains("scrolled")) {
                body.classList.remove("scrolled");
            }    } else {
            if (!body.classList.contains("scrolled")) {
                body.classList.add("scrolled");
            }
        }
})
}