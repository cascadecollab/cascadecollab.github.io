function setTheme(theme) {
    if(theme === 'system') {
        localStorage.removeItem('theme');
    } else {
        localStorage.setItem('theme', theme);
    }
    updateTheme();
    document.getElementById('theme-dropdown').classList.add('hidden');
}

function updateTheme() {
    const body = document.body;
    body.classList.toggle(
        "dark",
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
    if(localStorage.theme) {
        const selectedTheme = document.getElementById(`theme-${localStorage.theme}`);
        document.getElementById('selected-theme-icon').src = `/assets/img/theme-${localStorage.theme}.png`;
        document.getElementById('selected-theme-text').textContent = selectedTheme.textContent;
    } else {
        document.getElementById('selected-theme-icon').src = `/assets/img/theme-system.png`;
        document.getElementById('selected-theme-text').textContent = document.getElementById('selected-theme-text').dataset.defaultLabel;
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
    document.getElementById('language-dropdown').classList.add('hidden');
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
        document.getElementById('selected-language-icon').src = `/assets/img/lang-${lang}.png`;
        document.getElementById('selected-language-text').textContent = document.getElementById(`lang-${lang}`).textContent;
    }
}


function toggleDropdown(id) {
    document.getElementById(id).classList.toggle('hidden');
}

function toggleMenuMobile() {
    document.getElementById("nav-menu").classList.toggle("hidden");
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

const CUSTOM_EVT_PLAY_STATE_CHANGED = "xPlayStateChanged";

function getCurrentLanguage() {
    return document.documentElement.getAttribute('lang');
}

document.addEventListener("DOMContentLoaded", () => {
    updateTheme();
    initLanguage();
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.relative')) {
            document.getElementById('theme-dropdown').classList.add('hidden');
            document.getElementById('language-dropdown').classList.add('hidden');
        }
    });
});