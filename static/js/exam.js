document.addEventListener("DOMContentLoaded", () => {
    let queue = [...VOCAB_LIST];         // Main queue
    let incorrectQueue = [];             // To revisit
    let current = null;

    addLinkButton();

    const questionText = document.getElementById("question-text");
    const answerText = document.getElementById("answer-text");
    const answerBox = document.getElementById("answer-box");
    const showAnswerBtn = document.getElementById("show-answer-btn");
    const correctBtn = document.getElementById("correct-btn");
    const incorrectBtn = document.getElementById("incorrect-btn");
    const progressBar = document.getElementById("progress-bar");

    // Helper function to color jyutping
    function formatJyutping(jyutping) {
        return jyutping.replace(/([1-6])\b/g, (match, tone) => {
            return `<span class="jyutping-number-${tone}">${tone}</span>`;
        });
    }

    // From https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function updateProgress() {
        const total = VOCAB_LIST.length;
        const asked = total - queue.length - incorrectQueue.length;
        const percent = Math.round((asked / total) * 100);
        progressBar.value = percent;
        progressBar.textContent = `${percent}%`;
    }

    function playSound(mp3_id) {
        const audio = new Audio(`/static/audio/${mp3_id}.mp3`);
        audio.play().catch(error => {
            console.error('Audio playback failed:', error);
        });
    }

    function nextQuestion() {
        updateProgress();

        if (queue.length === 0 && incorrectQueue.length > 0) {
            queue = [...incorrectQueue];
            incorrectQueue = [];
            shuffleArray(queue);
        }

        if (queue.length === 0) {
            questionText.textContent = "Exam complete!";
            answerBox.style.display = "none";
            showAnswerBtn.style.display = "none";
            return;
        }

        current = queue.shift();
        showAnswerBtn.style.display = 'inline-block';
        answerBox.style.display = "none";
        answerText.textContent = "";

        if (DISPLAY_MODE === "english") {
            questionText.textContent = current.english;
        } else {
            questionText.innerHTML = `${current.cantonese} (${formatJyutping(current.jyutping)})`;
            playSound(current.mp3_id);
        }
    }

    showAnswerBtn.addEventListener("click", () => {
        if (DISPLAY_MODE === "english") {
            answerText.innerHTML = `${current.cantonese} (${formatJyutping(current.jyutping)})`;
            playSound(current.mp3_id);
        } else {
            answerText.textContent = current.english;
        }
        showAnswerBtn.style.display = 'none';
        answerBox.style.display = "block";
    });

    correctBtn.addEventListener("click", () => {
        nextQuestion();
    });

    incorrectBtn.addEventListener("click", () => {
        incorrectQueue.push(current);
        nextQuestion();
    });

    // Adding in keyboard shortcuts for buttons 
    document.addEventListener("keydown", (e) => {

        // Prevent interfering with typing in form fields
        if (e.target.matches("input, textarea")) {
            return;
        }
        switch (e.key) {
            case "Enter":
                if (answerBox.style.display === "none") {
                    showAnswerBtn.click();
                } else {
                    correctBtn.click()
                }
                break;
            case "Shift":
            case "'":
            case "@":
                if (answerBox.style.display === "none") {
                    showAnswerBtn.click();
                } else {
                    incorrectBtn.click()
                }
                break;
        }
    });

    shuffleArray(queue);
    nextQuestion();
});


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

// Redirecting to main page with correct params
function addLinkButton() {
    document.querySelectorAll(".index-link").forEach(link => {
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


// Reloading the page when checkbox is ticked
Array.from(document.getElementsByClassName('tag-checkbox')).forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
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
    })
})


// Reloading page when language is toggled
Array.from(document.getElementsByClassName('language-checkbox')).forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
        const language = document.getElementById("language-selector").elements["language"].value;

        const url = new URL(window.location);
        if (language === "cantonese") {
            url.searchParams.set("display_mode", "cantonese")
        } else {
            url.searchParams.set("display_mode", "english")
        }

        refreshPage(url);
    })
})
