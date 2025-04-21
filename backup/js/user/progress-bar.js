var percent = document.querySelector('.percent');
var progress = document.querySelector('.progress');
var text = document.querySelector('.text');

var count = 4;
var per = 16;
var loading = setInterval(animate, 50);

function animate(){
    if(count == 100 & per == 400){
        text.classList.remove("text-blink");
        clearInterval(loading);
    }else{
        text.classList.add("text-blink");
        per = per + 4;
        count = count + 1;
        progress.style.width = per + 'px';
        percent.textContent = count + '%';
    }
}