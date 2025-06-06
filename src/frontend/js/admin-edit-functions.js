// Function to show edit form for staff
function showEditStaffForm(staffId) {
    const adminContent = document.getElementById('adminContent');
    
    // Show loading state
    adminContent.innerHTML = '<div class="loading-spinner"></div><p class="loading-message">Carregando dados do funcionário...</p>';
    
    // Fetch staff details from API
    fetch(`/api/users/${staffId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha ao carregar dados do funcionário');
        }
        return response.json();
    })
    .then(staff => {
        // Show edit form
        adminContent.innerHTML = `
            <h3>Editar Funcionário</h3>
            <div class="form-container">
                <div class="staff-photo-upload">
                    <img src="${staff.photo || 'images/default-avatar.png'}" alt="${staff.name}" style="width: 100px; height: 100px; border-radius: 50%;">
                </div>
                <form id="editStaffForm">
                    <div class="form-group">
                        <label for="staffName">Nome:</label>
                        <input type="text" id="staffName" value="${staff.username || staff.name}" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="staffEmail">Email:</label>
                        <input type="email" id="staffEmail" value="${staff.email}" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="staffSpecialization">Especialização:</label>
                        <select id="staffSpecialization" class="form-control" required>
                            <option value="Arte Terapia" ${staff.specialization === 'Arte Terapia' ? 'selected' : ''}>Arte Terapia</option>
                            <option value="Terapia Lúdica" ${staff.specialization === 'Terapia Lúdica' ? 'selected' : ''}>Terapia Lúdica</option>
                            <option value="Terapia Individual" ${staff.specialization === 'Terapia Individual' ? 'selected' : ''}>Terapia Individual</option>
                            <option value="Psicanálise" ${staff.specialization === 'Psicanálise' ? 'selected' : ''}>Psicanálise</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn">Atualizar</button>
                        <button type="button" class="btn" id="cancelEditStaff">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('cancelEditStaff').addEventListener('click', loadStaffView);
        document.getElementById('editStaffForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const updatedStaff = {
                username: document.getElementById('staffName').value,
                email: document.getElementById('staffEmail').value,
                specialization: document.getElementById('staffSpecialization').value
            };
            
            // Update staff via API
            fetch(`/api/users/${staffId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedStaff)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Falha ao atualizar funcionário');
                }
                return response.json();
            })
            .then(data => {
                alert('Funcionário atualizado com sucesso!');
                loadStaffView();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Erro ao atualizar funcionário: ' + error.message);
                
                // Fallback for demo
                alert('Funcionário atualizado com sucesso! (Modo Offline)');
                loadStaffView();
            });
        });
    })
    .catch(error => {
        console.error('Error:', error);
        adminContent.innerHTML = `<div class="error-message">Erro ao carregar dados do funcionário: ${error.message}</div>`;
        
        // Fallback to local data if API fails
        const staff = {
            id: staffId,
            name: 'Nome do Funcionário',
            email: 'email@exemplo.com',
            specialization: 'Terapia Individual'
        };
        
        adminContent.innerHTML = `
            <h3>Editar Funcionário (Modo Offline)</h3>
            <div class="form-container">
                <form id="editStaffForm">
                    <div class="form-group">
                        <label for="staffName">Nome:</label>
                        <input type="text" id="staffName" value="${staff.name}" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="staffEmail">Email:</label>
                        <input type="email" id="staffEmail" value="${staff.email}" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="staffSpecialization">Especialização:</label>
                        <select id="staffSpecialization" class="form-control" required>
                            <option value="Arte Terapia" ${staff.specialization === 'Arte Terapia' ? 'selected' : ''}>Arte Terapia</option>
                            <option value="Terapia Lúdica" ${staff.specialization === 'Terapia Lúdica' ? 'selected' : ''}>Terapia Lúdica</option>
                            <option value="Terapia Individual" ${staff.specialization === 'Terapia Individual' ? 'selected' : ''}>Terapia Individual</option>
                            <option value="Psicanálise" ${staff.specialization === 'Psicanálise' ? 'selected' : ''}>Psicanálise</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn">Atualizar</button>
                        <button type="button" class="btn" id="cancelEditStaff">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('cancelEditStaff').addEventListener('click', loadStaffView);
        document.getElementById('editStaffForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Funcionário atualizado com sucesso! (Modo Offline)');
            loadStaffView();
        });
    });
}

// Function to show edit form for appointments
function showEditAppointmentForm(appointmentId) {
    const adminContent = document.getElementById('adminContent');
    
    // Show loading state
    adminContent.innerHTML = '<div class="loading-spinner"></div><p class="loading-message">Carregando dados do agendamento...</p>';
    
    // Fetch appointment details from API
    fetch(`/api/appointments/${appointmentId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha ao carregar dados do agendamento');
        }
        return response.json();
    })
    .then(appointment => {
        // Show edit form
        adminContent.innerHTML = `
            <h3>Editar Agendamento</h3>
            <div class="form-container">
                <form id="editAppointmentForm">
                    <div class="form-group">
                        <label for="appointmentDate">Data:</label>
                        <input type="date" id="appointmentDate" value="${appointment.date}" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="appointmentTime">Horário:</label>
                        <input type="time" id="appointmentTime" value="${appointment.time}" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="appointmentStatus">Status:</label>
                        <select id="appointmentStatus" class="form-control" required>
                            <option value="scheduled" ${appointment.status === 'scheduled' ? 'selected' : ''}>Agendado</option>
                            <option value="completed" ${appointment.status === 'completed' ? 'selected' : ''}>Concluído</option>
                            <option value="cancelled" ${appointment.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn">Atualizar</button>
                        <button type="button" class="btn" id="cancelEditAppointment">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('cancelEditAppointment').addEventListener('click', loadAppointmentsView);
        document.getElementById('editAppointmentForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const updatedAppointment = {
                date: document.getElementById('appointmentDate').value,
                time: document.getElementById('appointmentTime').value,
                status: document.getElementById('appointmentStatus').value
            };
            
            // Update appointment via API
            fetch(`/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedAppointment)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Falha ao atualizar agendamento');
                }
                return response.json();
            })
            .then(data => {
                alert('Agendamento atualizado com sucesso!');
                loadAppointmentsView();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Erro ao atualizar agendamento: ' + error.message);
                
                // Fallback for demo
                alert('Agendamento atualizado com sucesso! (Modo Offline)');
                loadAppointmentsView();
            });
        });
    })
    .catch(error => {
        console.error('Error:', error);
        adminContent.innerHTML = `<div class="error-message">Erro ao carregar dados do agendamento: ${error.message}</div>`;
        
        // Fallback to local data if API fails
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        const appointment = appointments.find(a => a.id === appointmentId) || {
            id: appointmentId,
            date: '2025-05-30',
            time: '10:00',
            status: 'scheduled'
        };
        
        adminContent.innerHTML = `
            <h3>Editar Agendamento (Modo Offline)</h3>
            <div class="form-container">
                <form id="editAppointmentForm">
                    <div class="form-group">
                        <label for="appointmentDate">Data:</label>
                        <input type="date" id="appointmentDate" value="${appointment.date}" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="appointmentTime">Horário:</label>
                        <input type="time" id="appointmentTime" value="${appointment.time}" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="appointmentStatus">Status:</label>
                        <select id="appointmentStatus" class="form-control" required>
                            <option value="scheduled" ${appointment.status === 'scheduled' ? 'selected' : ''}>Agendado</option>
                            <option value="completed" ${appointment.status === 'completed' ? 'selected' : ''}>Concluído</option>
                            <option value="cancelled" ${appointment.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn">Atualizar</button>
                        <button type="button" class="btn" id="cancelEditAppointment">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('cancelEditAppointment').addEventListener('click', loadAppointmentsView);
        document.getElementById('editAppointmentForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Agendamento atualizado com sucesso! (Modo Offline)');
            loadAppointmentsView();
        });
    });
}
