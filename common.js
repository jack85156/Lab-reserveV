// Common front‑end helpers for Dr. V's Lab reservation system

// ---- Cancel reservation modal logic (used on reservation-details.html) ----

let _cancelReservationId = null;
let _cancelReservationName = null;

// Open the cancel modal and remember which reservation we're working with
function showCancelModal(reservationId, reservationName) {
    _cancelReservationId = reservationId;
    _cancelReservationName = (reservationName || '').trim();

    const modal = document.getElementById('cancelModal');
    const infoEl = document.getElementById('cancelReservationInfo');
    const nameInput = document.getElementById('cancelNameInput');
    const errorEl = document.getElementById('cancelErrorMsg');
    const confirmBtn = document.getElementById('confirmCancelBtn');

    if (!modal || !infoEl || !nameInput || !errorEl || !confirmBtn) {
        console.error('Cancel modal elements not found in DOM.');
        return;
    }

    infoEl.textContent = _cancelReservationName
        ? `Reservation for: ${_cancelReservationName}`
        : 'Reservation (name not recorded)';

    nameInput.value = '';
    nameInput.classList.remove('error');
    errorEl.classList.remove('show');
    errorEl.textContent = '';
    confirmBtn.disabled = false;

    modal.style.display = 'block';
    // small timeout so CSS transition can apply
    requestAnimationFrame(() => modal.classList.add('show'));
}

// Close the cancel modal and clear state
function closeCancelModal() {
    const modal = document.getElementById('cancelModal');
    const nameInput = document.getElementById('cancelNameInput');
    const errorEl = document.getElementById('cancelErrorMsg');
    const confirmBtn = document.getElementById('confirmCancelBtn');

    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200);
    }

    if (nameInput) {
        nameInput.value = '';
        nameInput.classList.remove('error');
    }
    if (errorEl) {
        errorEl.classList.remove('show');
        errorEl.textContent = '';
    }
    if (confirmBtn) {
        confirmBtn.disabled = false;
    }

    _cancelReservationId = null;
    _cancelReservationName = null;
}

// Verify name and cancel reservation via Storage helper
async function verifyAndCancel() {
    const nameInput = document.getElementById('cancelNameInput');
    const errorEl = document.getElementById('cancelErrorMsg');
    const confirmBtn = document.getElementById('confirmCancelBtn');

    if (!nameInput || !errorEl || !confirmBtn) {
        console.error('Cancel modal elements missing.');
        return;
    }

    const enteredName = (nameInput.value || '').trim();

    if (!enteredName) {
        nameInput.classList.add('error');
        errorEl.textContent = 'Please enter your name to confirm cancellation.';
        errorEl.classList.add('show');
        return;
    }

    // If we have a stored name, require it to match (case‑insensitive)
    if (_cancelReservationName &&
        enteredName.toLowerCase() !== _cancelReservationName.toLowerCase()) {
        nameInput.classList.add('error');
        errorEl.textContent = 'Name does not match the reservation. Please try again.';
        errorEl.classList.add('show');
        return;
    }

    if (!_cancelReservationId) {
        console.error('No reservation id stored for cancellation.');
        errorEl.textContent = 'Unable to cancel: missing reservation id.';
        errorEl.classList.add('show');
        return;
    }

    confirmBtn.disabled = true;
    errorEl.classList.remove('show');
    nameInput.classList.remove('error');

    try {
        if (typeof Storage !== 'undefined' && Storage.deleteReservation) {
            await Storage.deleteReservation(_cancelReservationId);
        } else {
            // Fallback: operate directly on localStorage if Storage helper missing
            let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
            reservations = reservations.filter(r => r.id !== _cancelReservationId);
            localStorage.setItem('reservations', JSON.stringify(reservations));
        }

        // Clear currently viewed reservation so details page does not show stale data
        localStorage.removeItem('viewingReservation');

        alert('Reservation cancelled successfully.');
        closeCancelModal();
        // Go back to list
        window.location.href = 'view-reservations.html';
    } catch (err) {
        console.error('Failed to cancel reservation:', err);
        errorEl.textContent = 'Something went wrong while cancelling. Please try again.';
        errorEl.classList.add('show');
        confirmBtn.disabled = false;
    }
}

