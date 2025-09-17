document.addEventListener("DOMContentLoaded", () => {
    let params = new URLSearchParams(document.location.search);
    let selectedTags = (params.get("tags") || "").split(",").filter(e => e !== '');

    loadTags(selectedTags);
    loadTable(selectedTags);
    addLink();
})

function loadTags(selectedTags) {
    fetch('http://localhost:8000/tags').then(response => response.json()).then(tags => {
        const tagScroll = document.getElementById('tag-scroll');

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

function createRow(vocabId, cantonese, jyutping, english, mp3Id) {
    const tr = document.createElement("tr");
    const rowId = `tr-${crypto.randomUUID()}`;
    tr.id = rowId;
    tr.dataset.vocabId = vocabId;  // Store vocabId if necessary

    // Adding Cantonese
    const cantoTd = document.createElement("td");
    cantoTd.textContent = cantonese;
    var updateJyutpingFunc = () => updateJyutping(tr);
    cantoTd.addEventListener('input', updateJyutpingFunc);
    tr.appendChild(cantoTd);

    // Adding Jyutping
    const jyutTd = document.createElement("td");
    jyutTd.dataset.raw = jyutping;  // Store raw text for edit mode
    jyutTd.innerHTML = jyutping.replace(/\d+/g, (match) => {
        return `<span class="jyutping-number-${match}">${match}</span>`
    });
    tr.appendChild(jyutTd);

    // Adding English
    const englishTd = document.createElement("td");
    englishTd.textContent = english;
    tr.appendChild(englishTd);

    // Adding MP3 play button
    const mp3IdTd = document.createElement("td");

    const playButton = document.createElement("button");
    var playFunc = () => playAudio(mp3Id);
    playButton.className = "table-button";
    playButton.textContent = "🔊";
    playButton.onclick = playFunc;

    mp3IdTd.appendChild(playButton);

    if (mp3Id) {
        const audio = document.createElement("audio");
        audio.preload = "none";
        audio.id = "audio-" + mp3Id
        audio.src = "/static/audio/" + mp3Id + ".mp3";

        mp3IdTd.appendChild(audio);
    }

    tr.appendChild(mp3IdTd);

    // Adding edit row button
    const editRowTd = document.createElement("td");

    const editButton = document.createElement("button");
    var editFunc = () => editRow(tr);
    editButton.className = "table-button";
    editButton.textContent = "✏️";
    editButton.onclick = editFunc;

    editRowTd.appendChild(editButton);
    tr.appendChild(editRowTd)

    // Adding delete row button
    const deleteRowTd = document.createElement("td");

    const deleteButton = document.createElement("button");
    var deleteFunc = () => deleteRow(tr);
    deleteButton.className = "table-button";
    deleteButton.textContent = "🗑️";
    deleteButton.onclick = deleteFunc;

    deleteRowTd.appendChild(deleteButton);
    tr.appendChild(deleteRowTd)


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
    const tagScroll = document.getElementById("tag-scroll");
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
    const vocabId = tr.dataset.vocabId;

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

        const method = vocabId === "" ? 'POST' : 'PATCH';
        const url = vocabId === "" ? 'http://localhost:8000/vocabulary' : 'http://localhost:8000/vocabulary/' + vocabId;

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
                if (vocabId == null) {
                    tr.dataset.vocabId = json['vocab_id'];

                    // Adding audio (if successful)
                    var playFunc = () => playAudio(json['mp3_id']);
                    cells[3].onclick = playFunc;

                    if (json['mp3_id']) {
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
    const vocabId = tr.dataset.vocabId;
    if (vocabId) {
        fetch('http://localhost:8000/vocabulary/' + vocabId, { method: 'delete' })
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
function playAudio(mp3Id) {
    if (!mp3Id) {
        console.log("No audio found, skipping...");
        return
    }
    const player = document.getElementById("audio-" + mp3Id);
    if (player) {
        console.log("Playing audio...")
        player.play();
    }
}


// Adding tag when button clicked
document.getElementById('add-tag-button').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent form submission

    const requestBody = {
        tagName: document.getElementById('new-tag-input').value,
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
