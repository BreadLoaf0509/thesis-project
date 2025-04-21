// search bar

const searchWrapper = document.querySelector(".search-bar");
const inputBox = searchWrapper.querySelector("input");
const drug_list = searchWrapper.querySelector(".drug-list");

inputBox.onkeyup = (e) => {
    let userData = e.target.value;
    let emptyArray = [];
    if (userData) {
        emptyArray = auto_complete.filter((data) => {
            return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
        });
        emptyArray = emptyArray.map((data) => {
            return data = `<li>${data}</li>`;
        });
        searchWrapper.classList.add("active");
        showDrugList(emptyArray);

        let allList = drug_list.querySelectorAll("li");
        for (let i = 0; i < allList.length; i++) {
            allList[i].setAttribute("onclick", "select(this)");
        }
    }
    else {
        searchWrapper.classList.remove("active");
    }
}

function select(element) {
    let selectedUserData = element.textContent;
    inputBox.value = selectedUserData;
    searchWrapper.classList.remove("active");
}

function showDrugList(list) {
    let listData;
    if (!list.length) {
        userValue = inputBox.value;
        listData = `<li>${userValue}</li>`;
    }
    else {
        listData = list.join('');
    }

    drug_list.innerHTML = listData;
}

// modal

const open = document.getElementById("open");
const modal_container = document.getElementById("modal_container");
const close = document.getElementById("close");
const modalTitle = document.querySelector("#modal-title");

const tabActive = document.querySelector(".tabs");
const loaderActive = document.querySelector(".loader");

let loading;

open.addEventListener('click', () => {
    modalTitle.textContent = "You searched for: " + inputBox.value;
    modal_container.classList.add('show');

    // Reset progress bar and start animation
    count = 0;
    per = 0;
    progress.style.width = "0px"; // Reset progress bar width
    loading = setInterval(animate, 50); // Start the animation
});

close.addEventListener('click', () => {
    modal_container.classList.remove('show');

    // Stop and reset the animation
    clearInterval(loading); // Stop the interval
    count = 0;
    per = 0;
    progress.style.width = "0px"; // Reset progress bar width

    loaderActive.classList.add("active");
    tabActive.classList.remove("active");
});

// progress bar

var progress = document.querySelector(".progress");
var text = document.querySelector(".text");

var count = 0; // Start at 0%
var per = 0;   // Start at 0px

// var loading = setInterval(animate, 50);

function animate() {
  if ((count == 100) & (per == 600)) {
    text.classList.remove("text-blink");
    loaderActive.classList.remove("active");
    tabActive.classList.add("active");
  } else {
    text.classList.add("text-blink");
    per = per + 6;
    count = count + 1;
    progress.style.width = per + "px";
  }
}