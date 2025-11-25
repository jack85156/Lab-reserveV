// ============================================
// CORRECT WAY: Use the existing Storage API
// ============================================
// This is the recommended approach - it already handles Supabase connection
// and works with both cloud (Supabase) and local (localStorage) storage

async function loadBookings() {
    try {
        // Use the existing Storage API (already configured in storage.js)
        const bookings = await Storage.getReservations();
        
        console.log("Loaded from cloud:", bookings);
        console.log(`Found ${bookings.length} bookings`);
        
        // Clear current calendar view (if needed)
        // const calendarContainer = document.getElementById('availability-container');
        // if (calendarContainer) {
        //     calendarContainer.innerHTML = '';
        // }
        
        // Render the bookings
        bookings.forEach(booking => {
            console.log('Booking:', booking);
            // Example: Add booking to calendar
            // addBlockToCalendar(
            //     booking.instrument, 
            //     booking.name,  // Note: field is 'name', not 'user_name'
            //     booking.startTime,  // Note: field is 'startTime', not 'start_time'
            //     booking.endTime     // Note: field is 'endTime', not 'end_time'
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
// ALTERNATIVE: Direct Supabase (if you really need it)
// ============================================
// Only use this if you need direct Supabase access for something specific
// Otherwise, use Storage.getReservations() above

async function loadBookingsDirect() {
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
        // IMPORTANT: Use 'bookings' table (not 'reservations')
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
            // Note: Field names match what's in storage.js:
            // - booking.instrument (not booking.resource)
            // - booking.name (not booking.user_name)
            // - booking.date
            // - booking.startTime (not booking.start_time)
            // - booking.endTime (not booking.end_time)
            // - booking.purpose (optional)
            // - booking.temperature (optional)
            // - booking.site (optional)
            
            console.log('Booking:', booking);
            // addBlockToCalendar(booking.instrument, booking.name, booking.startTime, booking.endTime);
        });
        
        return bookings;
    } catch (error) {
        console.error("Error loading bookings:", error);
        return [];
    }
}

// ============================================
// FIELD NAME REFERENCE
// ============================================
// The bookings table has these fields (from storage.js):
// - id: TEXT (primary key)
// - instrument: TEXT (required)
// - name: TEXT (required) 
// - date: TEXT (required, format: YYYY-MM-DD)
// - startTime: TEXT (required, format: HH:MM)
// - endTime: TEXT (required, format: HH:MM)
// - purpose: TEXT (optional)
// - temperature: TEXT (optional)
// - site: TEXT (optional)
// - created_at: TIMESTAMP (auto-generated)

// ============================================
// RECOMMENDED: Use Storage API
// ============================================
// The Storage API (Storage.getReservations()) is the best way because:
// 1. It automatically uses Supabase if configured, or localStorage as fallback
// 2. It handles all error cases
// 3. It's already integrated into all your HTML pages
// 4. It maintains consistency across your app
//
// Example usage in your code:
//
// async function updateCalendar() {
//     const bookings = await Storage.getReservations();
//     // Filter by instrument if needed
//     const instrumentBookings = bookings.filter(b => b.instrument === 'Mastersizer');
//     // Render calendar...
// }

