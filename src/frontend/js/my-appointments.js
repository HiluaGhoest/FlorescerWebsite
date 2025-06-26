document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Create sample data if none exists
    createSampleData();
    
    // Load user's appointments
    loadAppointments();
});

// Set up event listeners for the page
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
    
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all tabs
                tabButtons.forEach(tab => tab.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Apply filter based on tab
                const tabStatus = this.getAttribute('data-tab');
                if (tabStatus === 'all') {
                    applyTabFilter('all');
                } else {
                    applyTabFilter(tabStatus);
                }
            });
        });
    }
    
    // Filter date change
    const filterDate = document.getElementById('filterDate');
    if (filterDate) {
        filterDate.addEventListener('change', applyFilters);
    }
    
    // Clear filters button
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // New appointment button
    const newAppointmentBtn = document.getElementById('newAppointmentBtn');
    if (newAppointmentBtn) {
        newAppointmentBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Modal close buttons
    const closeModalButtons = document.querySelectorAll('.close-modal');
    if (closeModalButtons.length > 0) {
        closeModalButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Hide all modals
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        });
    }
    
    // Modal close button
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            document.getElementById('appointmentDetailsModal').style.display = 'none';
        });
    }
    
    // Cancel appointment button
    const cancelAppointmentBtn = document.getElementById('cancelAppointmentBtn');
    if (cancelAppointmentBtn) {
        cancelAppointmentBtn.addEventListener('click', function() {
            const appointmentId = this.dataset.appointmentId;
            if (appointmentId) {
                showConfirmationModal(appointmentId);
            }
        });
    }
    
    // Confirmation modal buttons
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', function() {
            const appointmentId = this.dataset.appointmentId;
            if (appointmentId) {
                cancelAppointment(appointmentId);
                document.getElementById('confirmationModal').style.display = 'none';
            }
        });
    }
    
    const confirmNoBtn = document.getElementById('confirmNoBtn');
    if (confirmNoBtn) {
        confirmNoBtn.addEventListener('click', function() {
            document.getElementById('confirmationModal').style.display = 'none';
        });
    }
}

// Load user's appointments from the backend
function loadAppointments() {
    const appointmentsList = document.getElementById('appointmentsList');
    const noAppointmentsMessage = document.getElementById('noAppointmentsMessage');
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    // In a real app, you would fetch from your API
    // For this demo, we'll use localStorage
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Filter appointments for this user
    appointments = appointments.filter(appointment => appointment.userId === user.id);

    // Mark appointments as atrasado if date is past and not completed/cancelled
    const now = new Date();
    appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.date + 'T' + appointment.time);
        if (
            appointmentDate < now &&
            appointment.status !== 'completed' &&
            appointment.status !== 'cancelled' &&
            appointment.status !== 'atrasado'
        ) {
            appointment.status = 'atrasado';
        }
    });
    // Optionally, save updated appointments back to localStorage
    localStorage.setItem('appointments', JSON.stringify(appointments));

    // Update UI based on appointments
    if (appointments.length === 0) {
        appointmentsList.innerHTML = '';
        noAppointmentsMessage.style.display = 'block';
    } else {
        noAppointmentsMessage.style.display = 'none';
        
        // Get therapies and psychologists data for display
        const therapies = JSON.parse(localStorage.getItem('therapies')) || [];
        const psychologists = JSON.parse(localStorage.getItem('psychologists')) || [];
        
        // Create HTML for each appointment
        appointmentsList.innerHTML = appointments.map(appointment => {
            // First try to find the therapy by ID
            let therapy = therapies.find(t => t.id === appointment.therapyId);
            
            // If not found and we have a therapyName, create a temporary therapy object
            if (!therapy && appointment.therapyName) {
                therapy = { 
                    name: appointment.therapyName, 
                    id: appointment.therapyId || 'unknown' 
                };
            } else if (!therapy) {
                // Default fallback
                therapy = { 
                    name: 'Não especificado', 
                    id: 'unknown' 
                };
            }
            
            const psychologist = psychologists.find(p => p.id === appointment.psychologistId) || { name: 'Não especificado', id: 'unknown' };
            
            // Format date
            const appointmentDate = new Date(appointment.date + 'T' + appointment.time);
            const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            // Format time
            const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Status class and icon for styling
            let statusClass = '';
            let statusIcon = '';
            switch (appointment.status) {
                case 'scheduled':
                    statusClass = 'status-scheduled';
                    statusIcon = 'fa-calendar-check';
                    break;
                case 'completed':
                    statusClass = 'status-completed';
                    statusIcon = 'fa-check-circle';
                    break;
                case 'cancelled':
                    statusClass = 'status-cancelled';
                    statusIcon = 'fa-times-circle';
                    break;
                case 'atrasado':
                    statusClass = 'status-atrasado';
                    statusIcon = 'fa-exclamation-triangle';
                    break;
                default:
                    statusClass = '';
                    statusIcon = 'fa-calendar';
            }
            
            // Create appointment card with icons
            return `
                <div class="appointment-card" data-status="${appointment.status}" data-date="${appointment.date}">
                    <div class="appointment-header">
                        <h4>${therapy.name}</h4>
                        <span class="appointment-status ${statusClass}">
                            <i class="fas ${statusIcon}"></i> ${translateStatus(appointment.status)}
                        </span>
                    </div>
                    <div class="appointment-body">
                        <div class="appointment-info-row">
                            <i class="fas fa-user-md icon"></i>
                            <span>${psychologist.name}</span>
                        </div>
                        <div class="appointment-info-row">
                            <i class="fas fa-calendar-alt icon"></i>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="appointment-info-row">
                            <i class="fas fa-clock icon"></i>
                            <span>${formattedTime}</span>
                        </div>
                        <div class="appointment-info-row">
                            <i class="fas fa-hourglass-half icon"></i>
                            <span>${appointment.duration} minutos</span>
                        </div>
                    </div>
                    <div class="appointment-footer">
                        <button class="btn view-details-btn" onclick="viewAppointmentDetails('${appointment.id}')">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Apply tab filters to appointments list
function applyTabFilter(status) {
    const appointmentCards = document.querySelectorAll('.appointment-card');
    
    if (status === 'all') {
        // Show all cards
        appointmentCards.forEach(card => {
            card.style.display = 'block';
        });
    } else {
        // Show only cards with matching status
        appointmentCards.forEach(card => {
            if (card.dataset.status === status) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Check if any cards are visible
    checkNoResults();
}

// Apply date filter to appointments list
function applyFilters() {
    const date = document.getElementById('filterDate').value;
    
    // Get active tab (status filter)
    const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
    const statusFilter = activeTab === 'all' ? null : activeTab;
    
    const appointmentCards = document.querySelectorAll('.appointment-card');
    
    appointmentCards.forEach(card => {
        let showCard = true;
        
        // Apply status filter
        if (statusFilter && card.dataset.status !== statusFilter) {
            showCard = false;
        }
        
        // Apply date filter
        if (date && card.dataset.date !== date) {
            showCard = false;
        }
        
        // Show or hide card based on filters
        card.style.display = showCard ? 'block' : 'none';
    });
    
    // Check if any cards are visible
    checkNoResults();
}

// Check if any cards are visible and show appropriate message
function checkNoResults() {
    const appointmentsList = document.getElementById('appointmentsList');
    const visibleCards = document.querySelectorAll('.appointment-card[style="display: block;"]');
    
    // Remove existing no results message if present
    const existingNoResults = appointmentsList.querySelector('.no-results');
    if (existingNoResults) {
        existingNoResults.remove();
    }
    
    if (visibleCards.length === 0) {
        appointmentsList.innerHTML += `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                <p>Nenhum agendamento encontrado com os filtros aplicados.</p>
            </div>
        `;
    }
}

// Clear all filters
function clearFilters() {
    // Reset date filter
    document.getElementById('filterDate').value = '';
    
    // Reset tab to "All"
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(tab => tab.classList.remove('active'));
    document.querySelector('.tab-button[data-tab="all"]').classList.add('active');
    
    // Show all appointments
    const appointmentCards = document.querySelectorAll('.appointment-card');
    appointmentCards.forEach(card => {
        card.style.display = 'block';
    });
    
    // Remove no results message if present
    const noResults = document.querySelector('.no-results');
    if (noResults) {
        noResults.remove();
    }
}

// View appointment details
function viewAppointmentDetails(appointmentId) {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (!appointment) {
        showNotification('Agendamento não encontrado!', 'error');
        return;
    }
    
    // Get related data
    const therapies = JSON.parse(localStorage.getItem('therapies')) || [];
    const psychologists = JSON.parse(localStorage.getItem('psychologists')) || [];
    
    // First try to find the therapy by ID
    let therapy = therapies.find(t => t.id === appointment.therapyId);
    
    // If not found and we have a therapyName, create a temporary therapy object
    if (!therapy && appointment.therapyName) {
        therapy = { 
            name: appointment.therapyName, 
            id: appointment.therapyId || 'unknown' 
        };
    } else if (!therapy) {
        // Default fallback
        therapy = { 
            name: 'Não especificado', 
            id: 'unknown' 
        };
    }
    
    const psychologist = psychologists.find(p => p.id === appointment.psychologistId) || { name: 'Não especificado', id: 'unknown', specialties: [] };
    
    // Format date and time
    const appointmentDate = new Date(appointment.date + 'T' + appointment.time);
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Status class and icon for styling
    let statusClass = '';
    let statusIcon = '';
    switch (appointment.status) {
        case 'scheduled':
            statusClass = 'status-scheduled';
            statusIcon = 'fa-calendar-check';
            break;
        case 'completed':
            statusClass = 'status-completed';
            statusIcon = 'fa-check-circle';
            break;
        case 'cancelled':
            statusClass = 'status-cancelled';
            statusIcon = 'fa-times-circle';
            break;
        case 'atrasado':
            statusClass = 'status-atrasado';
            statusIcon = 'fa-exclamation-triangle';
            break;
        default:
            statusClass = '';
            statusIcon = 'fa-calendar';
    }
    
    // Populate modal content
    const modalContent = document.getElementById('appointmentDetailsContent');
    modalContent.innerHTML = `
        <div class="appointment-details">
            <div class="detail-row">
                <div class="detail-label">Terapia:</div>
                <div class="detail-value">${therapy.name}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Psicólogo:</div>
                <div class="detail-value">${psychologist.name}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Especialidades:</div>
                <div class="detail-value">${psychologist.specialties ? psychologist.specialties.join(', ') : 'Não especificado'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Data:</div>
                <div class="detail-value">${formattedDate}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Horário:</div>
                <div class="detail-value">${formattedTime}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Duração:</div>
                <div class="detail-value">${appointment.duration} minutos</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value">
                    <span class="appointment-status ${statusClass}" style="position: relative; top: 0; right: 0;">
                        <i class="fas ${statusIcon}"></i> ${translateStatus(appointment.status)}
                    </span>
                </div>
            </div>
            ${appointment.dynamic ? `
            <div class="detail-row">
                <div class="detail-label">Observações:</div>
                <div class="detail-value">${appointment.dynamic}</div>
            </div>` : ''}
        </div>
    `;
    
    // Set appointment ID to cancel button
    const cancelBtn = document.getElementById('cancelAppointmentBtn');
    cancelBtn.dataset.appointmentId = appointmentId;
    
    // Show or hide cancel button based on appointment status
    if (appointment.status === 'scheduled') {
        cancelBtn.style.display = 'block';
    } else {
        cancelBtn.style.display = 'none';
    }
    
    // Open modal
    document.getElementById('appointmentDetailsModal').style.display = 'block';
}

// Show confirmation modal before canceling
function showConfirmationModal(appointmentId) {
    // Set appointment ID to confirmation button
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    confirmYesBtn.dataset.appointmentId = appointmentId;
    
    // Show confirmation modal
    document.getElementById('confirmationModal').style.display = 'block';
    
    // Hide details modal
    document.getElementById('appointmentDetailsModal').style.display = 'none';
}

// Cancel appointment
function cancelAppointment(appointmentId) {
    // In a real app, you would call your API
    // For this demo, we'll update localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === appointmentId) {
            return { ...appointment, status: 'cancelled' };
        }
        return appointment;
    });
    
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    
    // Close modal and reload appointments
    document.getElementById('appointmentDetailsModal').style.display = 'none';
    document.getElementById('confirmationModal').style.display = 'none';
    
    // Reload appointments
    loadAppointments();
    
    // Reset filters to show the cancelled appointment
    clearFilters();
    
    // Show success message
    showNotification('Agendamento cancelado com sucesso!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Add active class to animate in
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Translate status from English to Portuguese
function translateStatus(status) {
    switch (status) {
        case 'scheduled':
            return 'Agendado';
        case 'completed':
            return 'Concluído';
        case 'cancelled':
            return 'Cancelado';
        case 'atrasado':
            return 'Atrasado';
        default:
            return status;
    }
}

// Create sample data for demonstration purposes
function createSampleData() {
    // Check if sample data already exists
    if (localStorage.getItem('therapies') && 
        localStorage.getItem('psychologists') && 
        localStorage.getItem('appointments')) {
        return;
    }
      // Sample therapies
    const therapies = [
        {
            id: 't1',
            name: 'Terapia Individual',
            description: 'Sessões individuais para tratamento de questões pessoais.',
            price: 150.00,
            imageUrl: 'images/therapy-individual.jpg'
        },
        {
            id: 't2',
            name: 'Terapia em Grupo',
            description: 'Sessões em grupo para compartilhamento de experiências.',
            price: 80.00,
            imageUrl: 'images/therapy-group.jpg'
        },
        {
            id: 't3',
            name: 'Terapia de Casal',
            description: 'Sessões para casais resolverem conflitos e melhorarem o relacionamento.',
            price: 200.00,
            imageUrl: 'images/therapy-couple.jpg'
        },
        {
            id: 't4',
            name: 'Terapia Infantil',
            description: 'Sessões especializadas para crianças.',
            price: 130.00,
            imageUrl: 'images/therapy-child.jpg'
        },
        {
            id: 't5',
            name: 'Orientação de Pais',
            description: 'Sessões para orientação de pais.',
            price: 120.00,
            imageUrl: 'images/therapy-parents.jpg'
        },
        {
            id: 't6',
            name: 'Terapia Psicomotora',
            description: 'Terapia focada em aspectos psicomotores.',
            price: 140.00,
            imageUrl: 'images/therapy-psychomotor.jpg'
        },
        {
            id: 't7',
            name: 'Terapia Lúdica',
            description: 'Terapia utilizando jogos e brincadeiras.',
            price: 110.00,
            imageUrl: 'images/therapy-play.jpg'
        },
        {
            id: 't8',
            name: 'Psicanálise',
            description: 'Sessões de psicanálise tradicional.',
            price: 180.00,
            imageUrl: 'images/therapy-psychoanalysis.jpg'
        },
        {
            id: 't9',
            name: 'Arteterapia',
            description: 'Terapia usando técnicas artísticas.',
            price: 160.00,
            imageUrl: 'images/therapy-art.jpg'
        }
    ];
      // Sample psychologists
    const psychologists = [
        {
            id: 'p1',
            name: 'Dra. Maria Silva',
            specialties: ['Ansiedade', 'Depressão', 'Trauma'],
            description: 'Especialista em terapia cognitivo-comportamental.',
            imageUrl: 'images/psychologist1.jpg',
            availableDays: ['Monday', 'Wednesday', 'Friday']
        },
        {
            id: 'p2',
            name: 'Dr. João Santos',
            specialties: ['Relacionamentos', 'Autoestima', 'Transtorno Bipolar'],
            description: 'Especialista em terapia de família e casal.',
            imageUrl: 'images/psychologist2.jpg',
            availableDays: ['Tuesday', 'Thursday']
        },
        {
            id: 'p3',
            name: 'Dra. Ana Oliveira',
            specialties: ['TDAH', 'Psicologia Infantil', 'Fobias'],
            description: 'Especialista em psicologia infantil e adolescente.',
            imageUrl: 'images/psychologist3.jpg',
            availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday']
        }
    ];
    
    // Get current user
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Create sample appointments if user exists
    let appointments = [];
    if (user) {
        // Today's date
        const today = new Date();
        
        // Past appointment (completed)
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 7);
        
        // Future appointment (scheduled)
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 3);
        
        // Recent appointment (cancelled)
        const recentDate = new Date();
        recentDate.setDate(today.getDate() - 2);
        
        appointments = [
            {
                id: 'a1',
                userId: user.id,
                therapyId: 't1',
                psychologistId: 'p1',
                date: pastDate.toISOString().split('T')[0],
                time: '14:00',
                duration: '50',
                status: 'completed',
                dynamic: 'Primeira sessão para conhecer o paciente.'
            },
            {
                id: 'a2',
                userId: user.id,
                therapyId: 't2',
                psychologistId: 'p2',
                date: futureDate.toISOString().split('T')[0],
                time: '10:00',
                duration: '90',
                status: 'scheduled',
                dynamic: 'Sessão de acompanhamento.'
            },
            {
                id: 'a3',
                userId: user.id,
                therapyId: 't3',
                psychologistId: 'p3',
                date: recentDate.toISOString().split('T')[0],
                time: '16:30',
                duration: '60',
                status: 'cancelled',
                dynamic: 'Sessão cancelada pelo paciente.'
            }
        ];
    }
    
    // Store sample data in localStorage
    localStorage.setItem('therapies', JSON.stringify(therapies));
    localStorage.setItem('psychologists', JSON.stringify(psychologists));
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

// Make functions available globally
window.viewAppointmentDetails = viewAppointmentDetails;
window.cancelAppointment = cancelAppointment;
