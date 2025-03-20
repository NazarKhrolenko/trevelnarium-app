const slides =  document.querySelectorAll('.slider img');
let slideindex = 0; 
let intervalId = null;


//slider
document.addEventListener("DOMContentLoaded",initializeSlider);

function initializeSlider(){
    
    if(slides.length > 0) {
        slides[slideindex].classList.add("displaySlide");
        intervalId = setInterval(nextSlide, 1000);
    }
    
};

function showSlide(index){

    if( index >= slides.length )
    {
        slideindex = 0;
    }
    else if( index < 0 )
    {
        slideindex = slides.length -1;
    }
    slides.forEach( slide => {
        slide.classList.remove("displaySlide");
       });
    slides[slideindex].classList.add("displaySlide")
}
function nextSlide(){
    slideindex++;
    showSlide(slideindex);
    
}
function prevSlide(){
    clearInterval(intervalId);
    slideindex--;
    showSlide(slideindex);

}

//Button 

const addTripButton = document.querySelector('.addTripButton .btn');


addTripButton.addEventListener('click', function(){
    window.location.href = "processPage.html";
})


/******************************************************************************************* */

const parallax_el = document.querySelectorAll(".parallax");

let xValue = 0,
yValue = 0;

let rotateDegree = 0;

function update (cursorPosition) {
    parallax_el.forEach((el) => {
        let speedx = el.dataset.speedx;
        let speedy = el.dataset.speedy;
        let speedz = el.dataset.speedz
        let rotateSpeed = el.dataset.rotation;
    
        let isInLeft =
        parseFloat(getComputedStyle(el).left) < window.innerWidth / 2 ? 1 : -1; 
    
        let zValue = (cursorPosition - parseFloat(getComputedStyle(el).left)) * isInLeft * 0.1;
        
    
        el.style.transform= `translateX(calc(-50% + ${-xValue * speedx}px)) 
        translateY(calc(-50% + ${yValue * speedy}px))
        perspective(2300px) translateZ(${zValue * speedz}px)
        rotateY(${rotateDegree * rotateSpeed}deg)`;
     });
}

update(0);
window.addEventListener("mousemove",(e)=>{
 xValue =e.clientX - window.innerWidth/2;
 yValue = e.clientY - window.innerHeight/2;
 
    rotateDegree = (xValue /(window.innerWidth / 2)) *20 ;

update(e.clientX); 
})


/*GSAP************************/


// let timeline = gsap.timeline();

// Array.from(parallax_el).filter(el => !el.classList.contains("text"))
// .forEach(el =>{
// timeline.from(el,{
//         top:`${el.offsetHeight / 2 + +el.dataset.distance}px`,
//         duration:3.5,
//     },
//     "1"
//     )
// })