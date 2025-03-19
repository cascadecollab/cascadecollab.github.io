function setTheme(theme) {
    if(theme === 'system') {
        localStorage.removeItem('theme');
    } else {
        localStorage.setItem('theme', theme);
    }
    updateTheme();
}

function updateTheme() {
    const body = document.body;
    body.classList.toggle(
        "dark",
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
    if(localStorage.theme) {
        document.getElementById('theme-switcher').value = localStorage.theme;
    }
}

function switchLanguage(lang) {
    localStorage.setItem('lang', lang);
    const currentPath = window.location.pathname;
    if (lang === 'es' && !currentPath.startsWith('/es')) {
        window.location.pathname = '/es' + currentPath;
    } else if (lang === 'en' && currentPath.startsWith('/es')) {
        window.location.pathname = currentPath.substring(3) || '/';
    }
}

function initLanguage() {
    const currentPath = window.location.pathname;
    var lang = 'en';
    var currentLang = 'en';
    if(currentPath.startsWith('/es')) {
        lang = 'es';
        currentLang = 'es';
    }
    for(const pref of navigator.languages) {
        if(pref.startsWith('en')) {
            lang = 'en';
            break;
        }
        if(pref.startsWith('es')) {
            lang = 'es';
            break;
        }
    }
    if(localStorage.lang) {
        lang = localStorage.lang;
    }
    if(currentLang !== lang) {
        switchLanguage(lang);
    } else {
        document.getElementById('language-switcher').value = lang;
    }
}

function toggleMenuMobile() {
    document.getElementById("nav-menu").classList.toggle("hidden");
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

function isSmallScreen() {
    return window.matchMedia(`(max-width: 640px)`).matches;
}

function isElementInViewport (el) {

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
}

function requestWakeLock() {
    if(navigator.wakeLock) {
        navigator.wakeLock.request('screen').then(lock => window.myWakeLock = lock);
    }
}

const PLAY_STATES = {
    STOPPED: 0,
    PLAYING: 1,
    PAUSED: 2,
    STOPPING: 3,
    PAUSING: 4
};

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
    audio.play().catch(err => console.error("Audio playback error:", err));
    startScroll();
}

function stopArtworkAnimation() {
    const buttonText = document.getElementById("scroll-music-text");
    if(getCurrentLanguage() === 'es') {
        buttonText.textContent = "▶️ Repetir";
    } else {
        buttonText.textContent = "▶️ Replay";
    }
    audio.pause();
    audio.fastSeek(0);
    playState = PLAY_STATES.STOPPED;
}

function pauseScroll() {
    audio.pause();
    playState = PLAY_STATES.PAUSING;
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

function getCurrentLanguage() {
    return document.documentElement.getAttribute('lang');
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

function initArtworkHooks() {
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
    window.audio = new Audio("/assets/music/background.mp3");
    window.audio.loop = true;
    window.audio.volume = 0.50;
    
    window.playState = PLAY_STATES.STOPPED;

    button.addEventListener("click", function () {
        if (playState === PLAY_STATES.STOPPED || playState === PLAY_STATES.PAUSED) {
            startArtworkAnimation();
        } else {
            pauseArtworkAnimation();
        }
    });

    window.addEventListener('scroll', () => {
        const thankYouEl = document.getElementById('thank-you');
        if((playState === PLAY_STATES.PLAYING || playState === PLAY_STATES.PAUSED) && isElementInViewport(thankYouEl)) {
            stopArtworkAnimation();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateTheme();
    initLanguage();
    if(window.location.pathname.endsWith('/artwork/')) {
        initArtworkHooks();
    }
});