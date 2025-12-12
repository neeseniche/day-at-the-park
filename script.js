// ===================================
// CONFIGURATION - Customize your timestamps and links here
// ===================================

const timestamps = [
    {
        time: 25, // Pause at 25 seconds
        links: [
            { label: "GO THROUGH", target: 35 },
            { label: "GO AROUND", target: 66 }
        ]
    },
     {
        time: 65, // Pause at 65 seconds
        links: [
            { label: "CONTINUE", target: 77 }
        ]
    },
    {
        time: 90, // Pause at 90 seconds
        links: [
            { label: "INSPECT", target: 105 },
            { label: "MOVE ON", target: 99 },
        ]
    },
    {
        time: 104, // Pause at 104 seconds
        links: [
            { label: "CONTINUE", target: 133 }
        ]
    },
   
     {
        time: 145, // Pause at 145 seconds
        links: [
            { label: "GRAB THE NOTE", target: 156 },
            { label: "MOVE ON", target: 188 },
        ]
    },
    {
        time: 187, // Pause at 187 seconds
        links: [
            { label: "CONTINUE", target: 197 }
        ]
    },
     {
        time: 204, // Pause at 204 seconds
        links: [
            { label: "DIG", target: 214 },
            { label: "MOVE ON", target: 225 },
        ]
    },
     {
        time: 250, // Pause at 250 seconds
        links: [
            { label: "FORCE HER", target: 255 },
            { label: "MOVE ON", target: 337 },
        ]
    },
    {
        time: 224, // Pause at 224 seconds
        links: [
            { label: "CONTINUE", target: 228 }
        ]
    },
     {
        time: 352, // Pause at 352 seconds
        links: [
            { label: "CONTINUE", target: 378 },
            { label: "CONTINUE", target: 363 },
        ]
    },
    {
        time: 327, // Pause at 327 seconds
        links: [
            { label: "CONTINUE", target: 378 },
            { label: "CONTINUE", target: 363 },
        ]
    },
];

// Tolerance for timestamp detection (in seconds)
// This prevents the same timestamp from triggering multiple times
const TIMESTAMP_TOLERANCE = 0.5;

// ===================================
// MAIN APPLICATION CODE
// ===================================

// Initialize variables
let player;
let lastTriggeredTimestamp = -1;
let isPaused = false;
let playButton;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    initializePlayer();
});

/**
 * Initialize the Vimeo player and set up event listeners
 */
function initializePlayer() {
    const iframe = document.getElementById('vimeo-player');
    const overlay = document.getElementById('links-overlay');
    const closeButton = document.getElementById('close-overlay');
    playButton = document.getElementById('play-button');
    
    // Create Vimeo Player instance
    player = new Vimeo.Player(iframe);
    
    // Listen to time updates
    player.on('timeupdate', function(data) {
        checkTimestamps(data.seconds);
    });
    
    // When video plays, hide play button and overlay
    player.on('play', function() {
        hidePlayButton();
        if (!isPaused) {
            hideOverlay();
        }
    });
    
    // When video is paused, show play button
    player.on('pause', function() {
        if (!isPaused) {
            showPlayButton();
        }
    });
    
    // Play button handler - toggle play/pause
    playButton.addEventListener('click', function() {
        player.getPaused().then(function(paused) {
            if (paused) {
                player.play();
            } else {
                player.pause();
            }
        });
    });
    
    // Close button handler
    closeButton.addEventListener('click', function() {
        hideOverlay();
        player.play();
    });
    
    // Show play button initially (video starts paused)
    showPlayButton();
    
    console.log('Interactive Vimeo player initialized successfully!');
    console.log('Configured timestamps:', timestamps);
}

/**
 * Check if current time matches any configured timestamp
 * @param {number} currentTime - Current playback time in seconds
 */
function checkTimestamps(currentTime) {
    for (let i = 0; i < timestamps.length; i++) {
        const timestamp = timestamps[i];
        
        // Check if we're at this timestamp (within tolerance)
        const isAtTimestamp = Math.abs(currentTime - timestamp.time) < TIMESTAMP_TOLERANCE;
        
        // Check if we haven't already triggered this timestamp
        const isNewTimestamp = lastTriggeredTimestamp !== timestamp.time;
        
        if (isAtTimestamp && isNewTimestamp) {
            console.log(`Reached timestamp: ${timestamp.time} seconds`);
            pauseAndShowLinks(timestamp);
            lastTriggeredTimestamp = timestamp.time;
            break;
        }
    }
    
    // Reset lastTriggeredTimestamp if we've moved away from all timestamps
    let isNearAnyTimestamp = false;
    for (let timestamp of timestamps) {
        if (Math.abs(currentTime - timestamp.time) < TIMESTAMP_TOLERANCE * 2) {
            isNearAnyTimestamp = true;
            break;
        }
    }
    
    if (!isNearAnyTimestamp) {
        lastTriggeredTimestamp = -1;
    }
}

/**
 * Pause the video and display navigation links
 * @param {Object} timestamp - Timestamp object containing time and links
 */
function pauseAndShowLinks(timestamp) {
    // Pause the video
    player.pause().then(function() {
        isPaused = true;
        console.log('Video paused at:', timestamp.time);
    }).catch(function(error) {
        console.error('Error pausing video:', error);
    });
    
    // Generate and display links
    displayLinks(timestamp.links);
    
    // Hide play button and show overlay
    hidePlayButton();
    showOverlay();
}

/**
 * Display navigation links in the overlay
 * @param {Array} links - Array of link objects with label and target properties
 */
function displayLinks(links) {
    const linksContainer = document.getElementById('links-container');
    
    // Clear existing links
    linksContainer.innerHTML = '';
    
    // Create button for each link
    links.forEach(function(link) {
        const button = document.createElement('button');
        button.className = 'nav-link';
        button.textContent = link.label;
        
        // Add click handler to navigate to target timestamp
        button.addEventListener('click', function() {
            navigateToTimestamp(link.target);
        });
        
        linksContainer.appendChild(button);
    });
}

/**
 * Navigate to a specific timestamp in the video
 * @param {number} targetTime - Target time in seconds
 */
function navigateToTimestamp(targetTime) {
    console.log('Navigating to timestamp:', targetTime);
    
    // Set the video to the target time
    player.setCurrentTime(targetTime).then(function() {
        console.log('Successfully navigated to:', targetTime);
        
        // Update lastTriggeredTimestamp to prevent immediate re-trigger
        lastTriggeredTimestamp = targetTime;
        
        // Hide overlay
        hideOverlay();
        
        // Play the video
        player.play().then(function() {
            isPaused = false;
        });
    }).catch(function(error) {
        console.error('Error navigating to timestamp:', error);
    });
}

/**
 * Show the links overlay
 */
function showOverlay() {
    const overlay = document.getElementById('links-overlay');
    overlay.classList.remove('hidden');
}

/**
 * Hide the links overlay
 */
function hideOverlay() {
    const overlay = document.getElementById('links-overlay');
    overlay.classList.add('hidden');
    isPaused = false;
}

/**
 * Show the play button
 */
function showPlayButton() {
    if (playButton) {
        playButton.classList.remove('hidden');
    }
}

/**
 * Hide the play button
 */
function hidePlayButton() {
    if (playButton) {
        playButton.classList.add('hidden');
    }
}

/**
 * Helper function to format seconds to MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Export functions for debugging (optional)
window.debugPlayer = {
    getCurrentTime: function() {
        player.getCurrentTime().then(function(seconds) {
            console.log('Current time:', formatTime(seconds), `(${seconds}s)`);
        });
    },
    getTimestamps: function() {
        console.log('Configured timestamps:', timestamps);
    },
    jumpTo: function(time) {
        navigateToTimestamp(time);
    }
};

console.log('Debug functions available: window.debugPlayer.getCurrentTime(), window.debugPlayer.getTimestamps(), window.debugPlayer.jumpTo(seconds)');

