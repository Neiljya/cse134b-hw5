"use strict";

(() => {
    const themeButton = document.querySelector("#theme-toggle");
    const storageKey = "neil-portfolio-theme";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function readTheme() {
        try {
            const savedTheme = window.localStorage.getItem(storageKey);
            return savedTheme === "dark" || savedTheme === "light"
                ? savedTheme
                : "light";
        } catch (_error) {
            return "light";
        }
    }

    function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        themeButton.textContent = theme === "dark"
            ? "Switch to light theme"
            : "Switch to dark theme";
    }

    function updateTheme(theme) {
        const update = () => applyTheme(theme);

        if (
            typeof document.startViewTransition === "function" &&
            !reduceMotion.matches
        ) {
            try {
                document.startViewTransition(update);
                return;
            } catch (_error) {
            }
        }

        update();
    }

    applyTheme(readTheme());

    themeButton.addEventListener("click", () => {
        const nextTheme = document.documentElement.dataset.theme === "dark"
            ? "light"
            : "dark";

        updateTheme(nextTheme);

        try {
            window.localStorage.setItem(storageKey, nextTheme);
        } catch (_error) {
        }
    });

    themeButton.hidden = false;
})();