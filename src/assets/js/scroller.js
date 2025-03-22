

document.addEventListener("DOMContentLoaded", () => {
    const scrollButton = document.getElementById("scrollToTop");
    window.addEventListener("scroll", () => {
        const isVisible = !scrollButton.classList.value.includes('hidden');
        const isArtAnimationPlaying = window.playState === PLAY_STATES.PLAYING;
        if (window.scrollY > 200 && !isVisible && !isArtAnimationPlaying) {
            scrollButton.classList.remove("hidden");
            // change the opacity in the next frame in order to trigger the transition properly
            setTimeout(() => scrollButton.classList.remove("opacity-0"), 0);
        } else if((window.scrollY <= 200 && isVisible) || (isVisible && isArtAnimationPlaying)) {
            scrollButton.classList.add("opacity-0");
            // Sync the moment to set display none with the transition
            setTimeout(() => scrollButton.classList.add("hidden"), 300);
        }
    });

    // Custom event fired by the art animation logic
    window.addEventListener(CUSTOM_EVT_PLAY_STATE_CHANGED, () => {
        const isVisible = !scrollButton.classList.value.includes('hidden');
        const isArtAnimationPlaying = window.playState === PLAY_STATES.PLAYING;
        if (window.scrollY > 200 && !isVisible && !isArtAnimationPlaying) {
            scrollButton.classList.remove("hidden");
            // change the opacity in the next frame in order to trigger the transition properly
            setTimeout(() => scrollButton.classList.remove("opacity-0"), 0);
        }
    });
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}