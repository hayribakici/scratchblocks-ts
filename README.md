# scratchblocks-ts

A small TypeScript toolkit rendering [scratchblocks](https://github.com/scratchblocks/scratchblocks) as SVG or PNG and retrieving Scratch code from different sources, such as Markdown or Scratch projects.

## Installation

```sh
npm install scratchblocks-ts
```

[scratchblocks-ts on npm](https://www.npmjs.com/package/scratchblocks-ts)

## Rendering

```ts
import {
  ScratchblocksRenderer,
  type RenderOptions,
} from "scratchblocks-ts";

const renderer = ScratchblocksRenderer.getInstance();
const options: RenderOptions = {
  languages: ["en"],
  style: "scratch3", // additional options: scratch2, scratch3-high-contrast
  scale: 1.4, // optional, default is 1.0
};

const svg = renderer.toSVG(
  `when green flag clicked
move (10) steps`,
  options
);

document.body.append(svg);
```

The renderer needs a browser DOM. It keeps rendered SVGs in a cache, so the
same instance is used throughout the page.

### Inline rendering

Use

```ts
const svg = renderer.toInlineSVG("move (10) steps", options);
```

for a block inside a line of text.

### SVG source, raw PNG and `<img>` output

The other output formats work in the same way:

```ts
// returns svg-markup as a string
const svgSource = renderer.toSVGString("move (10) steps", options);

// returns png as a blob
const pngBlob = await renderer.toPNGBlob("move (10) steps", options);

// returns a loaded `<img>` Element with the scratchblock image
const image = await renderer.toPNGImage("move (10) steps", options);
```

The available styles are `scratch2`, `scratch3`, and
`scratch3-high-contrast`.

## Markdown

The Markdown helpers do not need a DOM. Fenced blocks can use `scratchblock`,
`scratchblocks`, or `sb`:

````md
```scratchblocks
when green flag clicked
move (10) steps
```
````

```ts
import {
  getAllScratchblocksSourcesFromText,
  getInlineScratchblocksSource,
  getScratchblocksSourceAtLine,
} from "scratchblocks-ts/markdown";

const sources = getAllScratchblocksSourcesFromText(markdown);
const sourceAtLine = getScratchblocksSourceAtLine(markdown, 4);
const inlineSource = getInlineScratchblocksSource("sb move (10) steps");
```

Line numbers are zero-based. The single-source helpers return `null` if there
is no source.

## Scratch projects

Retrieve scratchblocks from Scratch projects:

```ts
import { Opcode, readSB3 } from "scratchblocks-ts";

// retrieve File object
const project = await readSB3(file);
// Sprite named `Crab`
const target = project.getTarget("Crab");
const scripts = target?.getScripts();

// returns the script that starts with the `when green flag clicked`
const greenFlagScript = scripts?.find(script =>
  script.contains(Opcode.GreenFlag)
);
// convert script to scratchblocks syntax
const source = greenFlagScript?.toScratchblocks();
```

## Development

```sh
npm install
npm test
npm run build
```

## License

[MIT](LICENSE)
