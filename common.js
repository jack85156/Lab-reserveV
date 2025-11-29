(() => {
    const CENTRAL_TZ = 'America/Chicago';

    const cancelState = {
        reservationId: null,
        reservationName: '',
        requiresName: true,
        context: 'default'
    };

    function parseLocalDate(dateString) {
        if (!dateString) return null;
        const parts = dateString.split('-').map(Number);
        if (parts.length !== 3 || parts.some(isNaN)) return null;
        const [year, month, day] = parts;
        return new Date(year, month - 1, day);
    }

    function formatDateInCentral(dateString) {
        const date = parseLocalDate(dateString);
        if (!date) return dateString || 'Date not available';
        return date.toLocaleDateString('en-US', {
            timeZone: CENTRAL_TZ,
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatDateWithWeekdayInCentral(dateString) {
        const date = parseLocalDate(dateString);
        if (!date) return dateString || 'Date not available';
        return date.toLocaleDateString('en-US', {
            timeZone: CENTRAL_TZ,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    }

    function showCancelModal(reservationId, reservationName = '', context = 'default') {
        const modal = document.getElementById('cancelModal');
        const info = document.getElementById('cancelReservationInfo');
        const input = document.getElementById('cancelNameInput');
        const errorMsg = document.getElementById('cancelErrorMsg');
        const confirmBtn = document.getElementById('confirmCancelBtn');

        if (!modal || !info || !input || !errorMsg || !confirmBtn) {
            alert('Cancellation modal is not available on this page.');
            return;
        }

        cancelState.reservationId = reservationId;
        cancelState.reservationName = (reservationName || '').trim();
        cancelState.requiresName = Boolean(cancelState.reservationName.length);
        cancelState.context = context || 'default';

        info.innerHTML = cancelState.requiresName
            ? `Reservation for <strong>${cancelState.reservationName}</strong>`
            : 'Reservation name is not available. You can cancel without entering a name.';

        input.value = '';
        input.disabled = !cancelState.requiresName;
        input.placeholder = cancelState.requiresName
            ? 'Enter the booking name exactly as it appears'
            : 'No name provided for this booking';

        errorMsg.textContent = '';
        errorMsg.classList.remove('show');

        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm Cancellation';

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        if (cancelState.requiresName) {
            setTimeout(() => input.focus(), 50);
        }
    }

    function closeCancelModal() {
        const modal = document.getElementById('cancelModal');
        if (modal) {
            modal.style.display = 'none';
        }
        document.body.style.overflow = '';
        cancelState.reservationId = null;
        cancelState.reservationName = '';
        cancelState.requiresName = true;
        cancelState.context = 'default';
    }

    async function verifyAndCancel() {
        const input = document.getElementById('cancelNameInput');
        const errorMsg = document.getElementById('cancelErrorMsg');
        const confirmBtn = document.getElementById('confirmCancelBtn');

        if (!cancelState.reservationId) {
            errorMsg.textContent = 'Reservation information is missing.';
            errorMsg.classList.add('show');
            return;
        }

        const enteredName = input ? input.value.trim() : '';

        if (cancelState.requiresName) {
            if (!enteredName) {
                errorMsg.textContent = 'Please enter the booking name exactly as it appears.';
                errorMsg.classList.add('show');
                return;
            }
            if (enteredName !== cancelState.reservationName) {
                errorMsg.textContent = 'The name does not match the reservation. Please try again.';
                errorMsg.classList.add('show');
                return;
            }
        }

        if (errorMsg) {
            errorMsg.textContent = '';
            errorMsg.classList.remove('show');
        }

        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Cancelling...';

        try {
            if (!window.Storage || typeof Storage.deleteReservation !== 'function') {
                throw new Error('Storage system is not available.');
            }

            await Storage.deleteReservation(cancelState.reservationId);
            alert('Reservation cancelled successfully.');
            const destinationContext = cancelState.context;
            closeCancelModal();

            if (destinationContext === 'check-availability') {
                if (typeof loadAvailability === 'function') {
                    loadAvailability();
                } else {
                    window.location.reload();
                }
            } else {
                window.location.href = 'view-reservations.html';
            }
        } catch (error) {
            console.error('Failed to cancel reservation:', error);
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Cancellation';
            errorMsg.textContent = error.message || 'Failed to cancel reservation. Please try again.';
            errorMsg.classList.add('show');
        }
    }

    window.parseLocalDate = parseLocalDate;
    window.formatDateInCentral = formatDateInCentral;
    window.formatDateWithWeekdayInCentral = formatDateWithWeekdayInCentral;
    window.showCancelModal = showCancelModal;
    window.closeCancelModal = closeCancelModal;
    window.verifyAndCancel = verifyAndCancel;
})();
