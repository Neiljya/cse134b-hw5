## Install and build

From the `cse134b-hw5` repository root, run:

```powershell
cd ssg-exercises
npm install
npx @11ty/eleventy --config=eleventy.config.cjs
```

This should generate `index.html` and `ratemydininghall.html` inside `_site/`.

## Preview both pages

To preview, inside `ssg-exercises/`, run the local server:

```powershell
npx @11ty/eleventy --config=eleventy.config.cjs --serve
```

The directories to the following pages should be these:

- [MiniAWS](http://localhost:8080/)
- [RateMyDiningHall](http://localhost:8080/ratemydininghall.html)
