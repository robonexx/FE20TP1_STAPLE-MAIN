// Quire - **Rough** functional draft

const titleInput = document.querySelector("#title-input");
const newNoteBtn = document.querySelector("#new-note-btn");
const deleteNoteBtn = document.querySelector("#delete-note-btn");
const printNoteBtn = document.querySelector("#print-note-btn");
const logoBtn = document.querySelector("#logo-btn");
const favoriteBtn = document.querySelector("#favorite-btn");
const noteList = document.querySelector("#note-list");
const msgContainer = document.querySelector('#content');

let noteListArray;
let activeObjId;

let favoriteTrueString;
let favoriteFalseString;

let windowSize;

class NoteConstructor {
    constructor() {
        this.title = "Untitled"
        this.body = "";
        this.tags = [];
        this.favorite = false;
        this.id = Date.now();
        this.date = getDate(); // maybe redundant, and fix locale
    }
}

window.addEventListener("load", function() {
    if (localStorage.getItem("noteListKey")) {
        noteListArray = JSON.parse(localStorage.getItem("noteListKey"));
        for (let i = 0; i < noteListArray.length; i++) {
            renderNote(noteListArray[i]);
            if (i == noteListArray.length - 1) {
                viewNote(noteListArray[i]);
            }
        }
    } else {
        noteListArray = [];
        newNote();
    }  
});

checkWindowSize();

window.addEventListener("resize", function(){
    checkWindowSize();
});

titleInput.addEventListener("input", function() {
    saveNote();
});

newNoteBtn.addEventListener("click", function() {
    newNote();
});

deleteNoteBtn.addEventListener("click", function() {
    if (confirm(`Are you sure you want to delete "${document.title.slice(8)}?"`)) { // not best way to get title
        deleteNote();
    }
});

printNoteBtn.addEventListener("click", function() {
    window.print();
});

logoBtn.addEventListener("click", function() {
    showAllNotes();
});

favoriteBtn.addEventListener("click", function() {
    filterFavorite();
});

// newNote() --> Creates a new note, and pushes it to the array

function newNote() {
    let note = new NoteConstructor();
    noteListArray.push(note);

    tinymce.get("body-text-area").focus();

    renderNote(note);
    viewNote(note);
}

// renderNote(obj) --> Shows the note in the note list

function renderNote(obj) {
    let noteItem = document.createElement("li");
    noteItem.classList.add("note-list-item");
	
	let plainTextBody = obj.body.replace(/<(\S*?)[^>]*>.*?|<.*? \/>/g, ""); // fix line-break removal ellipsis
    plainTextBody = plainTextBody.replaceAll("&nbsp;", " ");

    favoriteTrueString = `<div class="note-wrapper"> <div class="content-wrapper"> <h3>${obj.title}</h3> <p>${plainTextBody}</p> </div> <div class="info-wrapper"> <div class="tag-wrapper"> <p>#fe2020</p> </div> <div class="date-wrapper"> <p>${obj.date}</p> </div> </div> </div> <div class="toolbar-wrapper"><button><i class="fas fa-star"></i></button></i></button></div>`;
    favoriteFalseString = `<div class="note-wrapper"> <div class="content-wrapper"> <h3>${obj.title}</h3> <p>${plainTextBody}</p> </div> <div class="info-wrapper"> <div class="tag-wrapper"> <p>#fe2020</p> </div> <div class="date-wrapper"> <p>${obj.date}</p> </div> </div> </div> <div class="toolbar-wrapper"><button><i class="far fa-star"></i></button></i></button></div>`;
    noteItem.innerHTML = checkState(obj.favorite);

    noteItem.setAttribute("data-id", obj.id);
    noteList.insertBefore(noteItem, noteList.firstChild);

    noteItem.addEventListener("click", function(evt) {
        if (evt.target.closest("i")) {
            if (evt.target.classList.contains("far")) { // perhaps change to toggle
                evt.target.classList.remove("far");
                evt.target.classList.add("fas");
                obj.favorite = true;
            } else if (evt.target.classList.contains("fas")) {
                evt.target.classList.remove("fas");
                evt.target.classList.add("far");
                obj.favorite = false;
            }

            localStorage.setItem("noteListKey", JSON.stringify(noteListArray));
            
        } else {
            viewNote(obj);

            let noteEditor = document.querySelector(".note-editor");
            let logoBtn = document.querySelector("#logo-btn");
            let backBtn = document.querySelector("#back-btn");
            
            if (windowSize == "landscape") {
                console.log("do nothing?");
            } else if (windowSize == "portrait") {
                noteEditor.style.display = "flex";
                noteList.style.display = "none";
                logoBtn.style.display = "none";
                backBtn.classList.add("visible");
                backBtn.addEventListener("click", function() {
                    noteEditor.style.display = "none";
                    noteList.style.display = "flex";
                    logoBtn.style.display = "flex";
                    backBtn.classList.remove("visible");
                });
            }
        }
    });
}

// viewNote(obj) --> Loads the note data into the input fields

function viewNote(obj) {
    titleInput.value = obj.title;
    tinymce.get("body-text-area").setContent(obj.body);

    document.title = `Quire - ${obj.title}`;

    activeObjId = obj.id;

    setActiveItem(obj);
}

// saveNote() --> Finds the active note in the array, updates the data, and then saves it to local storage

function saveNote() {
    for (let i = 0; i < noteListArray.length; i++) {
        if (noteListArray[i].id == activeObjId) {
			noteListArray[i].title = titleInput.value;
			noteListArray[i].body = tinymce.get("body-text-area").getContent();

			let plainTextBody = tinymce.get("body-text-area").getContent({ format: "text" }); // fix line-break removal ellipsis
			
			let noteItem = document.querySelector([`[data-id="${noteListArray[i].id}"]`]);
            if (noteListArray[i].favorite) { // fix similar to the other one, when variable-issues are solved
                noteItem.innerHTML = `<div class="note-wrapper"> <div class="content-wrapper"> <h3>${noteListArray[i].title}</h3> <p>${plainTextBody}</p> </div> <div class="info-wrapper"> <div class="tag-wrapper"> <p>#fe2020</p> </div> <div class="date-wrapper"> <p>${noteListArray[i].date}</p> </div> </div> </div> <div class="toolbar-wrapper"><button><i class="fas fa-star"></i></button></i></button></div>`;
            } else {
                noteItem.innerHTML = `<div class="note-wrapper"> <div class="content-wrapper"> <h3>${noteListArray[i].title}</h3> <p>${plainTextBody}</p> </div> <div class="info-wrapper"> <div class="tag-wrapper"> <p>#fe2020</p> </div> <div class="date-wrapper"> <p>${noteListArray[i].date}</p> </div> </div> </div> <div class="toolbar-wrapper"><button><i class="far fa-star"></i></button></i></button></div>`;
            }

            document.title = `Quire - ${noteListArray[i].title}`;
            
            localStorage.setItem("noteListKey", JSON.stringify(noteListArray)); // maybe not save empty objects in the array
        }
    }
}

// deleteNote() --> Finds the active note in the array and deletes it

function deleteNote() {
    for (let i = 0; i < noteListArray.length; i++) {
        if (noteListArray[i].id == activeObjId) {

            if (noteListArray.length > 1 && i == noteListArray.length - 1) {
                viewNote(noteListArray[i - 1]);
            } else if (noteListArray.length > 1) {
                viewNote(noteListArray[i + 1]);
            }

            let noteItem = document.querySelector([`[data-id="${noteListArray[i].id}"]`]);
            noteItem.remove();

            noteListArray.splice(i, 1);
            localStorage.setItem("noteListKey", JSON.stringify(noteListArray));
        }
    }
    if (noteListArray.length == 0) {
        localStorage.removeItem("noteListKey");
        newNote();
    }
}

/* NON-EDITOR CODE */

// Miscellaneous

function getDate() {
    let dateObj = new Date();
    let day = dateObj.getDate();
    let month = dateObj.getMonth() + 1;
    let year = dateObj.getFullYear();

    return `${day}/${month}-${year}`;
}

function setActiveItem(obj) {
    let noteListItems = document.querySelectorAll('.note-list-item');
    for (let i = 0; i < noteListItems.length; i++) {
        if (noteListItems[i].getAttribute("data-id") == obj.id) {
            noteListItems[i].classList.add("active");  
        } else {
            noteListItems[i].classList.remove("active");
        }
    }
}

function filterFavorite() {
    for (let i = 0; i < noteListArray.length; i++) {
        if (!noteListArray[i].favorite) {
            let noteItem = document.querySelector([`[data-id="${noteListArray[i].id}"]`]);
            noteItem.style.display = "none";  
        }

        let noteListItems = document.querySelectorAll('.note-list-item');
        let count = 0;
        for (let i = 0; i < noteListItems.length; i++) {
            if (noteListItems[i].style.display == "none") {
                count += 1;
            }
        }
        
        if (noteListItems.length == count) {
            let emptyState = document.createElement("li");
            emptyState.classList.add("note-list-item");
            emptyState.classList.add("empty-state");
            emptyState.innerHTML = "No favorite notes :(";
            noteList.appendChild(emptyState);
        }
    }
}


//////////////////////////////////////////////////////////////////////////////////
// Light & Dark Theme

var checkbox = document.querySelector('input[name=onoffswitch]');

checkbox.addEventListener('change', function() {
    if(this.checked) {
       
        document.documentElement.setAttribute('data-theme', 'dark')
    } else {
       
        document.documentElement.setAttribute('data-theme', 'light')
    }
})





/* Selector for modal container */




//         if (noteListItems.length == count) {
//             let emptyState = document.createElement("li");
//             emptyState.classList.add("note-list-item");
//             emptyState.classList.add("empty-state");
//             emptyState.innerHTML = "No favorite notes :(";
//             noteList.appendChild(emptyState);
//         }
//     }
// }

function showAllNotes() {
    let noteListItems = document.querySelectorAll('.note-list-item');
    for (let i = 0; i < noteListItems.length; i++) {
        if (noteListItems[i].style.display == "none") {
            noteListItems[i].style.display = "flex";  
        } else if (noteListItems[i].classList.contains("empty-state")) {
            noteListItems[i].remove();
        }
    }
}

function checkState(boolean) {
    return (boolean ? favoriteTrueString : favoriteFalseString);
}

function checkWindowSize() {
    let xAxis = document.documentElement.clientWidth;
    // let yAxis = document.documentElement.clientHeight;
    let noteEditor = document.querySelector(".note-editor");
    let backBtn = document.querySelector("#back-btn");
	let logoBtn = document.querySelector("#logo-btn");

    if (xAxis > 1000) {
        noteEditor.style.display = "flex";
        noteList.style.display = "flex";
        backBtn.classList.remove("visible");
        logoBtn.style.display = "flex";
        return windowSize = "landscape";

    } else if (xAxis <= 1000 && windowSize != "portrait") {
        noteEditor.style.display = "none";
        return windowSize = "portrait";
    }
}
