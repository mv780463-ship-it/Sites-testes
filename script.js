document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menuToggle');
    const navbar = document.getElementById('navbar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        });
    }

    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-xmark');
        });
    });

    // --- Active Link Highlighting on Scroll ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- Booking Form Logic ---
    const bookingForm = document.getElementById('bookingForm');
    const serviceSelect = document.getElementById('serviceSelect');
    const barberSelect = document.getElementById('barberSelect');
    const dateInput = document.getElementById('dateInput');
    const timeSlotsContainer = document.getElementById('timeSlotsContainer');
    const selectedTimeInput = document.getElementById('selectedTime');
    
    // Summary elements
    const sumService = document.getElementById('sumService');
    const sumBarber = document.getElementById('sumBarber');
    const sumDateTime = document.getElementById('sumDateTime');
    const sumPrice = document.getElementById('sumPrice');

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // Function to generate time slots
    const generateTimeSlots = (selectedDate) => {
        timeSlotsContainer.innerHTML = '';
        const slots = [
            '09:00', '09:40', '10:20', '11:00', '11:40', 
            '14:00', '14:40', '15:20', '16:00', '16:40', '17:20', '18:00', '18:40', '19:20'
        ];

        // Simulate some busy slots
        const busySlots = ['10:20', '15:20', '18:00'];

        slots.forEach(time => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = time;

            if (busySlots.includes(time)) {
                slot.classList.add('disabled');
                slot.title = 'Horário indisponível';
            } else {
                slot.addEventListener('click', () => {
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    slot.classList.add('selected');
                    selectedTimeInput.value = time;
                    updateSummary();
                });
            }

            timeSlotsContainer.appendChild(slot);
        });
    };

    dateInput.addEventListener('change', (e) => {
        generateTimeSlots(e.target.value);
        updateSummary();
    });

    const updateSummary = () => {
        // Service & Price
        if (serviceSelect.value) {
            const [name, price] = serviceSelect.value.split('|');
            sumService.textContent = name;
            sumPrice.textContent = `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}`;
        }

        // Barber
        sumBarber.textContent = barberSelect.value || 'Não selecionado';

        // Date & Time
        const date = dateInput.value;
        const time = selectedTimeInput.value;
        
        if (date && time) {
            const formattedDate = date.split('-').reverse().join('/');
            sumDateTime.textContent = `${formattedDate} às ${time}`;
        } else if (date) {
            const formattedDate = date.split('-').reverse().join('/');
            sumDateTime.textContent = `${formattedDate} (Escolha o horário)`;
        } else {
            sumDateTime.textContent = 'Não selecionado';
        }
    };

    // Listen for changes in selects
    serviceSelect.addEventListener('change', updateSummary);
    barberSelect.addEventListener('change', updateSummary);

    // --- Service Selection from Cards ---
    const selectButtons = document.querySelectorAll('.select-service-btn');
    selectButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.service-card');
            const serviceName = card.dataset.service;
            const price = card.dataset.price.replace('R$', '').replace(',', '.').trim();
            
            // Set value in select
            serviceSelect.value = `${serviceName}|${price}`;
            
            // Scroll to booking form
            document.getElementById('agendamento').scrollIntoView({ behavior: 'smooth' });
            
            updateSummary();
        });
    });

    // --- Modal Logic ---
    const modal = document.getElementById('successModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalWhatsappBtn = document.getElementById('modalWhatsappBtn');

    const showModal = (data) => {
        modalMessage.innerHTML = `
            <p>Olá <strong>${data.name}</strong>!</p>
            <p>Seu agendamento para <strong>${data.service}</strong> com <strong>${data.barber}</strong> está quase pronto.</p>
            <p>Data: <strong>${data.date}</strong> às <strong>${data.time}</strong>.</p>
            <p style="margin-top: 15px; font-size: 14px;">Clique no botão abaixo para confirmar os detalhes via WhatsApp e garantir sua vaga!</p>
        `;
        
        const text = encodeURIComponent(
            `Olá MVBarbearia! Gostaria de confirmar meu agendamento:\n\n` +
            `*Nome:* ${data.name}\n` +
            `*Serviço:* ${data.service}\n` +
            `*Barbeiro:* ${data.barber}\n` +
            `*Data:* ${data.date}\n` +
            `*Horário:* ${data.time}\n` +
            `*Obs:* ${data.notes || 'Nenhuma'}\n\n` +
            `Aguardo confirmação!`
        );
        
        modalWhatsappBtn.href = `https://wa.me/5511999998888?text=${text}`;
        modal.classList.add('active');
    };

    modalCloseBtn.addEventListener('click', () => modal.classList.remove('active'));
    modalBackdrop.addEventListener('click', () => modal.classList.remove('active'));

    // --- Form Submission ---
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!selectedTimeInput.value) {
            alert('Por favor, selecione um horário disponível.');
            return;
        }

        const [serviceName] = serviceSelect.value.split('|');
        const formData = {
            name: document.getElementById('clientName').value,
            phone: document.getElementById('clientPhone').value,
            service: serviceName,
            barber: barberSelect.value,
            date: dateInput.value.split('-').reverse().join('/'),
            time: selectedTimeInput.value,
            notes: document.getElementById('clientNotes').value
        };

        showModal(formData);
    });
});
