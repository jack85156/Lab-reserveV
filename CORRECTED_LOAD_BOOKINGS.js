// ============================================
// ✅ CORRECTED CODE - Use Storage API
// ============================================
// This uses the existing Storage API which already handles Supabase connection
// No need to manually create Supabase client - it's already done in storage.js

async function loadBookings() {
    try {
        // Use the existing Storage API (already configured with Supabase)
        // This automatically uses Supabase if configured, or localStorage as fallback
        const bookings = await Storage.getReservations();
        
        if (!Array.isArray(bookings)) {
            console.error('Bookings is not an array:', bookings);
            return [];
        }
        
        console.log("Loaded from cloud:", bookings);
        console.log(`Found ${bookings.length} bookings`);
        
        // Clear current calendar view (if you have one)
        // const calendarContainer = document.getElementById('calendar');
        // if (calendarContainer) {
        //     calendarContainer.innerHTML = '';
        // }
        
        // Render the bookings
        bookings.forEach(booking => {
            console.log('Booking:', booking);
            
            // Field names in your bookings table:
            // - booking.id
            // - booking.instrument
            // - booking.name (not 'user_name')
            // - booking.date (format: YYYY-MM-DD)
            // - booking.startTime (not 'start_time', format: HH:MM)
            // - booking.endTime (not 'end_time', format: HH:MM)
            // - booking.purpose (optional)
            // - booking.temperature (optional)
            // - booking.site (optional)
            
            // Example: Add booking to calendar
            // addBlockToCalendar(
            //     booking.instrument, 
            //     booking.name,
            //     booking.startTime,
            //     booking.endTime
            // );
        });
        
        return bookings;
    } catch (error) {
        console.error("Error loading bookings:", error);
        return [];
    }
}

// Call this when page loads
// loadBookings();

// ============================================
// If you need to filter by instrument:
// ============================================

async function loadBookingsForInstrument(instrumentName) {
    try {
        const allBookings = await Storage.getReservations();
        const instrumentBookings = allBookings.filter(b => b.instrument === instrumentName);
        
        console.log(`Found ${instrumentBookings.length} bookings for ${instrumentName}`);
        return instrumentBookings;
    } catch (error) {
        console.error("Error loading bookings for instrument:", error);
        return [];
    }
}

// ============================================
// If you REALLY need direct Supabase access:
// ============================================
// (Only use this if you need something the Storage API doesn't provide)

async function loadBookingsDirectSupabase() {
    // Get credentials from config (already set in supabase-config.js)
    const supabaseUrl = window.SUPABASE_URL;
    const supabaseKey = window.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials not configured');
        return [];
    }
    
    // Check if Supabase library is loaded
    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
        console.error('Supabase library not loaded. Make sure the CDN script is included.');
        return [];
    }
    
    // Create client
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    try {
        // ✅ FIXED: Use 'bookings' table (not 'reservations')
        const { data: bookings, error } = await supabase
            .from('bookings')  // ← Changed from 'reservations' to 'bookings'
            .select('*')
            .order('date', { ascending: true })
            .order('startTime', { ascending: true });
        
        if (error) {
            console.error("Error loading from Supabase:", error);
            return [];
        }
        
        console.log("Loaded from cloud:", bookings);
        
        // Render the bookings
        bookings.forEach(booking => {
            // Field names:
            // - booking.instrument
            // - booking.name (not booking.user_name)
            // - booking.startTime (not booking.start_time)
            // - booking.endTime (not booking.end_time)
            
            console.log('Booking:', booking);
            // addBlockToCalendar(booking.instrument, booking.name, booking.startTime, booking.endTime);
        });
        
        return bookings;
    } catch (error) {
        console.error("Error loading bookings:", error);
        return [];
    }
}

