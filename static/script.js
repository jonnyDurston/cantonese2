document.addEventListener("DOMContentLoaded", () => {
    let params = new URLSearchParams(document.location.search);
    let selectedTags = params.get("tags").split(",");

    loadTags(selectedTags);
    loadTable(selectedTags);
    restoreScrollPos();
})

function loadTags(selectedTags) {
    fetch('http://localhost:8000/tags').then(response => response.json()).then(tags => {
        const tagScroll = document.getElementById('tagScroll');

        for (let tag of tags) {
            const tagName = tag["tag_name"];

            const tagLabel = document.createElement("label");
            tagLabel.className = "tag-item";
            tagLabel.textContent = " " + tagName;

            const tagInput = document.createElement("input");
            tagInput.className = "tag-checkbox";
            tagInput.type = "checkbox";
            tagInput.value = tagName;
            if (selectedTags.includes(tagName)) {
                tagInput.checked = true;
            }
            tagInput.addEventListener('change', tagChangeReload)

            tagLabel.appendChild(tagInput);

            tagScroll.appendChild(tagLabel);
        }
    });
}

function loadTable(selectedTags) {
    const addPhraseRow = document.getElementById("add-phrase-tr")

    fetch('http://localhost:8000/vocabulary?' + new URLSearchParams({ tags: selectedTags.join(",") }))
        .then(response => response.json())
        .then(vocabulary => {
            const tableBody = document.getElementById("main-table-body");

            for (let phrase of vocabulary) {
                const tr = document.createElement("tr");

                // Adding Cantonese
                const canto_td = document.createElement("td");
                canto_td.textContent = phrase["cantonese"];
                tr.appendChild(canto_td);

                // Adding Jyutping
                const jyut_td = document.createElement("td");
                jyut_td.innerHTML = phrase["jyutping"].replace(/\d+/g, (match) => {
                    return `<span class="jyutping-number-${match}">${match}</span>`
                });
                tr.appendChild(jyut_td);

                // Adding English
                const english_td = document.createElement("td");
                english_td.textContent = phrase["english"];
                tr.appendChild(english_td);

                // Adding MP3 play button (if applicable)
                if (phrase["mp3_id"]) {
                    const mp3_id_td = document.createElement("td");

                    const play_button = document.createElement("button");
                    var play_func = () => playAudio(phrase["mp3_id"]);
                    play_button.className = "table-button";
                    play_button.textContent = "🔊";
                    play_button.onclick = play_func;

                    const audio = document.createElement("audio");
                    audio.preload = "none";
                    audio.id = "audio-" + phrase["mp3_id"]
                    audio.src = "/static/audio/" + phrase["mp3_id"] + ".mp3";

                    mp3_id_td.appendChild(play_button);
                    mp3_id_td.appendChild(audio);
                    tr.appendChild(mp3_id_td);
                }

                tableBody.insertBefore(tr, addPhraseRow)
            }
        });
}


// Helper function for reloading the page and preserving the scroll location
function refreshPage(url = null) {
    sessionStorage.setItem('scrollpos', window.scrollY);
    if (url) {
        window.location.href = url;
    } else {
        const currentUrl = new URL(window.location.href);
        window.location.href = currentUrl.toString();
    }
}

// Ensuring that on reload we go to the desired scroll position if necessary
function restoreScrollPos() {
    var scrollpos = sessionStorage.getItem('scrollpos');
    if (scrollpos) {
        window.scrollTo(0, scrollpos);
        sessionStorage.removeItem('scrollpos')
    }
}


// Getting jyutping from backend and populating input
document.getElementById('cantonese-input').addEventListener('input', function () {
    const cantoneseCharacters = this.value;

    // Only make a request if there's input value
    if (cantoneseCharacters) {
        fetch(`http://localhost:8000/jyutping?characters=${cantoneseCharacters}`)
            .then(response => response.json()) // Assume JSON response
            .then(data => {
                // Check if the response contains the 'foo' key
                if (data.jyutping) {
                    document.getElementById('jyutping-input').value = data.jyutping;
                }
            })
            .catch(error => {
                // If error then don't try and change what's in the box
                console.error('Error fetching data:', error);
            });
    }
});

// Inserting row when button clicked
document.getElementById('add-button').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent form submission

    const checkboxes = document.getElementsByClassName('tag-checkbox');
    const selectedTags = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value)
    const requestBody = {
        cantonese: document.getElementById('cantonese-input').value,
        jyutping: document.getElementById('jyutping-input').value,
        english: document.getElementById('english-input').value,
        tags: selectedTags
    }

    fetch('http://localhost:8000/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            // Reload the page while preserving the query parameters
            refreshPage();
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// For playing audio
function playAudio(mp3_id) {
    const player = document.getElementById("audio-" + mp3_id);
    if (player) {
        console.log("Playing audio...")
        player.play();
    }
}


// Adding tag when button clicked
document.getElementById('addTagBtn').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent form submission

    const requestBody = {
        tag_name: document.getElementById('newTagInput').value,
    }

    fetch('http://localhost:8000/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            // Reload the page while preserving the query parameters
            refreshPage();
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Reloading the page when checkbox is ticked
function tagChangeReload() {
    const checkboxes = document.getElementsByClassName('tag-checkbox');
    const selectedTags = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value)

    const url = new URL(window.location);
    if (selectedTags.length > 0) {
        url.searchParams.set('tags', selectedTags.join(','));
    } else {
        url.searchParams.delete('tags');
    }

    refreshPage(url);
}