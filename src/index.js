/*
 * Copyright (c) 2017 Karthikeyan Madathil
 * SPDX-License-Identifier: MIT
 * Adapted from sanskrit_parser's LexicalSandhiAnalyzer and SandhiGraph.
 * See LICENSE and NOTICE.md.
 */

export function findSandhiSplits(text, { split, isWord, maxParts = 3, limit = 8 } = {}) {
  if (typeof text !== "string" || typeof split !== "function" || typeof isWord !== "function") {
    throw new TypeError("Expected text and the split and isWord callbacks");
  }
  if (!Number.isSafeInteger(maxParts) || maxParts < 0 || !Number.isSafeInteger(limit) || limit < 0) {
    throw new RangeError("maxParts and limit must be nonnegative safe integers");
  }
  if (maxParts === 0 || limit === 0 || text.trim() === "") return [];

  const wordChecks = new Map();
  const splitCache = new Map();
  const results = [];
  const resultKeys = new Set();

  function isKnown(word) {
    if (!wordChecks.has(word)) wordChecks.set(word, isWord(word) === true);
    return wordChecks.get(word);
  }

  function* proposalsFor(remainder) {
    if (splitCache.has(remainder)) {
      yield* splitCache.get(remainder);
      return;
    }

    const proposals = [];
    const keys = new Set();
    for (const candidate of split(remainder) ?? []) {
      const { first, second, isValid, isRecursive } = candidate ?? {};
      if (isValid === false || isRecursive === true ||
          typeof first !== "string" || first.trim() === "" ||
          typeof second !== "string" || (second !== "" && second.trim() === "")) {
        continue;
      }

      const proposal = [first, second];
      const key = JSON.stringify(proposal);
      if (keys.has(key)) continue;
      keys.add(key);
      proposals.push(proposal);
      yield proposal;
    }
    splitCache.set(remainder, proposals);
  }

  function appendResult(prefix, finalWord) {
    const words = [...prefix, finalWord];
    const key = JSON.stringify(words);
    if (resultKeys.has(key)) return false;
    resultKeys.add(key);
    results.push(words);
    return results.length === limit;
  }

  // Finish paths with the current word count before exploring longer paths.
  let frontier = [{ prefix: [], remainder: text, visited: [text] }];
  for (let parts = 1; parts <= maxParts && frontier.length !== 0; parts++) {
    const next = [];
    for (const { prefix, remainder, visited } of frontier) {
      if (isKnown(remainder) && appendResult(prefix, remainder)) return results;

      for (const [first, second] of proposalsFor(remainder)) {
        if (second === "") {
          if (isKnown(first) && appendResult(prefix, first)) return results;
        } else if (parts < maxParts && !visited.includes(second) && isKnown(first)) {
          next.push({
            prefix: [...prefix, first],
            remainder: second,
            visited: [...visited, second],
          });
        }
      }
    }
    frontier = next;
  }

  return results;
}
