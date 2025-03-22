
var playState = PLAY_STATES.STOPPED;

var bgMusic = new Audio("/assets/music/background.mp3");

function startArtworkAnimation() {
    const buttonText = document.getElementById("scroll-music-text");
    if(playState === PLAY_STATES.STOPPED ) {
        window.scrollTo(0, 0);
    }
    if(getCurrentLanguage() === 'es') {
        buttonText.textContent = "⏸️ Pausar";
    } else {
        buttonText.textContent = "⏸️ Pause";
    }
    requestWakeLock();
    playState = PLAY_STATES.PLAYING;
    bgMusic.play().catch(err => console.error("Audio playback error:", err));
    startScroll();
}

function startScroll() {
    let scrollSpeed = 20; // Time between ticks in milliseconds
    const thankYouEl = document.getElementById('thank-you');
    let interval = setInterval(() => {
        if (isElementInViewport(thankYouEl)) {
            stopArtworkAnimation();
            clearInterval(interval);
        } else if (playState === PLAY_STATES.PLAYING) {
            window.scrollBy(0, 1);
        } else if(playState === PLAY_STATES.PAUSING) {
            clearInterval(interval);
            playState = PLAY_STATES.PAUSED;
        }
    }, scrollSpeed);
}

function pauseScroll() {
    bgMusic.pause();
    playState = PLAY_STATES.PAUSING;
    window.dispatchEvent(new Event(CUSTOM_EVT_PLAY_STATE_CHANGED));
    window.myWakeLock?.release();
}

function stopArtworkAnimation() {
    const buttonText = document.getElementById("scroll-music-text");
    if(getCurrentLanguage() === 'es') {
        buttonText.textContent = "🔄 Repetir";
    } else {
        buttonText.textContent = "🔄 Replay";
    }
    bgMusic.pause();
    bgMusic.currentTime = 0;
    playState = PLAY_STATES.STOPPED;
    window.dispatchEvent(new Event(CUSTOM_EVT_PLAY_STATE_CHANGED));
    window.myWakeLock?.release();
}

function pauseArtworkAnimation() {
    if(playState !== PLAY_STATES.STOPPED && playState !== PLAY_STATES.PAUSED) {
        const buttonText = document.getElementById("scroll-music-text");
        pauseScroll();
        if(getCurrentLanguage() === 'es') {
            buttonText.textContent = "▶️ Reanudar";
        } else {
            buttonText.textContent = "▶️ Resume";
        }
    }
    return true;
}

function adjustInfoLabels() {
    const labels = document.querySelectorAll('.char-info-label');
    const isSmall = isSmallScreen();
    labels.forEach(label => {
        const position = {
            desktop: {
                top: label.dataset.positionDesktopTop,
                left: label.dataset.positionDesktopLeft
            },
            mobile: {
                top: label.dataset.positionMobileTop,
                left: label.dataset.positionMobileLeft
            }
        }
        const screenType = isSmall ? 'mobile' : 'desktop';
        label.style.top = position[screenType].top;
        label.style.left = position[screenType].left;
    });
}

document.addEventListener("DOMContentLoaded", () => {

    window.addEventListener('resize', () => adjustInfoLabels());

    const images = document.querySelectorAll("#artwork-container img");
    
    let loadedImages = 0;

    images.forEach(img => {
        if(img.complete) {
            // Image already loaded from cache
            loadedImages++;
            if (loadedImages === images.length) {
                adjustInfoLabels();
                document.getElementById("artwork-container").classList.remove("opacity-0");
            }
        } else {
            img.onload = () => {
                loadedImages++;
                if (loadedImages === images.length) {
                    adjustInfoLabels();
                    document.getElementById("artwork-container").classList.remove("opacity-0");
                }
            };
            img.onerror = () => console.error("Failed to load image:", img.src);
        }
    });

    const button = document.getElementById("scroll-music-btn");
    bgMusic.loop = true;
    bgMusic.volume = 0.50;
    
    playState = PLAY_STATES.STOPPED;

    button?.addEventListener("click", function () {
        if (playState === PLAY_STATES.STOPPED || playState === PLAY_STATES.PAUSED) {
            startArtworkAnimation();
        } else {
            pauseArtworkAnimation();
        }
    });

    window.addEventListener('scroll', () => {
        const thankYouEl = document.getElementById('thank-you');
        if((playState === PLAY_STATES.PLAYING || playState === PLAY_STATES.PAUSED) 
                && isElementInViewport(thankYouEl)) {
            stopArtworkAnimation();
        }
    });

});