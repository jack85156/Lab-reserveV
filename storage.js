// Storage abstraction layer for Dr. V's Lab Reservation System
// Uses Supabase for cloud database storage

// Supabase configuration
// Replace these with your Supabase project credentials
// These should be set in your HTML files before loading this script:
// <script>
//   window.SUPABASE_URL = 'https://ldfeumcasypgprhtbvpp.supabase.co';
//   window.SUPABASE_ANON_KEY = 'sb_publishable_vXEIEUWtBo9osE15js3mBA_s_Dm0Uwl';
// </script>
const DEFAULT_SUPABASE_URL = 'https://ermkgvzfehlaaoktxndv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVybWtndnpmZWhsYWFva3R4bmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMjk2MzYsImV4cCI6MjA3OTYwNTYzNn0.4WBtLgvjVeOgrznXkQa7W6aa4vFWgBvd3gIPXoIrVRI';

const SUPABASE_URL = (typeof window !== 'undefined' && window.SUPABASE_URL) || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_ANON_KEY;

// Table name in Supabase
const RESERVATIONS_TABLE = 'bookings';

// Helper: determine if a reservation's end time has already passed (Central Time)
function isReservationExpired(reservation) {
    try {
        if (!reservation || !reservation.date || !reservation.endTime) {
            return false;
        }

        const [year, month, day] = reservation.date.split('-').map(Number);
        const [endHour, endMinute] = (reservation.endTime || '00:00').split(':').map(Number);

        const now = new Date();
        const nowCentralStr = now.toLocaleString('en-US', {
            timeZone: 'America/Chicago',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const [nowDatePart, nowTimePart] = nowCentralStr.split(', ');
        const [nowMonth, nowDay, nowYear] = nowDatePart.split('/').map(Number);
        const [nowHour, nowMinute] = nowTimePart.split(':').map(Number);

        const reservationTime = parseInt(
            `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}${String(endHour).padStart(2, '0')}${String(endMinute).padStart(2, '0')}`
        );
        const currentTime = parseInt(
            `${nowYear}${String(nowMonth).padStart(2, '0')}${String(nowDay).padStart(2, '0')}${String(nowHour).padStart(2, '0')}${String(nowMinute).padStart(2, '0')}`
        );

        return reservationTime < currentTime;
    } catch (error) {
        console.error('Failed to determine if reservation expired:', error, reservation);
        return false;
    }
}

function splitExpiredReservations(reservations = []) {
    const expiredReservations = [];
    const activeReservations = [];
    reservations.forEach(reservation => {
        if (isReservationExpired(reservation)) {
            expiredReservations.push(reservation);
        } else {
            activeReservations.push(reservation);
        }
    });
    return { expiredReservations, activeReservations };
}

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
    
    // Method 1: Check for Supabase UMD build (v2) - most common
    // The UMD build from jsdelivr exposes it as window.supabase.createClient
    if (typeof window.supabase !== 'undefined') {
        if (typeof window.supabase.createClient === 'function') {
            createClient = window.supabase.createClient;
        } else if (window.supabase.default && typeof window.supabase.default.createClient === 'function') {
            createClient = window.supabase.default.createClient;
        }
    }
    // Method 2: Check for global supabase (without window)
    else if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
        createClient = supabase.createClient;
    }
    // Method 3: Check for @supabase/supabase-js (ES module style)
    else if (typeof window['@supabase/supabase-js'] !== 'undefined') {
        const supabaseModule = window['@supabase/supabase-js'];
        if (supabaseModule.createClient) {
            createClient = supabaseModule.createClient;
        } else if (supabaseModule.default && supabaseModule.default.createClient) {
            createClient = supabaseModule.default.createClient;
        }
    }
    // Method 4: Check if Supabase is available as a global function (some builds)
    else if (typeof window.supabase !== 'undefined' && typeof window.supabase === 'function') {
        createClient = window.supabase;
    }
    
    // If we found createClient, initialize
    if (createClient) {
        try {
            supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase client initialized successfully');
            console.log('   URL:', SUPABASE_URL);
            return;
        } catch (error) {
            console.error('❌ Failed to initialize Supabase client:', error);
            console.error('   URL:', SUPABASE_URL);
            console.error('   Error details:', error.message);
            return;
        }
    }
    
    // If we didn't find it, try again after a delay (script might still be loading)
    setTimeout(() => {
        if (supabase) return; // Already initialized
        
        // Try all methods again with more detailed logging
        console.log('🔍 Retrying Supabase initialization...');
        console.log('   window.supabase type:', typeof window.supabase);
        console.log('   window.supabase:', window.supabase);
        
        // Method 1: window.supabase.createClient
        if (typeof window.supabase !== 'undefined') {
            if (typeof window.supabase.createClient === 'function') {
                try {
                    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    console.log('✅ Supabase client initialized (delayed - method 1)');
                    return;
                } catch (error) {
                    console.error('❌ Failed to initialize Supabase client (delayed - method 1):', error);
                }
            } else if (window.supabase.default && typeof window.supabase.default.createClient === 'function') {
                try {
                    supabase = window.supabase.default.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    console.log('✅ Supabase client initialized (delayed - method 1b)');
                    return;
                } catch (error) {
                    console.error('❌ Failed to initialize Supabase client (delayed - method 1b):', error);
                }
            }
        }
        
        // Method 2: global supabase
        if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
            try {
                supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('✅ Supabase client initialized (delayed - method 2)');
                return;
            } catch (error) {
                console.error('❌ Failed to initialize Supabase client (delayed - method 2):', error);
            }
        }
        
        // If still not initialized, show helpful error
        if (!supabase) {
            console.error('❌ Supabase library not found after retry!');
            console.error('   Make sure you have included this BEFORE storage.js:');
            console.error('   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>');
            console.error('   Current SUPABASE_URL:', SUPABASE_URL);
            console.error('   Check browser Network tab to see if Supabase script loaded successfully.');
            console.error('   Check browser Console for any script loading errors.');
        }
    }, 1000); // Increased delay to 1 second
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

                // Remove expired reservations automatically
                const { expiredReservations, activeReservations } = splitExpiredReservations(reservations);
                if (expiredReservations.length > 0) {
                    const idsToDelete = expiredReservations.map(r => r.id).filter(Boolean);
                    if (idsToDelete.length) {
                        try {
                            await supabase.from(RESERVATIONS_TABLE).delete().in('id', idsToDelete);
                            console.log('Removed expired reservations from Supabase:', idsToDelete);
                        } catch (cleanupError) {
                            console.error('Failed to remove expired reservations from Supabase:', cleanupError);
                        }
                    }
                }
                
                return activeReservations;
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
                const { expiredReservations, activeReservations } = splitExpiredReservations(localData);
                if (expiredReservations.length > 0) {
                    localStorage.setItem('reservations', JSON.stringify(activeReservations));
                    console.warn('Removed expired reservations from local fallback:', expiredReservations.length);
                }
                return activeReservations;
            }
        } else {
            // Use localStorage
            let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
            console.log('Retrieved reservations from localStorage:', reservations.length);
            // Check for reservations with missing names
            const missingNames = reservations.filter(r => !r.name || !r.name.trim());
            if (missingNames.length > 0) {
                console.warn('Found reservations with missing names:', missingNames);
            }
            // Log all names for debugging
            const allNames = reservations.map(r => r.name).filter(n => n);
            console.log('All reservation names from localStorage:', allNames);

            const { expiredReservations, activeReservations } = splitExpiredReservations(reservations);
            if (expiredReservations.length > 0) {
                console.warn('Removing expired reservations from localStorage:', expiredReservations.length);
                localStorage.setItem('reservations', JSON.stringify(activeReservations));
            }
            return activeReservations;
        }
    },

    // Save a reservation
    async saveReservation(reservation) {
        // Check if Supabase is properly initialized
        if (supabase && SUPABASE_URL && SUPABASE_ANON_KEY && 
            !SUPABASE_URL.includes('your-project-id') && 
            !SUPABASE_ANON_KEY.includes('your-anon-key')) {
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
                
                const { data, error } = await supabase
                    .from(RESERVATIONS_TABLE)
                    .insert([reservation])
                    .select()
                    .single();
                
                if (error) {
                    console.error('Supabase save error:', error);
                    throw new Error(`Failed to save reservation: ${error.message}`);
                }
                
                console.log('Supabase saved reservation:', data);
                
                // Verify the saved reservation has the name
                if (data && data.name !== reservation.name) {
                    console.warn('Name mismatch after save! Original:', reservation.name, 'Saved:', data.name);
                }
                
                return data;
            } catch (error) {
                console.error('❌ ERROR: Failed to save reservation to Supabase:', error);
                console.error('Error details:', {
                    message: error.message,
                    reservation: reservation
                });
                
                // Show user-friendly error
                const errorMsg = `⚠️ Cloud database connection failed. Could not save reservation.\n\n` +
                               `Error: ${error.message}\n\n` +
                               `Saving to local storage instead, but this won't be visible on other devices!`;
                console.warn(errorMsg);
                
                // Fallback to localStorage if Supabase fails
                let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                reservation.id = reservation.id || Date.now().toString();
                reservations.push(reservation);
                localStorage.setItem('reservations', JSON.stringify(reservations));
                console.warn('⚠️ Saved to local storage. This booking will NOT be visible on other devices!');
                
                // Provide helpful error message
                let errorMessage = '⚠️ Warning: Could not connect to cloud database.\n\n';
                errorMessage += 'Reservation saved locally only - it will NOT be visible on other devices.\n\n';
                
                // Check what the issue might be
                if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
                    errorMessage += 'Issue: Supabase credentials not configured.\n';
                    errorMessage += 'Fix: Update supabase-config.js with your Supabase credentials.\n';
                } else if (SUPABASE_URL.includes('your-project-id') || SUPABASE_ANON_KEY.includes('your-anon-key')) {
                    errorMessage += 'Issue: Supabase credentials are still placeholders.\n';
                    errorMessage += 'Fix: Replace placeholder values in supabase-config.js with your actual credentials.\n';
                } else if (!supabase) {
                    errorMessage += 'Issue: Supabase library not loaded or initialized.\n';
                    errorMessage += 'Fix: Check browser console for details. Make sure Supabase CDN script is loaded.\n';
                } else {
                    errorMessage += 'Issue: Connection to Supabase failed.\n';
                    errorMessage += 'Fix: Check your Supabase project is active and credentials are correct.\n';
                }
                
                errorMessage += '\nSee QUICK_START.md or SUPABASE_SETUP.md for setup instructions.';
                alert(errorMessage);
                return reservation;
            }
        } else {
            // Use localStorage
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
    },

    isReservationExpired(reservation) {
        return isReservationExpired(reservation);
    }
};
