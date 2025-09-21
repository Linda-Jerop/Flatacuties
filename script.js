// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    
    // Get references to DOM elements
    const animalList = document.getElementById('animal-list');
    const animalDetails = document.getElementById('animal-details');
    const addAnimalForm = document.getElementById('add-animal-form');
    
    // Base URL for our JSON server
    const BASE_URL = 'http://localhost:3000';
    
    // Store current animal and all animals
    let currentAnimal = null;
    let allAnimals = [];

    // CORE DELIVERABLE 1: Fetch and display all animal names
    function fetchAllAnimals() {
        fetch(`${BASE_URL}/characters`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch animals');
                }
                return response.json();
            })
            .then(animals => {
                allAnimals = animals;
                displayAnimalList(animals);
            })
            .catch(error => {
                console.error('Error fetching animals:', error);
                animalList.innerHTML = '<li class="error">❌ Error: Make sure JSON Server is running on port 3000</li>';
            });
    }

    // Display the list of animal names
    function displayAnimalList(animals) {
        animalList.innerHTML = '';
        
        animals.forEach(animal => {
            const listItem = document.createElement('li');
            listItem.textContent = animal.name;
            listItem.className = 'animal-item';
            listItem.dataset.animalId = animal.id;
            
            // CORE DELIVERABLE 2: Click to see animal details
            listItem.addEventListener('click', () => {
                showAnimalDetails(animal.id);
                setActiveAnimal(listItem);
            });
            
            animalList.appendChild(listItem);
        });
    }

    // CORE DELIVERABLE 2: Show animal details when clicked
    function showAnimalDetails(animalId) {
        // Fetch individual animal details
        fetch(`${BASE_URL}/characters/${animalId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch animal details');
                }
                return response.json();
            })
            .then(animal => {
                currentAnimal = animal;
                displayAnimalDetails(animal);
            })
            .catch(error => {
                console.error('Error fetching animal details:', error);
                animalDetails.innerHTML = '<div class="error">Failed to load animal details</div>';
            });
    }

    // Display animal details (image, name, votes)
    function displayAnimalDetails(animal) {
        animalDetails.innerHTML = `
            <div class="animal-card">
                <h3>${animal.name}</h3>
                <img src="${animal.image}" alt="${animal.name}" class="animal-image" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+'">
                <div class="votes-section">
                    <p class="vote-count">🗳️ <span id="current-votes">${animal.votes}</span> votes</p>
                    <div class="button-group">
                        <button id="add-vote-btn" class="vote-btn">Add Vote ❤️</button>
                        <button id="reset-votes-btn" class="reset-btn">Reset Votes 🔄</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for vote buttons
        document.getElementById('add-vote-btn').addEventListener('click', addVote);
        document.getElementById('reset-votes-btn').addEventListener('click', resetVotes);
    }

    // CORE DELIVERABLE 3: Add votes (in-memory only as specified)
    function addVote() {
        if (!currentAnimal) return;

        // Increment votes in memory (no persistence required per assignment)
        currentAnimal.votes += 1;
        
        // Update display
        document.getElementById('current-votes').textContent = currentAnimal.votes;
        
        // Also update the votes in our local array for consistency
        const animalIndex = allAnimals.findIndex(a => a.id === currentAnimal.id);
        if (animalIndex !== -1) {
            allAnimals[animalIndex].votes = currentAnimal.votes;
        }
    }

    // BONUS DELIVERABLE 1: Reset votes
    function resetVotes() {
        if (!currentAnimal) return;

        // Confirm reset action
        if (confirm(`Are you sure you want to reset ${currentAnimal.name}'s votes to 0?`)) {
            // Reset votes in memory
            currentAnimal.votes = 0;
            
            // Update display
            document.getElementById('current-votes').textContent = '0';
            
            // Update local array
            const animalIndex = allAnimals.findIndex(a => a.id === currentAnimal.id);
            if (animalIndex !== -1) {
                allAnimals[animalIndex].votes = 0;
            }
        }
    }

    // Set active animal in list (visual feedback)
    function setActiveAnimal(activeItem) {
        // Remove active class from all items
        document.querySelectorAll('.animal-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item
        activeItem.classList.add('active');
    }

    // BONUS DELIVERABLE 2: Add new animals form
    function handleAddAnimalForm(event) {
        event.preventDefault();
        
        const nameInput = document.getElementById('animal-name');
        const imageInput = document.getElementById('animal-image');
        
        const newAnimal = {
            name: nameInput.value.trim(),
            image: imageInput.value.trim(),
            votes: 0
        };

        // Validate inputs
        if (!newAnimal.name || !newAnimal.image) {
            alert('Please fill in both animal name and image URL');
            return;
        }

        // Post new animal to server
        fetch(`${BASE_URL}/characters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newAnimal)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add animal');
            }
            return response.json();
        })
        .then(addedAnimal => {
            // Success! Refresh the animal list
            fetchAllAnimals();
            
            // Clear form
            nameInput.value = '';
            imageInput.value = '';
            
            // Show success message
            alert(`${addedAnimal.name} has been added successfully! 🎉`);
        })
        .catch(error => {
            console.error('Error adding animal:', error);
            alert('Failed to add animal. Make sure JSON Server is running.');
        });
    }

    // Event Listeners
    addAnimalForm.addEventListener('submit', handleAddAnimalForm);

    // Initialize the app
    fetchAllAnimals();
});