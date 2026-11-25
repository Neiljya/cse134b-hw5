module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({
        "../assets/site.css": "assets/site.css",
        "../assets/theme.js": "assets/theme.js",
        "src/assets/project-placeholder.svg": "assets/project-placeholder.svg"
    });

    return {
        templateFormats: ["njk"],
        dir: {
            input: "src",
            includes: "_includes",
            output: "_site"
        }
    };
};