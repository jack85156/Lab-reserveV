// Storage abstraction layer for Dr. V's Lab Reservation System
// Uses Supabase for cloud database storage

// Supabase configuration
// Replace these with your Supabase project credentials
// These should be set in your HTML files before loading this script:
// <script>
//   window.SUPABASE_URL = 'https://ldfeumcasypgprhtbvpp.supabase.co';
//   window.SUPABASE_ANON_KEY = 'sb_publishable_vXEIEUWtBo9osE15js3mBA_s_Dm0Uwl';
// </script>
const SUPABASE_URL = window.SUPABASE_URL || null;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || null;

// Table name in Supabase
const RESERVATIONS_TABLE = 'bookings';

// Initialize Supabase client if credentials are available
// Note: Supabase client must be loaded via CDN script tag in HTML before this script
let supabase = null;

// Function to initialize Supabase client
function initSupabase() {
    // Check if credentials are still placeholders
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        if (SUPABASE_URL.includes('your-project-id') || SUPABASE_ANON_KEY.includes('your-anon-key')) {
            console.warn('⚠️ Supabase credentials are still placeholders!');
            console.warn('   Please update supabase-config.js with your actual Supabase credentials.');
            console.warn('   See SUPABASE_SETUP.md or QUICK_START.md for instructions.');
            return;
        }
    } else {
        return; // No credentials, skip initialization
    }
    
    // Try different ways the Supabase library might be exposed
    let createClient = null;
    
    // Method 1: Check for Supabase UMD build - the actual way it's exposed
    // The UMD build from jsdelivr exposes it as window.supabase.createClient
    if (typeof window.supabase !== 'undefined') {
        // Check if it's the actual Supabase object with createClient
        if (typeof window.supabase.createClient === 'function') {
            createClient = window.supabase.createClient;
        }
        // Check for default export pattern
        else if (window.supabase.default && typeof window.supabase.default.createClient === 'function') {
            createClient = window.supabase.default.createClient;
        }
        // Check if createClient is directly on the object
        else if (window.supabase.supabase && typeof window.supabase.supabase.createClient === 'function') {
            createClient = window.supabase.supabase.createClient;
        }
    }
    // Method 2: Check for global supabase (without window)
    else if (typeof supabase !== 'undefined') {
        if (typeof supabase.createClient === 'function') {
            createClient = supabase.createClient;
        } else if (supabase.default && typeof supabase.default.createClient === 'function') {
            createClient = supabase.default.createClient;
        }
    }
    // Method 3: Check if it's exposed as a factory function
    else if (typeof window.createSupabaseClient === 'function') {
        // Some builds expose it as a factory
        createClient = window.createSupabaseClient;
    }
    
    // If we found createClient, initialize
    if (createClient) {
        try {
            supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase client initialized successfully');
            return;
        } catch (error) {
            console.error('❌ Failed to initialize Supabase client:', error);
            return;
        }
    }
    
    // If we didn't find it, try again after a delay (script might still be loading)
    setTimeout(() => {
        if (supabase) return; // Already initialized
        
        // Try again with same checks
        if (typeof window.supabase !== 'undefined') {
            if (typeof window.supabase.createClient === 'function') {
                try {
                    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    console.log('✅ Supabase client initialized (delayed)');
                    return;
                } catch (error) {
                    console.error('❌ Failed to initialize Supabase client (delayed):', error);
                }
            }
        }
        
        // If still not initialized, show helpful error
        if (!supabase) {
            console.error('❌ Supabase library not found!');
            console.error('   Make sure you have included this BEFORE storage.js:');
            console.error('   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>');
            console.error('   Current SUPABASE_URL:', SUPABASE_URL);
            console.error('   Check browser Network tab to see if Supabase script loaded successfully.');
        }
    }, 500);
}

// Initialize on load
initSupabase();

// Log which storage is being used
console.log('Storage Configuration:', {
    hostname: window.location.hostname,
    usingSupabase: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
    storageType: (SUPABASE_URL && SUPABASE_ANON_KEY) ? 'CLOUD (Supabase)' : 'LOCAL (localStorage)'
});

// Storage functions that work with both localStorage and Supabase
const Storage = {
    // Get all reservations
    async getReservations() {
        // Check if Supabase is properly initialized and credentials are real (not placeholders)
        if (supabase && SUPABASE_URL && SUPABASE_ANON_KEY && 
            !SUPABASE_URL.includes('your-project-id') && 
            !SUPABASE_ANON_KEY.includes('your-anon-key')) {
            try {
                console.log('Fetching reservations from Supabase...');
                console.log('Supabase URL:', SUPABASE_URL);
                console.log('Table name:', RESERVATIONS_TABLE);
                
                const { data, error } = await supabase
                    .from(RESERVATIONS_TABLE)
                    .select('*')
                    .order('date', { ascending: true })
                    .order('startTime', { ascending: true });
                
                if (error) {
                    console.error('Supabase error:', error);
                    console.error('Error code:', error.code);
                    console.error('Error details:', error.details);
                    console.error('Error hint:', error.hint);
                    
                    // Provide specific error messages
                    if (error.code === '42P01' || error.message.includes('does not exist')) {
                        throw new Error(`Table '${RESERVATIONS_TABLE}' does not exist. Please create it in Supabase Dashboard → SQL Editor.`);
                    } else if (error.code === '42501' || error.message.includes('permission denied')) {
                        throw new Error(`Permission denied. Check Row Level Security (RLS) policies in Supabase Dashboard.`);
                    } else {
                        throw new Error(`Failed to fetch reservations: ${error.message} (Code: ${error.code || 'unknown'})`);
                    }
                }
                
                console.log('Supabase returned data:', data?.length || 0, 'reservations');
                
                // Ensure we have an array
                const reservations = Array.isArray(data) ? data : [];
                
                // Check for reservations with missing names
                const missingNames = reservations.filter(r => !r.name || !r.name.trim());
                if (missingNames.length > 0) {
                    console.warn('Found reservations with missing names from Supabase:', missingNames);
                }
                
                // Log all names for debugging
                const allNames = reservations.map(r => r.name).filter(n => n);
                console.log('All reservation names from Supabase:', allNames);
                
                return reservations;
            } catch (error) {
                console.error('❌ ERROR: Failed to fetch reservations from Supabase:', error);
                console.error('Error details:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    hostname: window.location.hostname,
                    supabaseUrl: SUPABASE_URL
                });
                
                // Check if it's a network error
                const isNetworkError = error.message.includes('Failed to fetch') || 
                                      error.message.includes('NetworkError') ||
                                      error.name === 'TypeError' ||
                                      error.message.includes('fetch');
                
                // Show user-friendly error with specific guidance
                let errorMsg = `⚠️ Cloud database connection failed.\n\n`;
                
                if (isNetworkError) {
                    errorMsg += `Network Error: ${error.message}\n\n`;
                    errorMsg += `Possible causes:\n`;
                    errorMsg += `1. Table '${RESERVATIONS_TABLE}' doesn't exist - Create it in Supabase Dashboard → SQL Editor\n`;
                    errorMsg += `2. Supabase project is paused - Check Supabase Dashboard\n`;
                    errorMsg += `3. Network/firewall blocking - Try from a different network\n`;
                    errorMsg += `4. Wrong Supabase URL - Verify in supabase-config.js\n`;
                    errorMsg += `5. CORS issue - Check browser console for CORS errors\n\n`;
                    errorMsg += `Quick fix:\n`;
                    errorMsg += `- Go to Supabase Dashboard → SQL Editor\n`;
                    errorMsg += `- Run the CREATE TABLE SQL (see SUPABASE_SETUP.md)\n`;
                    errorMsg += `- Verify project is active (not paused)\n`;
                } else {
                    errorMsg += `Error: ${error.message}\n\n`;
                    errorMsg += `This means:\n`;
                    errorMsg += `- Bookings won't be shared across devices\n`;
                    errorMsg += `- Using local storage as fallback\n\n`;
                    errorMsg += `To fix:\n`;
                    errorMsg += `1. Check Supabase project is set up correctly\n`;
                    errorMsg += `2. Verify SUPABASE_URL and SUPABASE_ANON_KEY are configured\n`;
                    errorMsg += `3. Check browser console for details`;
                }
                
                console.warn(errorMsg);
                
                // Fallback to localStorage if Supabase fails
                const localData = JSON.parse(localStorage.getItem('reservations') || '[]');
                console.warn('⚠️ Falling back to localStorage. Bookings are NOT shared across devices!');
                console.warn('Local storage has', localData.length, 'reservations');
                return localData;
            }
        } else {
            // Use localStorage
            const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
            console.log('Retrieved reservations from localStorage:', reservations.length);
            // Check for reservations with missing names
            const missingNames = reservations.filter(r => !r.name || !r.name.trim());
            if (missingNames.length > 0) {
                console.warn('Found reservations with missing names:', missingNames);
            }
            // Log all names for debugging
            const allNames = reservations.map(r => r.name).filter(n => n);
            console.log('All reservation names from localStorage:', allNames);
            return reservations;
        }
    },

    // Save a reservation
    async saveReservation(reservation) {
        // Debug: Log current state
        console.log('=== saveReservation called ===');
        console.log('supabase client:', supabase ? 'Initialized' : 'NOT INITIALIZED');
        console.log('SUPABASE_URL:', SUPABASE_URL);
        console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Set (' + SUPABASE_ANON_KEY.length + ' chars)' : 'NOT SET');
        console.log('RESERVATIONS_TABLE:', RESERVATIONS_TABLE);
        
        // Check if Supabase is properly initialized
        if (supabase && SUPABASE_URL && SUPABASE_ANON_KEY && 
            !SUPABASE_URL.includes('your-project-id') && 
            !SUPABASE_ANON_KEY.includes('your-anon-key')) {
            console.log('✅ Using Supabase for save');
            try {
                console.log('Saving reservation to Supabase:', reservation);
                
                // Validate required fields
                if (!reservation.instrument || !reservation.name || !reservation.date || !reservation.startTime || !reservation.endTime) {
                    throw new Error('Missing required fields');
                }
                
                // Ensure name is trimmed and not empty
                if (!reservation.name.trim()) {
                    throw new Error('Name cannot be empty');
                }
                
                // Generate ID if not provided
                reservation.id = reservation.id || Date.now().toString();
                
                // Ensure name is a string and trimmed
                reservation.name = String(reservation.name).trim();
                
                console.log('Attempting to insert into table:', RESERVATIONS_TABLE);
                console.log('Reservation data:', JSON.stringify(reservation, null, 2));
                console.log('Supabase client type:', typeof supabase);
                console.log('Supabase client methods:', Object.keys(supabase || {}));
                
                // Test connection first
                try {
                    const testQuery = await supabase.from(RESERVATIONS_TABLE).select('id').limit(1);
                    console.log('Test query result:', testQuery);
                    if (testQuery.error && testQuery.error.code === '42P01') {
                        throw new Error(`Table '${RESERVATIONS_TABLE}' does not exist. Please create it in Supabase Dashboard → SQL Editor.`);
                    }
                } catch (testError) {
                    console.error('Test query failed:', testError);
                    if (testError.message.includes('does not exist')) {
                        throw testError;
                    }
                }
                
                // Prepare reservation data - only include fields that exist in the table
                // Required fields: id, instrument, name, date, startTime, endTime
                const reservationData = {
                    id: reservation.id,
                    instrument: reservation.instrument,
                    name: reservation.name,
                    date: reservation.date,
                    startTime: reservation.startTime,
                    endTime: reservation.endTime
                };
                
                // Optional fields - only include if they exist and have values
                // These columns must exist in the table (add them via SQL if missing)
                if (reservation.purpose !== undefined && reservation.purpose !== null && reservation.purpose !== '') {
                    reservationData.purpose = reservation.purpose;
                }
                if (reservation.temperature !== undefined && reservation.temperature !== null && reservation.temperature !== '') {
                    reservationData.temperature = reservation.temperature;
                }
                if (reservation.site !== undefined && reservation.site !== null && reservation.site !== '') {
                    reservationData.site = reservation.site;
                }
                
                console.log('Prepared reservation data for insert:', JSON.stringify(reservationData, null, 2));
                
                // Perform the insert
                const insertResult = await supabase
                    .from(RESERVATIONS_TABLE)
                    .insert([reservationData])
                    .select()
                    .single();
                
                console.log('Insert result:', insertResult);
                console.log('Insert data:', insertResult.data);
                console.log('Insert error:', insertResult.error);
                
                if (insertResult.error) {
                    const error = insertResult.error;
                    console.error('❌ Supabase save error:', error);
                    console.error('Error code:', error.code);
                    console.error('Error message:', error.message);
                    console.error('Error details:', error.details);
                    console.error('Error hint:', error.hint);
                    console.error('Full error object:', JSON.stringify(error, null, 2));
                    
                    // Provide specific error messages
                    if (error.code === '42P01' || error.message.includes('does not exist')) {
                        throw new Error(`Table '${RESERVATIONS_TABLE}' does not exist. Please create it in Supabase Dashboard → SQL Editor.`);
                    } else if (error.code === 'PGRST204' || error.message.includes('could not find') || error.message.includes('column') || error.message.includes('schema cache')) {
                        // Missing column error
                        const columnMatch = error.message.match(/column ['"]([^'"]+)['"]/i) || error.message.match(/column (\w+)/i);
                        const columnName = columnMatch ? columnMatch[1] : 'unknown';
                        throw new Error(`Column '${columnName}' does not exist in the '${RESERVATIONS_TABLE}' table. Please add it using: ALTER TABLE ${RESERVATIONS_TABLE} ADD COLUMN ${columnName} TEXT; See ADD_MISSING_COLUMNS.sql or FIX_PURPOSE_COLUMN.md for details.`);
                    } else if (error.code === '42501' || error.message.includes('permission denied') || error.message.includes('RLS')) {
                        throw new Error(`Permission denied. Row Level Security (RLS) is blocking the insert. Check RLS policies in Supabase Dashboard.`);
                    } else if (error.code === '23505' || error.message.includes('duplicate key')) {
                        throw new Error(`Reservation with this ID already exists. Try again.`);
                    } else {
                        throw new Error(`Failed to save reservation: ${error.message} (Code: ${error.code || 'unknown'})`);
                    }
                }
                
                if (!insertResult.data) {
                    throw new Error('Insert succeeded but no data returned. This might indicate a RLS policy issue.');
                }
                
                console.log('✅ Supabase saved reservation:', insertResult.data);
                
                // Verify the saved reservation has the name
                if (insertResult.data && insertResult.data.name !== reservation.name) {
                    console.warn('Name mismatch after save! Original:', reservation.name, 'Saved:', insertResult.data.name);
                }
                
                return insertResult.data;
            } catch (error) {
                console.error('❌ ERROR: Failed to save reservation to Supabase:', error);
                console.error('Error details:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    reservation: reservation
                });
                
                // Check if it's a network error
                const isNetworkError = error.message.includes('Failed to fetch') || 
                                      error.message.includes('NetworkError') ||
                                      error.message.includes('Network request failed') ||
                                      error.name === 'TypeError';
                
                // Fallback to localStorage if Supabase fails
                let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                reservation.id = reservation.id || Date.now().toString();
                reservations.push(reservation);
                localStorage.setItem('reservations', JSON.stringify(reservations));
                console.warn('⚠️ Saved to local storage. This booking will NOT be visible on other devices!');
                
                // Provide detailed error message with actual error
                let errorMessage = '⚠️ Warning: Could not save to cloud database.\n\n';
                errorMessage += `Error: ${error.message}\n\n`;
                
                // Add specific guidance based on error type
                if (error.message.includes('does not exist') || error.message.includes('42P01')) {
                    errorMessage += '🔧 Fix: Create the "bookings" table in Supabase Dashboard → SQL Editor\n';
                    errorMessage += '   See FIX_SAVE_ISSUE.md for SQL to create the table.\n\n';
                } else if (error.message.includes('permission denied') || error.message.includes('RLS') || error.message.includes('42501')) {
                    errorMessage += '🔧 Fix: Row Level Security (RLS) is blocking inserts.\n';
                    errorMessage += '   Add a permissive RLS policy in Supabase Dashboard → Authentication → Policies\n';
                    errorMessage += '   See FIX_SAVE_ISSUE.md for the SQL policy.\n\n';
                } else if (isNetworkError) {
                    errorMessage += '🔧 Fix: Network connection issue.\n';
                    errorMessage += '   - Check your internet connection\n';
                    errorMessage += '   - Check if Supabase project is active (not paused)\n';
                    errorMessage += '   - Check browser console (F12) for CORS errors\n\n';
                } else {
                    errorMessage += '🔧 Fix: Check browser console (F12) for detailed error information.\n';
                    errorMessage += '   See FIX_SAVE_ISSUE.md for troubleshooting steps.\n\n';
                }
                
                errorMessage += '⚠️ Reservation saved locally only - it will NOT be visible on other devices!\n\n';
                errorMessage += 'Please check the browser console (F12) for more details.';
                
                alert(errorMessage);
                return reservation;
            }
        } else {
            // Use localStorage
            console.log('⚠️ Supabase not available, using localStorage');
            console.log('Reason:', !supabase ? 'Client not initialized' : 
                               !SUPABASE_URL ? 'URL not set' : 
                               !SUPABASE_ANON_KEY ? 'Key not set' : 
                               'Credentials are placeholders');
            
            let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
            reservation.id = reservation.id || Date.now().toString();
            
            // Validate reservation has required fields
            if (!reservation.name) {
                console.error('Warning: Reservation missing name field!', reservation);
            }
            if (!reservation.instrument) {
                console.error('Warning: Reservation missing instrument field!', reservation);
            }
            
            console.log('Saving to localStorage:', reservation);
            reservations.push(reservation);
            localStorage.setItem('reservations', JSON.stringify(reservations));
            console.log('Saved. Total reservations:', reservations.length);
            return reservation;
        }
    },

    // Delete a reservation
    async deleteReservation(reservationId) {
        if (supabase && SUPABASE_URL && SUPABASE_ANON_KEY && 
            !SUPABASE_URL.includes('your-project-id') && 
            !SUPABASE_ANON_KEY.includes('your-anon-key')) {
            try {
                console.log('Deleting reservation from Supabase:', reservationId);
                const { error } = await supabase
                    .from(RESERVATIONS_TABLE)
                    .delete()
                    .eq('id', reservationId);
                
                if (error) {
                    console.error('Supabase delete error:', error);
                    throw new Error(`Failed to delete reservation: ${error.message}`);
                }
                
                console.log('Reservation deleted successfully');
                return true;
            } catch (error) {
                console.error('Error deleting reservation from Supabase:', error);
                // Fallback to localStorage if Supabase fails
                let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                reservations = reservations.filter(r => r.id !== reservationId);
                localStorage.setItem('reservations', JSON.stringify(reservations));
                return true;
            }
        } else {
            // Use localStorage
            let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
            reservations = reservations.filter(r => r.id !== reservationId);
            localStorage.setItem('reservations', JSON.stringify(reservations));
            return true;
        }
    },

    // Update all reservations (for batch operations)
    async updateReservations(reservations) {
        if (supabase && SUPABASE_URL && SUPABASE_ANON_KEY && 
            !SUPABASE_URL.includes('your-project-id') && 
            !SUPABASE_ANON_KEY.includes('your-anon-key')) {
            try {
                // For batch update, we'll delete all and re-insert
                // This is simpler than trying to update each individually
                console.log('Updating all reservations in Supabase...');
                
                // Delete all existing reservations
                const { error: deleteError } = await supabase
                    .from(RESERVATIONS_TABLE)
                    .delete()
                    .neq('id', '0'); // Delete all (using a condition that's always true)
                
                if (deleteError) {
                    console.error('Error deleting existing reservations:', deleteError);
                    throw deleteError;
                }
                
                // Insert all reservations
                if (reservations.length > 0) {
                    const { error: insertError } = await supabase
                        .from(RESERVATIONS_TABLE)
                        .insert(reservations);
                    
                    if (insertError) {
                        console.error('Error inserting reservations:', insertError);
                        throw insertError;
                    }
                }
                
                console.log('All reservations updated successfully');
                return reservations;
            } catch (error) {
                console.error('Error updating reservations in Supabase:', error);
                // Fallback to localStorage if Supabase fails
                localStorage.setItem('reservations', JSON.stringify(reservations));
                return reservations;
            }
        } else {
            // Use localStorage
            localStorage.setItem('reservations', JSON.stringify(reservations));
            return reservations;
        }
    }
};
