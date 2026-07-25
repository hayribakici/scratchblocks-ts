# scratchblocks-ts

[![npm version](https://img.shields.io/npm/v/scratchblocks-ts.svg)](https://www.npmjs.com/package/scratchblocks-ts)
[![license](https://img.shields.io/npm/l/scratchblocks-ts.svg)](LICENSE)

This is a small TypeScript wrapper around
[scratchblocks](https://github.com/scratchblocks/scratchblocks).

I made it to render scratchblocks as SVG or PNG without depending on a
framework. It also includes a few helpers for finding scratchblocks in
Markdown. SVGs are cached, which helps if the same blocks are rendered more
than once.

## Installation

```sh
npm install scratchblocks-ts
```

## Rendering blocks

Get the renderer instance:

```ts
import { ScratchblocksRenderer } from "scratchblocks-ts";

const renderer = ScratchblocksRenderer.getInstance();

const svg = renderer.toSVG(
  `when green flag clicked
move (10) steps`,
  {
    languages: ["en"],
    style: "scratch3",
    scale: 1.4,
  }
);

document.body.append(svg);
```

The renderer needs a browser DOM. `getInstance()` returns the same renderer
within the current page, so repeated renders can use the same cache.

### Inline rendering

For a block inside a line of text, use `toInlineSVG()`:

```ts
const inlineSvg = renderer.toInlineSVG("move (10) steps", {
  languages: ["en"],
  style: "scratch3",
});

document.querySelector("p")?.append(inlineSvg);
```

### Image display

There are two ways to create a PNG. If you want to show it on the page,
use `toPNGImage()`. It returns a loaded `HTMLImageElement`:

```ts
const image = await renderer.toPNGImage("turn cw (15) degrees", {
  languages: ["en"],
  style: "scratch3",
});

document.getElementById("output")?.append(image);
```

### Downloading images

For downloads, uploads, or further processing, use `toPNGBlob()` instead:

```ts
const png = await renderer.toPNGBlob("turn cw (15) degrees", {
  languages: ["en"],
  style: "scratch3",
});
```

### SVG markup

If you need the SVG markup rather than an element, use `toSVGString()`:

```ts
const source = renderer.toSVGString("turn cw (15) degrees", {
  languages: ["en"],
  style: "scratch3",
});
```

### Options

Every render method takes the same options. `languages` contains the languages
used for parsing, for example `["en"]`. `style` can be `scratch2`, `scratch3`,
or `scratch3-high-contrast`. `scale` is optional and defaults to `1`.

### Languages

The renderer also provides a few helpers for working with the included
languages:

```ts
renderer.getLanguageCodes();
renderer.hasLanguage("de");
renderer.getLanguageName("de");
renderer.getGreenFlagCommand("de");
```

## Reading Markdown

The Markdown helpers do not use the DOM, so they also work outside the browser.

Fenced blocks can use `scratchblock`, `scratchblocks`, or `sb`:

````md
```scratchblocks
when green flag clicked
move (10) steps
```
````

To get all scratchblocks fences from a document:

```ts
import { getAllScratchblocksSourcesFromText } from "scratchblocks-ts/markdown";

const sources = getAllScratchblocksSourcesFromText(markdown);
```

There is also a helper for getting the fence at a specific line. The line
number is zero-based:

```ts
import { getScratchblocksSourceAtLine } from "scratchblocks-ts/markdown";

const source = getScratchblocksSourceAtLine(markdown, 4);
```

Inline blocks use an `sb ` prefix:

```ts
import { getInlineScratchblocksSource } from "scratchblocks-ts/markdown";

getInlineScratchblocksSource("sb move (10) steps");
// "move (10) steps"
```

All three helpers ignore empty source. The single-source helpers return `null`
when there is nothing to return.

## Development

```sh
npm install
npm test
npm run build
```

The build creates the publishable `dist` directory.

## License

[MIT](LICENSE)
