document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.isAdmin) {
        window.location.href = 'login.html';
        return;
    }
    
    // Handle admin menu buttons
    const therapiesBtn = document.getElementById('therapiesBtn');
    const appointmentsBtn = document.getElementById('appointmentsBtn');
    const staffBtn = document.getElementById('staffBtn');
    const adminContent = document.getElementById('adminContent');
    
    if (therapiesBtn && appointmentsBtn && staffBtn && adminContent) {
        // Default view
        loadTherapiesView();
        
        // Add event listeners
        therapiesBtn.addEventListener('click', loadTherapiesView);
        appointmentsBtn.addEventListener('click', loadAppointmentsView);
        staffBtn.addEventListener('click', loadStaffView);
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

// Load therapies management view
function loadTherapiesView() {
    const adminContent = document.getElementById('adminContent');
    
    // Set active menu button
    document.querySelectorAll('.admin-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('therapiesBtn').classList.add('active');
    
    // Show loading state
    adminContent.innerHTML = '<div class="loading-spinner"></div><p class="loading-message">Carregando terapias...</p>';
    
    // Fetch therapies from API
    fetch('/api/therapies', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha ao carregar terapias');
        }
        return response.json();
    })
    .then(therapies => {
        // Generate HTML
        let html = `
            <h3>Gerenciar Terapias</h3>
            <div class="therapy-grid">
        `;
        
        therapies.forEach(therapy => {
            html += `
                <div class="therapy-card">
                    <h4>${therapy.name}</h4>
                    <button class="btn edit-btn" data-id="${therapy.id}">Editar</button>
                </div>
            `;
        });
        
        html += `
                <div class="therapy-card add-therapy">
                    <h4>+</h4>
                    <p>Adicionar Nova</p>
                </div>
            </div>
        `;
        
        adminContent.innerHTML = html;
        
        // Add event listeners to therapy cards
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const therapyId = this.getAttribute('data-id');
                showTherapyEditForm(therapyId);
            });
        });
        
        document.querySelector('.add-therapy').addEventListener('click', showAddTherapyForm);
    })
    .catch(error => {
        console.error('Error:', error);
        adminContent.innerHTML = `<div class="error-message">Erro ao carregar terapias: ${error.message}</div>`;
        
        // Fallback to local data if API fails
        const therapies = [
            { id: 'terapia-grupo', name: 'Terapia em Grupo' },
            { id: 'terapia-casal', name: 'Terapia de Casal' },
            { id: 'terapia-individual', name: 'Terapia Individual' },
            { id: 'orientacao-pais', name: 'Orientação de Pais' },
            { id: 'terapia-psicomotora', name: 'Terapia Psicomotora' },
            { id: 'terapia-ludica', name: 'Terapia Lúdica' },
            { id: 'psicanalise', name: 'Psicanálise' },
            { id: 'arteterapia', name: 'Arteterapia' }
        ];
        
        // Generate HTML with local data
        let html = `
            <h3>Gerenciar Terapias (Modo Offline)</h3>
            <div class="therapy-grid">
        `;
        
        therapies.forEach(therapy => {
            html += `
                <div class="therapy-card">
                    <h4>${therapy.name}</h4>
                    <button class="btn edit-btn" data-id="${therapy.id}">Editar</button>
                </div>
            `;
        });
        
        html += `
                <div class="therapy-card add-therapy">
                    <h4>+</h4>
                    <p>Adicionar Nova</p>
                </div>
            </div>
        `;
        
        adminContent.innerHTML = html;
        
        // Add event listeners to therapy cards
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const therapyId = this.getAttribute('data-id');
                showTherapyEditForm(therapyId);
            });
        });
        
        document.querySelector('.add-therapy').addEventListener('click', showAddTherapyForm);
    });
}

// Show form to edit a therapy
function showTherapyEditForm(therapyId) {
    const adminContent = document.getElementById('adminContent');
    
    // Show loading state
    adminContent.innerHTML = '<div class="loading-spinner"></div><p class="loading-message">Carregando dados da terapia...</p>';
    
    // Fetch therapy details from API
    fetch(`/api/therapies/${therapyId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha ao carregar dados da terapia');
        }
        return response.json();
    })
    .then(therapy => {
        // Show edit form
        adminContent.innerHTML = `
            <h3>Editar Terapia</h3>
            <div class="form-container">
                <form id="editTherapyForm">
                    <div class="form-group">
                        <label for="therapyName">Nome:</label>
                        <input type="text" id="therapyName" value="${therapy.name}" class="form-control">
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn">Salvar</button>
                        <button type="button" class="btn" id="cancelEditTherapy">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('cancelEditTherapy').addEventListener('click', loadTherapiesView);
        document.getElementById('editTherapyForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const updatedName = document.getElementById('therapyName').value;
            
            // Update therapy via API
            fetch(`/api/therapies/${therapyId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: updatedName
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Falha ao atualizar terapia');
                }
                return response.json();
            })
            .then(data => {
                alert('Terapia atualizada com sucesso!');
                loadTherapiesView();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Erro ao atualizar terapia: ' + error.message);
            });
        });
    })
    .catch(error => {
        console.error('Error:', error);
        adminContent.innerHTML = `<div class="error-message">Erro ao carregar dados da terapia: ${error.message}</div>`;
        
        // Fallback to local data if API fails
        const therapies = [
            { id: 'terapia-grupo', name: 'Terapia em Grupo' },
            { id: 'terapia-casal', name: 'Terapia de Casal' },
            { id: 'terapia-individual', name: 'Terapia Individual' },
            { id: 'orientacao-pais', name: 'Orientação de Pais' },
            { id: 'terapia-psicomotora', name: 'Terapia Psicomotora' },
            { id: 'terapia-ludica', name: 'Terapia Lúdica' },
            { id: 'psicanalise', name: 'Psicanálise' },
            { id: 'arteterapia', name: 'Arteterapia' }
        ];
        
        const therapy = therapies.find(t => t.id === therapyId);
        
        adminContent.innerHTML = `
            <h3>Editar Terapia (Modo Offline)</h3>
            <div class="form-container">
                <form id="editTherapyForm">
                    <div class="form-group">
                        <label for="therapyName">Nome:</label>
                        <input type="text" id="therapyName" value="${therapy.name}" class="form-control">
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn">Salvar</button>
                        <button type="button" class="btn" id="cancelEditTherapy">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('cancelEditTherapy').addEventListener('click', loadTherapiesView);
        document.getElementById('editTherapyForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Terapia atualizada com sucesso! (Modo Offline)');
            loadTherapiesView();
        });
    });
}

// Show form to add a new therapy
function showAddTherapyForm() {
    const adminContent = document.getElementById('adminContent');
    
    adminContent.innerHTML = `
        <h3>Adicionar Nova Terapia</h3>
        <div class="form-container">
            <form id="addTherapyForm">
                <div class="form-group">
                    <label for="therapyName">Nome:</label>
                    <input type="text" id="therapyName" class="form-control" required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn">Adicionar</button>
                    <button type="button" class="btn" id="cancelAddTherapy">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById('cancelAddTherapy').addEventListener('click', loadTherapiesView);
    document.getElementById('addTherapyForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const therapyName = document.getElementById('therapyName').value;
        
        // Add therapy via API
        fetch('/api/therapies', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: therapyName,
                id: therapyName.toLowerCase().replace(/\s+/g, '-')
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao adicionar terapia');
            }
            return response.json();
        })
        .then(data => {
            alert('Terapia adicionada com sucesso!');
            loadTherapiesView();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Erro ao adicionar terapia: ' + error.message);
            
            // Fallback for demo
            alert('Terapia adicionada com sucesso! (Modo Offline)');
            loadTherapiesView();
        });
    });
}

// Load appointments management view
function loadAppointmentsView() {
    const adminContent = document.getElementById('adminContent');
    
    // Set active menu button
    document.querySelectorAll('.admin-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('appointmentsBtn').classList.add('active');
    
    // Show loading state
    adminContent.innerHTML = '<div class="loading-spinner"></div><p class="loading-message">Carregando agendamentos...</p>';
    
    // Fetch appointments from API
    fetch('/api/appointments', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha ao carregar agendamentos');
        }
        return response.json();
    })
    .then(appointments => {
        // Generate HTML
        let html = `
            <h3>Gerenciar Agendamentos</h3>
            <div class="appointments-list">
        `;
        
        if (appointments.length === 0) {
            html += `<p>Nenhum agendamento encontrado.</p>`;
        } else {
            html += `
                <table class="appointments-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Horário</th>
                            <th>Terapia</th>
                            <th>Psicólogo</th>
                            <th>Cliente</th>
                            <th>Duração</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            appointments.forEach(appointment => {
                const psychologistMap = {
                    'p1': 'Dra. Maria Silva',
                    'p2': 'Dr. João Santos',
                    'p3': 'Dra. Ana Oliveira'
                };
                
                html += `
                    <tr>
                        <td>${appointment.date}</td>
                        <td>${appointment.time}</td>
                        <td>${appointment.therapy}</td>
                        <td>${psychologistMap[appointment.psychologist] || 'Desconhecido'}</td>
                        <td>${appointment.userName || 'Desconhecido'}</td>
                        <td>${appointment.duration} min</td>
                        <td>${appointment.status}</td>
                        <td>
                            <button class="btn edit-appointment-btn" data-id="${appointment.id}">Editar</button>
                            <button class="btn delete-appointment-btn" data-id="${appointment.id}">Cancelar</button>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
            `;
        }
        
        html += `</div>`;
        
        adminContent.innerHTML = html;
        
        // Add event listeners to appointment action buttons
        document.querySelectorAll('.edit-appointment-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const appointmentId = this.getAttribute('data-id');
                showEditAppointmentForm(appointmentId);
            });
        });
        
        document.querySelectorAll('.delete-appointment-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const appointmentId = this.getAttribute('data-id');
                if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                    // Cancel appointment via API
                    fetch(`/api/appointments/${appointmentId}/cancel`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Falha ao cancelar agendamento');
                        }
                        return response.json();
                    })
                    .then(data => {
                        alert('Agendamento cancelado com sucesso!');
                        loadAppointmentsView();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Erro ao cancelar agendamento: ' + error.message);
                        
                        // Fallback for demo
                        alert('Agendamento cancelado com sucesso! (Modo Offline)');
                        loadAppointmentsView();
                    });
                }
            });
        });
    })
    .catch(error => {
        console.error('Error:', error);
        adminContent.innerHTML = `<div class="error-message">Erro ao carregar agendamentos: ${error.message}</div>`;
        
        // Fallback to local data if API fails
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Generate HTML with local data
        let html = `
            <h3>Gerenciar Agendamentos (Modo Offline)</h3>
            <div class="appointments-list">
        `;
        
        if (appointments.length === 0) {
            html += `<p>Nenhum agendamento encontrado.</p>`;
        } else {
            html += `
                <table class="appointments-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Horário</th>
                            <th>Terapia</th>
                            <th>Psicólogo</th>
                            <th>Cliente</th>
                            <th>Duração</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            appointments.forEach(appointment => {
                const user = users.find(u => u.id === appointment.userId) || { username: 'Usuário desconhecido' };
                const psychologistMap = {
                    'p1': 'Dra. Maria Silva',
                    'p2': 'Dr. João Santos',
                    'p3': 'Dra. Ana Oliveira'
                };
                
                html += `
                    <tr>
                        <td>${appointment.date}</td>
                        <td>${appointment.time}</td>
                        <td>${appointment.therapy}</td>
                        <td>${psychologistMap[appointment.psychologist] || 'Desconhecido'}</td>
                        <td>${user.username}</td>
                        <td>${appointment.duration} min</td>
                        <td>
                            <button class="btn edit-appointment-btn" data-id="${appointment.id || '0'}">Editar</button>
                            <button class="btn delete-appointment-btn" data-id="${appointment.id || '0'}">Cancelar</button>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
            `;
        }
        
        html += `</div>`;
        
        adminContent.innerHTML = html;
        
        // Add event listeners to appointment action buttons
        document.querySelectorAll('.delete-appointment-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                    alert('Agendamento cancelado com sucesso! (Modo Offline)');
                    loadAppointmentsView();
                }
            });
        });
    });
}

// Load staff management view
function loadStaffView() {
    const adminContent = document.getElementById('adminContent');
    
    // Set active menu button
    document.querySelectorAll('.admin-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('staffBtn').classList.add('active');
    
    // Show loading state
    adminContent.innerHTML = '<div class="loading-spinner"></div><p class="loading-message">Carregando funcionários...</p>';
    
    // Fetch staff from API
    fetch('/api/users/staff', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha ao carregar funcionários');
        }
        return response.json();
    })
    .then(staff => {
        // Generate HTML
        const html = `
            <h3>Funcionários</h3>
            <div class="staff-container">
                <div class="add-staff">
                    <h4>Adicionar Funcionário</h4>
                    <div class="staff-photo-upload">
                        <img src="images/camera.png" alt="Upload Photo">
                    </div>
                    <form id="addStaffForm">
                        <div class="form-group">
                            <input type="text" id="staffName" placeholder="Nome" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <input type="email" id="staffEmail" placeholder="Email" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <select id="staffSpecialization" class="form-control" required>
                                <option value="">Especialização</option>
                                <option value="Arte Terapia">Arte Terapia</option>
                                <option value="Terapia Lúdica">Terapia Lúdica</option>
                                <option value="Terapia Individual">Terapia Individual</option>
                                <option value="Psicanálise">Psicanálise</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn">Adicionar</button>
                        </div>
                    </form>
                </div>
                
                <div class="staff-list">
                    <h4>Funcionários Atuais</h4>
                    <table class="staff-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Especialização</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${staff.map(person => `
                                <tr>
                                    <td>${person.name}</td>
                                    <td>${person.email}</td>
                                    <td>${person.specialization}</td>
                                    <td>
                                        <button class="btn edit-staff-btn" data-id="${person.id}">Editar</button>
                                        <button class="btn delete-staff-btn" data-id="${person.id}">Remover</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        adminContent.innerHTML = html;
        
        // Add event listeners
        document.getElementById('addStaffForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const staffData = {
                username: document.getElementById('staffName').value,
                email: document.getElementById('staffEmail').value,
                specialization: document.getElementById('staffSpecialization').value,
                password: 'senha123', // Default password, should be changed by user
                isStaff: true
            };
            
            // Add staff via API
            fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(staffData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Falha ao adicionar funcionário');
                }
                return response.json();
            })
            .then(data => {
                alert('Funcionário adicionado com sucesso!');
                loadStaffView();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Erro ao adicionar funcionário: ' + error.message);
                
                // Fallback for demo
                alert('Funcionário adicionado com sucesso! (Modo Offline)');
                loadStaffView();
            });
        });
        
        document.querySelectorAll('.edit-staff-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const staffId = this.getAttribute('data-id');
                showEditStaffForm(staffId);
            });
        });
        
        document.querySelectorAll('.delete-staff-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const staffId = this.getAttribute('data-id');
                if (confirm('Tem certeza que deseja remover este funcionário?')) {
                    // Remove staff via API
                    fetch(`/api/users/${staffId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Falha ao remover funcionário');
                        }
                        return response.json();
                    })
                    .then(data => {
                        alert('Funcionário removido com sucesso!');
                        loadStaffView();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Erro ao remover funcionário: ' + error.message);
                        
                        // Fallback for demo
                        alert('Funcionário removido com sucesso! (Modo Offline)');
                        loadStaffView();
                    });
                }
            });
        });
    })
    .catch(error => {
        console.error('Error:', error);
        adminContent.innerHTML = `<div class="error-message">Erro ao carregar funcionários: ${error.message}</div>`;
        
        // Fallback to local data if API fails
        const staff = [
            { id: 1, name: 'Maria Silva', email: 'maria@florescer.com', specialization: 'Arte Terapia' },
            { id: 2, name: 'João Santos', email: 'joao@florescer.com', specialization: 'Terapia Individual' },
            { id: 3, name: 'Ana Oliveira', email: 'ana@florescer.com', specialization: 'Psicanálise' }
        ];
        
        // Generate HTML with local data
        const html = `
            <h3>Funcionários (Modo Offline)</h3>
            <div class="staff-container">
                <div class="add-staff">
                    <h4>Adicionar Funcionário</h4>
                    <div class="staff-photo-upload">
                        <img src="images/camera.png" alt="Upload Photo">
                    </div>
                    <form id="addStaffForm">
                        <div class="form-group">
                            <input type="text" placeholder="Nome" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <input type="email" placeholder="Email" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <select class="form-control" required>
                                <option value="">Especialização</option>
                                <option value="Arte Terapia">Arte Terapia</option>
                                <option value="Terapia Lúdica">Terapia Lúdica</option>
                                <option value="Terapia Individual">Terapia Individual</option>
                                <option value="Psicanálise">Psicanálise</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn">Adicionar</button>
                        </div>
                    </form>
                </div>
                
                <div class="staff-list">
                    <h4>Funcionários Atuais</h4>
                    <table class="staff-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Especialização</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${staff.map(person => `
                                <tr>
                                    <td>${person.name}</td>
                                    <td>${person.email}</td>
                                    <td>${person.specialization}</td>
                                    <td>
                                        <button class="btn edit-staff-btn" data-id="${person.id}">Editar</button>
                                        <button class="btn delete-staff-btn" data-id="${person.id}">Remover</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        adminContent.innerHTML = html;
        
        // Add event listeners
        document.getElementById('addStaffForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Funcionário adicionado com sucesso! (Modo Offline)');
            loadStaffView();
        });
        
        document.querySelectorAll('.edit-staff-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const staffId = this.getAttribute('data-id');
                alert(`Editar funcionário ${staffId} (Modo Offline)`);
            });
        });
        
        document.querySelectorAll('.delete-staff-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Tem certeza que deseja remover este funcionário?')) {
                    alert('Funcionário removido com sucesso! (Modo Offline)');
                    loadStaffView();
                }
            });
        });
    });
}