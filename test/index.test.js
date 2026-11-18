import assert from "node:assert/strict";
import test from "node:test";
import { findSandhiSplits } from "../src/index.js";

function splitFixture(entries, words) {
  const proposals = new Map(entries);
  const lexicon = new Set(words);
  return {
    split: (text) => proposals.get(text) ?? [],
    isWord: (word) => lexicon.has(word),
  };
}

test("finds two- and three-word paths within the word limit", () => {
  const options = splitFixture([
    ["देवोऽस्ति", [{ first: "देवः", second: "अस्ति" }]],
    ["देवोऽस्तिच", [{ first: "देवः", second: "अस्तिच" }]],
    ["अस्तिच", [{ first: "अस्ति", second: "च" }]],
  ], ["देवः", "अस्ति", "च"]);

  assert.deepEqual(findSandhiSplits("देवोऽस्ति", options), [["देवः", "अस्ति"]]);
  assert.deepEqual(findSandhiSplits("देवोऽस्तिच", options), [["देवः", "अस्ति", "च"]]);
  assert.deepEqual(findSandhiSplits("देवोऽस्तिच", { ...options, maxParts: 2 }), []);
});

test("rejects paths with an unknown word or an invalid proposal", () => {
  const options = splitFixture([
    ["joined", new Set([
      { first: "unknown", second: "tail" },
      { first: "head", second: "unknown" },
      { first: "head", second: "deadend" },
      { first: "head", second: "other", isValid: false },
      { first: "head", second: "tail", isValid: true },
    ])],
    ["deadend", [{ first: "other", second: "missing" }]],
  ], ["head", "tail", "other"]);

  assert.deepEqual(findSandhiSplits("joined", options), [["head", "tail"]]);
});

test("checks restored final forms proposed with an empty second component", () => {
  const options = splitFixture([
    ["sUryodayaH", [{ first: "sUrya", second: "udayaH" }]],
    ["udayaH", [
      { first: "udayar", second: "" },
      { first: "udayas", second: "", isValid: true },
    ]],
  ], ["sUrya", "udayas"]);

  assert.deepEqual(findSandhiSplits("sUryodayaH", { ...options, maxParts: 2 }), [["sUrya", "udayas"]]);
  assert.deepEqual(findSandhiSplits("udayaH", { ...options, maxParts: 1 }), [["udayas"]]);
});

test("returns fewer words first and keeps proposal order for ties", () => {
  const options = splitFixture([
    ["joined", [
      { first: "first", second: "rest" },
      { first: "second", second: "tail" },
      { first: "first", second: "tail" },
    ]],
    ["rest", [{ first: "second", second: "tail" }]],
  ], ["joined", "first", "second", "tail"]);

  assert.deepEqual(findSandhiSplits("joined", options), [
    ["joined"], ["second", "tail"], ["first", "tail"], ["first", "second", "tail"],
  ]);
  assert.deepEqual(findSandhiSplits("joined", { ...options, limit: 2 }), [
    ["joined"], ["second", "tail"],
  ]);
});

test("returns each word sequence once and keeps distinct paths sharing a remainder", () => {
  const options = splitFixture([
    ["joined", [
      { first: "a", second: "rest" },
      { first: "b", second: "rest" },
      { first: "a", second: "alias" },
      { first: "a", second: "rest" },
    ]],
    ["rest", [{ first: "c", second: "tail" }]],
    ["alias", [{ first: "c", second: "tail" }]],
    ["tail", [{ first: "tail", second: "" }]],
  ], ["a", "b", "c", "tail"]);

  assert.deepEqual(findSandhiSplits("joined", options), [["a", "c", "tail"], ["b", "c", "tail"]]);
});

test("ignores malformed proposals and remainder cycles", () => {
  const options = splitFixture([
    ["joined", [
      null,
      "a tail",
      { first: "", second: "tail" },
      { first: 0, second: "tail" },
      { first: "a" },
      { first: "a", second: " " },
      { first: "a", second: "", isRecursive: true },
      { first: "a", second: "tail", isRecursive: true },
      { first: "a", second: "joined" },
      { first: "a", second: "loop" },
      { first: "b", second: "tail" },
    ]],
    ["loop", [{ first: "a", second: "joined" }]],
  ], ["joined", "a", "b", "tail"]);

  assert.deepEqual(findSandhiSplits("joined", options), [["joined"], ["b", "tail"]]);
});

test("handles a zero budget or blank input without consulting the callbacks", () => {
  const lookup = () => assert.fail("a callback was called");
  const options = { split: lookup, isWord: lookup };

  assert.deepEqual(findSandhiSplits("joined", { ...options, limit: 0 }), []);
  assert.deepEqual(findSandhiSplits("joined", { ...options, maxParts: 0 }), []);
  assert.deepEqual(findSandhiSplits(" \n", options), []);
});
