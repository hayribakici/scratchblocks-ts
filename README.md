# Scratchblocks typescript

TypeScript library that wraps the [scratchblocks](https://github.com/scratchblocks/scratchblocks) library.

It provides (also inline) SVG, PNG creation and caching for fast rendering.

## Usage

```json
{
  "dependencies": {
    "scratchblocks-ts": "latest"
  }
}
```

or

```shell
npm install scratchblocks-ts
```

```ts
import { ScratchblocksRenderer } from "scratchblocks-ts/renderer";

const renderer = ScratchblocksRenderer.create();

// Create an SVG with English language and Scratch 3 style
const svg = renderer.toSVG("when green flag clicked", {
  languages: ["en"],
  style: "scratch3",
  scale: 1.4, // optional, defaults to 1
});

document.body.append(svg);
```

For inline blocks, use `toInlineSVG()`:

```ts
// Create an inline SVG with English language and Scratch 3 style
const inlineSvg = renderer.toInlineSVG("move (10) steps", {
  languages: ["en"],
  style: "scratch3",
});
```

`ScratchblocksRenderer` needs a browser DOM. The Markdown helpers do not and
can be used in any JavaScript environment.

Supported fenced languages are `scratchblock`, `scratchblocks`, and `sb`.
Inline source uses the form `sb when green flag clicked`.

Run `npm run build` in this folder to create the publishable `dist` directory.
