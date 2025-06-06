document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Update navigation based on auth status
    updateNavigation(token, user);
    
    // Protected routes
    if ((window.location.pathname.includes('appointment.html') || 
         window.location.pathname.includes('my-appointments.html')) && !token) {
        window.location.href = 'login.html';
    }
    
    // Admin routes
    if (window.location.pathname.includes('admin.html') && (!token || !user || !user.isAdmin)) {
        window.location.href = 'login.html';
    }

    // Handle therapy card selection on the home page
    const therapyCards = document.querySelectorAll('.therapy-card');
    if (therapyCards.length > 0) {
        therapyCards.forEach(card => {
            card.addEventListener('click', function() {
                const therapy = this.getAttribute('data-therapy');
                if (token) {
                    // User is logged in, redirect to appointment page
                    window.location.href = `appointment.html?therapy=${therapy}`;
                } else {
                    // User is not logged in, redirect to login page
                    localStorage.setItem('selectedTherapy', therapy);
                    window.location.href = 'login.html';
                }
            });
        });
    }

    // Handle appointment page
    if (window.location.pathname.includes('appointment.html')) {
        loadAppointmentPage();
    }

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
});

// Function to load appointment page with the right therapy options
function loadAppointmentPage() {
    // Get therapy from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const therapy = urlParams.get('therapy') || localStorage.getItem('selectedTherapy') || '';
    
    // Clear localStorage selection
    localStorage.removeItem('selectedTherapy');
    
    const therapyTitles = {
        'terapia-grupo': 'Terapia em Grupo',
        'terapia-casal': 'Terapia de Casal',
        'terapia-individual': 'Terapia Individual',
        'orientacao-pais': 'Orientação de Pais',
        'terapia-psicomotora': 'Terapia Psicomotora',
        'terapia-ludica': 'Terapia Lúdica',
        'psicanalise': 'Psicanálise',
        'arteterapia': 'Arteterapia'
    };
    
    // Set the title
    const titleElement = document.getElementById('selectedTherapyTitle');
    if (titleElement && therapy && therapyTitles[therapy]) {
        titleElement.textContent = therapyTitles[therapy];
        
        // Store the exact therapy title in data attribute for later use
        titleElement.dataset.therapyType = therapy;
    }
    
    // Populate therapy specific options
    const therapyOptionsContainer = document.getElementById('therapyOptions');
    if (therapyOptionsContainer) {
        switch(therapy) {
            case 'terapia-ludica':
                therapyOptionsContainer.innerHTML = `
                    <div class="session-options">
                        <h4>Selecione o tempo de Duração:</h4>
                        <div class="duration-options">
                            <div class="duration-card" data-duration="45">
                                <h4>45 Minutos</h4>
                            </div>
                            <div class="duration-card" data-duration="50">
                                <h4>50 Minutos</h4>
                            </div>
                        </div>
                        <h4>Selecione a dinâmica da sessão:</h4>
                        <div class="session-dynamics">
                            <div class="dynamic-option" data-dynamic="limites">
                                <div class="radio-custom"></div>
                                <span>Limites e Comportamento</span>
                            </div>
                            <div class="dynamic-option" data-dynamic="medos">
                                <div class="radio-custom"></div>
                                <span>Medos e Ansiedades</span>
                            </div>
                            <div class="dynamic-option" data-dynamic="relacoes">
                                <div class="radio-custom"></div>
                                <span>Relações Familiares</span>
                            </div>
                            <div class="dynamic-option" data-dynamic="emocoes">
                                <div class="radio-custom"></div>
                                <span>Expressão de Emoções</span>
                            </div>
                            <div class="dynamic-option" data-dynamic="outros">
                                <div class="radio-custom"></div>
                                <span>Outros</span>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'psicanalise':
                therapyOptionsContainer.innerHTML = `
                    <div class="session-options">
                        <h4>Selecione o tempo de Duração:</h4>
                        <div class="duration-options">
                            <div class="duration-card" data-duration="45">
                                <h4>45 Minutos</h4>
                            </div>
                            <div class="duration-card" data-duration="50">
                                <h4>50 Minutos</h4>
                            </div>
                        </div>
                        <h4>Selecione a dinâmica da sessão:</h4>
                        <div class="session-dynamics">
                            <div class="dynamic-option" data-dynamic="sonhos">
                                <div class="radio-custom"></div>
                                <span>Análise de Sonhos</span>
                            </div>
                            <div class="dynamic-option" data-dynamic="atuacao">
                                <div class="radio-custom"></div>
                                <span>Atuação</span>
                            </div>
                            <div class="dynamic-option" data-dynamic="associacao">
                                <div class="radio-custom"></div>
                                <span>Associação Livre</span>
                            </div>
                            <div class="dynamic-option" data-dynamic="escuta">
                                <div class="radio-custom"></div>
                                <span>Escuta Analítica</span>
                            </div>
                            <div class="dynamic-option" data-dynamic="outros">
                                <div class="radio-custom"></div>
                                <span>Outros</span>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'arteterapia':
                therapyOptionsContainer.innerHTML = `
                    <div class="session-options">
                        <h4>Selecione o tempo de Duração:</h4>
                        <div class="duration-options">
                            <div class="duration-card" data-duration="50">
                                <h4>50 Minutos</h4>
                            </div>
                            <div class="duration-card" data-duration="90">
                                <h4>90 Minutos</h4>
                            </div>
                        </div>
                        <h4>Selecione a dinâmica da sessão:</h4>
                        <div class="session-dynamics">
                            <div class="dynamic-option" data-dynamic="desenho">
                                <div class="radio-custom"></div>
                                <span>Desenho Livre</span>
                            </div>
                            <div class="dynamic-option" data-dynamic="pintura">
                                <div class="radio-custom"></div>
                                <span>Pintura Livre ou dirigida</span>
                            </div>
                            <div class="dynamic-option" data-dynamic="modelagem">
                                <div class="radio-custom"></div>
                                <span>Modelagem de massinha ou argila</span>
                            </div>
                            <div class="dynamic-option" data-dynamic="escrita">
                                <div class="radio-custom"></div>
                                <span>Escrita expressiva</span>
                            </div>
                        </div>
                    </div>
                `;
                break;
            default:
                therapyOptionsContainer.innerHTML = `
                    <div class="session-options">
                        <h4>Selecione o tempo de Duração:</h4>
                        <div class="duration-options">
                            <div class="duration-card" data-duration="45">
                                <h4>45 Minutos</h4>
                            </div>
                            <div class="duration-card" data-duration="50">
                                <h4>50 Minutos</h4>
                            </div>
                        </div>
                    </div>
                `;
        }
        
        // Add event listeners for session options
        addSessionOptionListeners();
    }

    // Set current date as min date for the datepicker
    const dateInput = document.getElementById('dateInput');
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.min = `${year}-${month}-${day}`;
        dateInput.value = `${year}-${month}-${day}`;
    }
    
    // Add event listener for schedule button
    const scheduleBtn = document.getElementById('scheduleBtn');
    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', handleScheduleAppointment);
    }
}

// Add event listeners to session option elements
function addSessionOptionListeners() {
    // Duration options
    const durationCards = document.querySelectorAll('.duration-card');
    durationCards.forEach(card => {
        card.addEventListener('click', function() {
            durationCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Dynamic options
    const dynamicOptions = document.querySelectorAll('.dynamic-option');
    dynamicOptions.forEach(option => {
        option.addEventListener('click', function() {
            dynamicOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Psychologist selection
    const psychologistCards = document.querySelectorAll('.psychologist-card');
    psychologistCards.forEach(card => {
        card.addEventListener('click', function() {
            psychologistCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Handle appointment scheduling
function handleScheduleAppointment() {
    // Get selected options
    const titleElement = document.getElementById('selectedTherapyTitle');
    const selectedTherapy = titleElement.textContent;
    const therapyType = titleElement.dataset.therapyType || '';
    
    const selectedPsychologist = document.querySelector('.psychologist-card.active');
    const psychologistId = selectedPsychologist ? selectedPsychologist.getAttribute('data-psychologist') : null;
    
    const selectedDuration = document.querySelector('.duration-card.active');
    const durationValue = selectedDuration ? selectedDuration.getAttribute('data-duration') : null;
    
    const selectedDynamic = document.querySelector('.dynamic-option.selected');
    const dynamicValue = selectedDynamic ? selectedDynamic.getAttribute('data-dynamic') : null;
    
    const dateValue = document.getElementById('dateInput').value;
    const timeValue = document.getElementById('timeInput').value;
    
    // Validate selection
    if (!psychologistId) {
        alert('Por favor, selecione um psicólogo.');
        return;
    }
    
    if (!durationValue) {
        alert('Por favor, selecione a duração da sessão.');
        return;
    }
    
    if (!dateValue || !timeValue) {
        alert('Por favor, selecione a data e horário.');
        return;
    }
    
    // Get therapy ID from title
    const therapyId = getTherapyIdFromTitle(selectedTherapy);
    
    // Get therapy name from sample data to ensure consistency
    const therapies = JSON.parse(localStorage.getItem('therapies')) || [];
    const therapy = therapies.find(t => t.id === therapyId);
    
    // Create appointment object
    const appointment = {
        id: 'a' + Date.now(),
        therapyId: therapyId,
        therapyName: therapy ? therapy.name : selectedTherapy, // Store therapy name as a backup
        therapyType: therapyType, // Store the therapy type key (e.g., 'terapia-ludica')
        psychologistId: psychologistId,
        duration: durationValue,
        dynamic: dynamicValue || 'N/A',
        date: dateValue,
        time: timeValue,
        userId: JSON.parse(localStorage.getItem('user')).id,
        status: 'scheduled'
    };
    
    // In a real application, send this to the server
    // For demo, we'll store in localStorage
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    alert('Agendamento realizado com sucesso!');
    window.location.href = 'my-appointments.html';
}

// Update navigation based on authentication status
function updateNavigation(token, user) {
    // Elements that should only be visible when logged in
    const loggedInElements = document.querySelectorAll('.logged-in-only');
    // Elements that should only be visible when logged out
    const loggedOutElements = document.querySelectorAll('.logged-out-only');
    
    if (token && user) {
        // User is logged in
        loggedInElements.forEach(element => {
            element.style.display = '';
        });
        
        loggedOutElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // Setup logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            });
        }
    } else {
        // User is logged out
        loggedInElements.forEach(element => {
            element.style.display = 'none';
        });
          loggedOutElements.forEach(element => {
            element.style.display = '';
        });
    }
}

// Helper function to get therapy ID from title
function getTherapyIdFromTitle(therapyTitle) {
    // Mapping of therapy titles to IDs
    const therapyMap = {
        'Terapia Individual': 't1',
        'Terapia em Grupo': 't2',
        'Terapia de Casal': 't3',
        'Terapia Infantil': 't4',
        'Orientação de Pais': 't5',
        'Terapia Psicomotora': 't6',
        'Terapia Lúdica': 't7',
        'Psicanálise': 't8',
        'Arteterapia': 't9'
    };
    
    // Additional mappings for URL parameters
    const urlParamMap = {
        'terapia-individual': 't1',
        'terapia-grupo': 't2',
        'terapia-casal': 't3',
        'terapia-infantil': 't4',
        'orientacao-pais': 't5',
        'terapia-psicomotora': 't6',
        'terapia-ludica': 't7',
        'psicanalise': 't8',
        'arteterapia': 't9'
    };
    
    // Clean the therapy title (remove "Terapia: " prefix if present)
    const cleanTitle = therapyTitle.replace('Terapia: ', '').trim();
    
    // Try to find ID in the maps
    if (therapyMap[cleanTitle]) {
        return therapyMap[cleanTitle];
    } else if (urlParamMap[cleanTitle]) {
        return urlParamMap[cleanTitle];
    }
    
    // Log for debugging
    console.log("Therapy mapping not found for:", cleanTitle);
    
    // Try to match partial titles
    for (const [title, id] of Object.entries(therapyMap)) {
        if (cleanTitle.includes(title) || title.includes(cleanTitle)) {
            return id;
        }
    }
    
    // Default fallback
    return 't1';
}