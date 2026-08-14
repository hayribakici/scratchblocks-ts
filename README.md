# scratchblocks-ts

A small TypeScript wrapper around [scratchblocks](https://github.com/scratchblocks/scratchblocks) for rendering Scratch code as SVG or PNG.

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

const targetDocument = window.document;
const renderer = new ScratchblocksRenderer(targetDocument, {
  cacheSize: 20, // default is 100; use 0 to disable cache
});
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

targetDocument.body.append(svg);
```

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

## Development

```sh
npm install
npm test
npm run build
```

## License

[MIT](LICENSE)
