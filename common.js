// Common JavaScript functions for Dr. V's Lab Reservation System

// Helper function to parse YYYY-MM-DD date string as a date in Central Time Zone
// Creates a Date object for date comparisons
function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date using components (for comparisons)
    return new Date(year, month - 1, day);
}

// Helper function to format date in Central Time Zone
// Takes a YYYY-MM-DD string and formats it as if it's in Central Time
function formatDateInCentral(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    // Create a date object representing noon Central Time for this date
    // Using noon avoids DST edge cases at midnight
    // Format: YYYY-MM-DDTHH:MM:SS-TZ
    // Central Time is UTC-6 (CST) or UTC-5 (CDT), we'll use UTC-6 as base
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00-06:00`;
    const date = new Date(dateStr);
    // Format in Central Time Zone (this ensures correct date display)
    return date.toLocaleDateString('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Helper function to format date with weekday in Central Time Zone
function formatDateWithWeekdayInCentral(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    // Create a date object representing noon Central Time for this date
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00-06:00`;
    const date = new Date(dateStr);
    // Format in Central Time Zone
    return date.toLocaleDateString('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

// Name verification modal for cancellation
async function showCancelModal(reservationId, reservationName) {
    const modal = document.getElementById('cancelModal');
    const nameInput = document.getElementById('cancelNameInput');
    const errorMsg = document.getElementById('cancelErrorMsg');
    const confirmBtn = document.getElementById('confirmCancelBtn');
    const reservationInfo = document.getElementById('cancelReservationInfo');
    
    // Get full reservation details
    const reservations = await Storage.getReservations();
    const reservation = reservations.find(r => r.id === reservationId);
    
    // Reset modal - always clear the input to force user to type the name again
    if (nameInput) {
        nameInput.value = '';
        nameInput.placeholder = 'Enter the booking name exactly as it appears';
    }
    if (errorMsg) {
        errorMsg.classList.remove('show');
        errorMsg.textContent = '';
    }
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm Cancellation';
        confirmBtn.style.background = ''; // Reset button color
    }
    
    // Show reservation details in modal
    if (reservation) {
        const formattedDate = formatDateInCentral(reservation.date);
        reservationInfo.innerHTML = `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
                <strong>Reservation Details:</strong><br>
                <span style="font-size: 0.9em;">${reservation.instrument}</span><br>
                <span style="font-size: 0.9em;">${formattedDate} at ${reservation.startTime} - ${reservation.endTime}</span>
                ${reservation.temperature ? `<br><span style="font-size: 0.9em;">Temperature: ${reservation.temperature}</span>` : ''}
                ${reservation.purpose ? `<br><span style="font-size: 0.9em;">Purpose: ${reservation.purpose}</span>` : ''}
            </div>
        `;
    }
    
    // Store reservation ID for confirmation
    confirmBtn.setAttribute('data-reservation-id', reservationId);
    confirmBtn.setAttribute('data-reservation-name', reservationName);
    
    // Show modal with animation
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Focus on input and select all text if any
    setTimeout(() => {
        nameInput.focus();
        nameInput.select();
    }, 100);
}

function closeCancelModal() {
    const modal = document.getElementById('cancelModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

async function verifyAndCancel() {
    const confirmBtn = document.getElementById('confirmCancelBtn');
    const nameInput = document.getElementById('cancelNameInput');
    const errorMsg = document.getElementById('cancelErrorMsg');
    
    // Prevent double submission
    if (confirmBtn.disabled) return;
    
    const reservationId = confirmBtn.getAttribute('data-reservation-id');
    const enteredName = nameInput.value.trim();
    
    // Clear previous error
    errorMsg.classList.remove('show');
    errorMsg.textContent = '';
    
    // Validate name is entered
    if (!enteredName) {
        errorMsg.textContent = 'Please enter the booking name to confirm cancellation.';
        errorMsg.classList.add('show');
        nameInput.focus();
        return;
    }
    
    // Disable button to prevent double submission
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Verifying...';
    
    // Get the actual reservation from storage to verify the name
    try {
        const reservations = await Storage.getReservations();
        const reservation = reservations.find(r => r.id === reservationId);
        
        if (!reservation) {
            errorMsg.textContent = 'Reservation not found. It may have already been cancelled.';
            errorMsg.classList.add('show');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Cancellation';
            setTimeout(() => closeCancelModal(), 2000);
            return;
        }
        
        // Get the actual booking name from the reservation
        const bookingName = reservation.name ? reservation.name.trim() : '';
        
        if (!bookingName) {
            errorMsg.textContent = 'This reservation does not have a name associated with it. Please contact the administrator.';
            errorMsg.classList.add('show');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Cancellation';
            return;
        }
        
        // Check if entered name matches the booking name (case-insensitive, trim whitespace)
        const normalizedEntered = enteredName.toLowerCase().trim();
        const normalizedBooking = bookingName.toLowerCase().trim();
        
        if (normalizedEntered !== normalizedBooking) {
            errorMsg.textContent = 'Name does not match the booking name. Please enter the exact name (case-insensitive) used when making this reservation.';
            errorMsg.classList.add('show');
            nameInput.focus();
            nameInput.select();
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Cancellation';
            return;
        }
        
        // Name matches, proceed with cancellation
        confirmBtn.textContent = 'Cancelling...';
        await Storage.deleteReservation(reservationId);
        
        // Show success message
        confirmBtn.textContent = '✓ Cancelled';
        confirmBtn.style.background = '#28a745';
        
        // Close modal after short delay
        setTimeout(() => {
            closeCancelModal();
            
            // Reload page content based on current page
            if (typeof loadReservations === 'function') {
                // If on view-reservations page, reload with current search name
                if (typeof currentSearchName !== 'undefined' && currentSearchName) {
                    loadReservations(currentSearchName);
                } else {
                    loadReservations();
                }
            } else if (typeof loadAvailability === 'function') {
                // If on check availability page, reload availability
                loadAvailability();
            } else {
                // If on details page, redirect to instruments
                localStorage.removeItem('viewingReservation');
                window.location.href = 'instruments.html';
            }
        }, 800);
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        errorMsg.textContent = 'An error occurred while cancelling. Please try again.';
        errorMsg.classList.add('show');
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm Cancellation';
    }
}

// Handle Enter key in name input
document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('cancelNameInput');
    if (nameInput) {
        nameInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                verifyAndCancel();
            }
        });
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('cancelModal');
    if (event.target === modal) {
        closeCancelModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('cancelModal');
        if (modal && modal.style.display === 'block') {
            closeCancelModal();
        }
    }
});

