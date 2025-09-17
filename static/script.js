document.addEventListener("DOMContentLoaded", () => {
    let params = new URLSearchParams(document.location.search);
    let selectedTags = (params.get("tags") || "").split(",").filter(e => e !== '');

    loadTags(selectedTags);
    loadTable(selectedTags);
    addLink();
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
                tr = createRow(phrase["vocab_id"], phrase["cantonese"], phrase["jyutping"], phrase["english"], phrase["mp3_id"])
                tableBody.insertBefore(tr, addPhraseRow)
            }
        });
}

// Redirecting to main page with correct params
function addLink() {
    document.querySelectorAll(".exam-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault(); // Stop normal link behavior
            e.stopPropagation(); // Stop any other handlers

            const currentUrl = new URL(window.location.href);
            const tags = currentUrl.searchParams.get("tags");

            const newUrl = new URL(link.href, window.location.origin);

            // Set ONLY the "tags" query param
            if (tags) {
                newUrl.searchParams.set("tags", tags);
            }

            // Overwrite the href
            window.location.href = newUrl.toString();
        })
    });
}

function createRow(vocab_id, cantonese, jyutping, english, mp3_id) {
    const tr = document.createElement("tr");
    const rowId = `tr-${crypto.randomUUID()}`;
    tr.id = rowId;
    tr.dataset.vocab_id = vocab_id;  // Store vocab_id if necessary

    // Adding Cantonese
    const canto_td = document.createElement("td");
    canto_td.textContent = cantonese;
    var update_jyutping_func = () => updateJyutping(tr);
    canto_td.addEventListener('input', update_jyutping_func);
    tr.appendChild(canto_td);

    // Adding Jyutping
    const jyut_td = document.createElement("td");
    jyut_td.dataset.raw = jyutping;  // Store raw text for edit mode
    jyut_td.innerHTML = jyutping.replace(/\d+/g, (match) => {
        return `<span class="jyutping-number-${match}">${match}</span>`
    });
    tr.appendChild(jyut_td);

    // Adding English
    const english_td = document.createElement("td");
    english_td.textContent = english;
    tr.appendChild(english_td);

    // Adding MP3 play button
    const mp3_id_td = document.createElement("td");

    const play_button = document.createElement("button");
    var play_func = () => playAudio(mp3_id);
    play_button.className = "table-button";
    play_button.textContent = "🔊";
    play_button.onclick = play_func;

    mp3_id_td.appendChild(play_button);

    if (mp3_id) {
        const audio = document.createElement("audio");
        audio.preload = "none";
        audio.id = "audio-" + mp3_id
        audio.src = "/static/audio/" + mp3_id + ".mp3";

        mp3_id_td.appendChild(audio);
    }

    tr.appendChild(mp3_id_td);

    // Adding edit row button
    const edit_row_td = document.createElement("td");

    const edit_button = document.createElement("button");
    var edit_func = () => editRow(tr);
    edit_button.className = "table-button";
    edit_button.textContent = "✏️";
    edit_button.onclick = edit_func;

    edit_row_td.appendChild(edit_button);
    tr.appendChild(edit_row_td)

    // Adding delete row button
    const delete_row_td = document.createElement("td");

    const delete_button = document.createElement("button");
    var delete_func = () => deleteRow(tr);
    delete_button.className = "table-button";
    delete_button.textContent = "🗑️";
    delete_button.onclick = delete_func;

    delete_row_td.appendChild(delete_button);
    tr.appendChild(delete_row_td)


    return tr
}

// Function for creating empty row when button clicked
document.getElementById('add-button').addEventListener('click', function () {
    tr = createRow("", "", "", "", null);

    const tableBody = document.getElementById("main-table-body");
    const addPhraseRow = document.getElementById("add-phrase-tr");
    tableBody.insertBefore(tr, addPhraseRow);

    editRow(tr);

    window.scrollTo(0, document.body.scrollHeight);
});

// Helper function for reloading the top bar
function refreshTopBar(selectedTags) {
    const tagScroll = document.getElementById("tagScroll");
    while (tagScroll.firstChild) {
        tagScroll.removeChild(tagScroll.firstChild);
    }

    loadTags(selectedTags);
}

// Helper function for reloading the table and preserving the scroll location
function refreshTable(selectedTags) {
    sessionStorage.setItem('scrollpos', window.scrollY);

    const tableBody = document.getElementById("main-table-body");
    const rows = Array.from(tableBody.rows);

    for (let i = 0; i < rows.length - 1; i++) {
        tableBody.removeChild(rows[i]);
    }

    loadTable(selectedTags);
}

// For editing existing rows
function editRow(tr) {
    const cells = tr.querySelectorAll("td");
    const vocab_id = tr.dataset.vocab_id;

    if (cells[4].firstChild.textContent === "💾") {
        const cantonese = cells[0].textContent;
        const jyutping = cells[1].textContent;
        const english = cells[2].textContent;

        cells[0].contentEditable = "false";
        cells[1].contentEditable = "false";
        cells[2].contentEditable = "false";
        cells[4].firstChild.textContent = "✏️";

        cells[1].dataset.raw = jyutping;
        cells[1].innerHTML = jyutping.replace(/\d+/g, (match) => {
            return `<span class="jyutping-number-${match}">${match}</span>`
        });

        const checkboxes = document.getElementsByClassName('tag-checkbox');
        const selectedTags = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value)

        const requestBody = {
            cantonese: cantonese,
            jyutping: jyutping,
            english: english,
            tags: selectedTags
        }

        const method = vocab_id === "" ? 'POST' : 'PATCH';
        const url = vocab_id === "" ? 'http://localhost:8000/vocabulary' : 'http://localhost:8000/vocabulary/' + vocab_id;

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }

                return response.json()
            }).then(json => {
                if (vocab_id == null) {
                    tr.dataset.vocab_id = json['vocab_id'];

                    // Adding audio (if successful)
                    var play_func = () => playAudio(mp3_id);
                    cells[3].onclick = play_func;

                    if (mp3_id) {
                        const audio = document.createElement("audio");
                        audio.preload = "none";
                        audio.id = "audio-" + json['mp3_id'];
                        audio.src = "/static/audio/" + json['mp3_id'] + ".mp3";

                        cells[3].appendChild(audio);
                    }

                }
            });
    }
    else {
        cells[0].contentEditable = "true";
        cells[1].contentEditable = "true";
        cells[1].innerHTML = cells[1].dataset.raw;
        cells[2].contentEditable = "true";
        cells[4].firstChild.textContent = "💾";
    }
}

// Function for deleting a row
function deleteRow(tr) {
    const vocab_id = tr.dataset.vocab_id;
    if (vocab_id) {
        fetch('http://localhost:8000/vocabulary/' + vocab_id, { method: 'delete' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
            });
    }
    tr.remove();
}

// For dynamically populating jyutping
function updateJyutping(tr) {
    const cells = tr.querySelectorAll("td");
    cantoneseCharacters = cells[0].innerHTML;

    // Only make a request if there's input value
    if (cantoneseCharacters) {
        fetch(`http://localhost:8000/jyutping?characters=${cantoneseCharacters}`)
            .then(response => response.json()) // Assume JSON response
            .then(data => {
                // Check if the response contains the 'foo' key
                if (data.jyutping) {
                    cells[1].textContent = data.jyutping;
                }
            })
            .catch(error => {
                // If error then don't try and change what's in the box
                console.error('Error fetching data:', error);
            });
    }
}

// For playing audio
function playAudio(mp3_id) {
    if (!mp3_id) {
        console.log("No audio found, skipping...");
        return
    }
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
    const checkboxes = document.getElementsByClassName('tag-checkbox');
    const selectedTags = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value)

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
            refreshTopBar(selectedTags);
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
    history.pushState({}, "", url);

    refreshTable(selectedTags);
}
