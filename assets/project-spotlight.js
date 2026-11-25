"use strict";

const sampleProjects = [
    {
        name: "RateMyDiningHall",
        description: "A platform for UCSD students to review dining halls and discover better meals.",
        url: "ratemydininghall.html"
    },
    {
        name: "VisualLink",
        description: "A project for controlling your computer hands-free.",
        url: "visuallink.html"
    },
    {
        name: "MiniAWS",
        description: "An S3-inspired project for practicing distributed systems and concurrency.",
        url: "miniaws.html"
    }
];

const FACT_API = "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en";
const MODE_STORAGE_KEY = "hw5-project-spotlight-mode";

class ProjectSpotlight extends HTMLElement {
    static get observedAttributes() {
        return ["compact"];
    }

    constructor() {
        super();
        this.currentIndex = 0;
    }

    connectedCallback() {
        if (this.projectTitle) {
            return;
        }

        this.appendChild(this.createProjectSection());
        this.appendChild(this.createLiveFactSection());

        this.renderProject();
        this.updateCompactView();
    }

    createProjectSection() {
        const section = document.createElement("section");
        section.className = "spotlight-panel";

        const heading = document.createElement("h2");
        heading.textContent = "Project Spotlight";

        this.projectTitle = document.createElement("h3");
        this.projectDescription = document.createElement("p");

        const linkParagraph = document.createElement("p");
        this.projectLink = document.createElement("a");
        linkParagraph.appendChild(this.projectLink);

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.textContent = "Next project";
        nextButton.addEventListener("click", () => {
            this.currentIndex = (this.currentIndex + 1) % sampleProjects.length;
            this.renderProject();
        });

        this.projectStatus = document.createElement("p");
        this.projectStatus.setAttribute("role", "status");

        section.appendChild(heading);
        section.appendChild(this.projectTitle);
        section.appendChild(this.projectDescription);
        section.appendChild(linkParagraph);
        section.appendChild(nextButton);
        section.appendChild(this.projectStatus);

        return section;
    }

    createLiveFactSection() {
        const section = document.createElement("section");
        section.className = "spotlight-panel";

        const heading = document.createElement("h2");
        heading.textContent = "Live Fact";

        this.factText = document.createElement("p");
        this.factText.textContent = "Select Get a fact to load a random fact.";

        this.factSource = document.createElement("p");
        this.factSource.textContent = "Powered by the Useless Facts API.";

        this.factButton = document.createElement("button");
        this.factButton.type = "button";
        this.factButton.textContent = "Get a fact";
        this.factButton.addEventListener("click", () => this.loadFact());

        this.factStatus = document.createElement("p");
        this.factStatus.setAttribute("role", "status");

        section.appendChild(heading);
        section.appendChild(this.factText);
        section.appendChild(this.factSource);
        section.appendChild(this.factButton);
        section.appendChild(this.factStatus);

        return section;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "compact" && oldValue !== newValue) {
            this.updateCompactView();
        }
    }

    renderProject() {
        const project = sampleProjects[this.currentIndex];

        this.projectTitle.textContent = project.name;
        this.projectDescription.textContent = project.description;
        this.projectLink.textContent = `View ${project.name}`;
        this.projectLink.href = project.url;
        this.projectStatus.textContent =
            `Project ${this.currentIndex + 1} of ${sampleProjects.length}`;
    }

    updateCompactView() {
        const isCompact = this.hasAttribute("compact");

        if (this.projectDescription) {
            this.projectDescription.hidden = isCompact;
        }

        if (this.factSource) {
            this.factSource.hidden = isCompact;
        }
    }

    async loadFact() {
        if (this.factButton.disabled) {
            return;
        }

        this.factButton.disabled = true;
        this.factStatus.textContent = "Loading a fact…";

        try {
            const response = await fetch(FACT_API, {
                cache: "no-store",
                headers: { Accept: "application/json" }
            });

            if (!response.ok) {
                throw new Error(`HTTP status ${response.status}`);
            }

            const data = await response.json();

            if (typeof data?.text !== "string" || !data.text.trim()) {
                throw new Error("Expected a non-empty fact in the response.");
            }

            const source = typeof data.source === "string" ? data.source.trim() : "";

            this.factText.textContent = data.text.trim();
            this.factSource.textContent = source
                ? `Source: ${source} (via the Useless Facts API)`
                : "Powered by the Useless Facts API.";

            this.factStatus.textContent = "Fact loaded.";
        } catch (error) {
            console.error("Could not load a fact.", error);
            this.factStatus.textContent =
                "Could not load a fact. Select Get a fact to try again.";
        } finally {
            this.factButton.disabled = false;
        }
    }
}

customElements.define("project-spotlight", ProjectSpotlight);

const spotlight = document.querySelector("#project-spotlight");
const compactButton = document.querySelector("#compact-toggle");

function readSpotlightMode() {
    try {
        const savedMode = window.localStorage.getItem(MODE_STORAGE_KEY);

        if (savedMode === "compact" || savedMode === "expanded") {
            return savedMode;
        }
    } catch (_error) {
        // Storage may be unavailable. Use the default below.
    }

    return "expanded";
}

function saveSpotlightMode(mode) {
    try {
        window.localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch (_error) {
        // The mode has already changed for the current page.
    }
}

function applySpotlightMode(mode) {
    const isCompact = mode === "compact";
    spotlight.toggleAttribute("compact", isCompact);
    compactButton.setAttribute("aria-pressed", String(isCompact));
}

if (spotlight && compactButton) {
    applySpotlightMode(readSpotlightMode());

    compactButton.addEventListener("click", () => {
        const nextMode = spotlight.hasAttribute("compact") ? "expanded" : "compact";
        applySpotlightMode(nextMode);
        saveSpotlightMode(nextMode);
    });

    compactButton.hidden = false;
}