// Helper function to toggle the visibility of a column
function updateColumnVisibility(columnIndex, isVisible) {
    const table = document.getElementById('main-table');
    const rows = table.querySelectorAll('tr');

    rows.forEach((row) => {
        const cell = row.children[columnIndex - 1]; // Adjust for 0-based index
        if (cell) {
            const cell_spans = cell.querySelectorAll('span');
            if (isVisible) {
                // Reveals cell if desired behavior
                cell.classList.remove('hidden');
                cell_spans.forEach((span) => {
                    span.classList.remove('hidden');
                });
            } else {
                // Otherwise hides cell
                cell.classList.add('hidden');
                cell_spans.forEach((span) => {
                    span.classList.add('hidden');
                });
            }
        }
    });
}

// For different visibility toggles
document.querySelector('.toggle-container').addEventListener('change', (event) => {
    const selectedValue = event.target.value;

    switch (selectedValue) {
        case 'all':
            updateColumnVisibility(1, true);
            updateColumnVisibility(2, true);
            updateColumnVisibility(3, true);
            break;
        case 'english':
            updateColumnVisibility(1, false);
            updateColumnVisibility(2, false);
            updateColumnVisibility(3, true);
            break;
        case 'cantonese':
            updateColumnVisibility(1, true);
            updateColumnVisibility(2, true);
            updateColumnVisibility(3, false);
            break;
    }
});

// Event delegation for revealing individual cells
document.getElementById('main-table').addEventListener('click', (event) => {
    if (event.target.tagName === 'TD' && event.target.classList.contains('hidden')) {
        // Reveal clicked cell
        event.target.classList.remove('hidden');
    }
});

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
document.getElementById('add-button').addEventListener('click', function () {
    const requestBody = {
        cantonese: document.getElementById('cantonese-input').value,
        jyutping: document.getElementById('jyutping-input').value,
        english: document.getElementById('english-input').value
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
            window.location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Reloading the page when checkbox is ticked
Array.from(document.getElementsByClassName('tag-checkbox')).forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
        console.log('HEREEEE')
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

        window.location.href = url;
    })
})
