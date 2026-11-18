# sanskrit-parser-js

JavaScript port of the lexical sandhi path search from
[`sanskrit_parser`](https://github.com/kmadathil/sanskrit_parser). It runs in
browsers and Node.js as an ES module with zero runtime dependencies.

## Build and test

```sh
npm test
npm run build
```

The build produces `dist/index.js`, `dist/LICENSE`, and `dist/NOTICE.md`.
Copy the three files together when distributing the module.

## Use

```js
import { findSandhiSplits } from "./dist/index.js";

const lexicon = new Set(["देवः", "अस्ति", "च"]);
const proposals = new Map([
  ["देवोऽस्तिच", [{ first: "देवः", second: "अस्तिच" }]],
  ["अस्तिच", [{ first: "अस्ति", second: "च" }]],
]);

findSandhiSplits("देवोऽस्तिच", {
  split: (remainder) => proposals.get(remainder) ?? [],
  isWord: (word) => lexicon.has(word),
});
// [["देवः", "अस्ति", "च"]]
```

`findSandhiSplits` accepts a string, two synchronous callbacks, and optional
`maxParts` and `limit` values. Supply a reverse sandhi splitter and a lexicon
that use the same encoding, such as Devanagari or SLP1.

- `split(remainder)` returns a finite iterable of
  `{ first, second, isValid?, isRecursive? }` proposals. `first` is the next
  word and `second` is the remaining input. An empty `second` proposes
  `first` as the final form, including a restored word-final consonant.
  The search skips proposals marked invalid or recursive.
- `isWord(word)` returns `true` for each accepted form. A known remainder
  may finish a path directly. When the whole input is known, its one-word
  path comes first.
- `maxParts` limits the word count and defaults to 3. `limit` caps the
  number of returned paths and defaults to 8. Both accept nonnegative safe
  integers. A zero budget yields an empty result.

The result contains unique, complete word arrays ordered by increasing word
count. Equal-length paths follow the splitter's iteration order. At each
remainder, the direct lexical match precedes any proposed final forms.

## License

The upstream MIT license and revision information are included in
[LICENSE](LICENSE) and [NOTICE.md](NOTICE.md).
