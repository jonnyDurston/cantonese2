document.addEventListener("DOMContentLoaded", () => {
    let queue = [...VOCAB_LIST];         // Main queue
    let incorrectQueue = [];             // To revisit
    let current = null;

    const questionText = document.getElementById("question-text");
    const answerText = document.getElementById("answer-text");
    const answerBox = document.getElementById("answer-box");
    const showAnswerBtn = document.getElementById("show-answer-btn");
    const correctBtn = document.getElementById("correct-btn");
    const incorrectBtn = document.getElementById("incorrect-btn");

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

    function nextQuestion() {
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
        answerBox.style.display = "none";
        answerText.textContent = "";

        if (DISPLAY_MODE === "english") {
            questionText.textContent = current.english;
        } else {
            questionText.innerHTML = `${current.cantonese} (${formatJyutping(current.jyutping)})`;
        }
    }

    showAnswerBtn.addEventListener("click", () => {
        if (DISPLAY_MODE === "english") {
            answerText.innerHTML = `${current.cantonese} (${formatJyutping(current.jyutping)})`;
        } else {
            answerText.textContent = current.english;
        }
        answerBox.style.display = "block";
    });

    correctBtn.addEventListener("click", () => {
        nextQuestion();
    });

    incorrectBtn.addEventListener("click", () => {
        incorrectQueue.push(current);
        nextQuestion();
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