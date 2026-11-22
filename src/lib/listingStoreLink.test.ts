// Run with: node --experimental-strip-types --test src/lib/listingStoreLink.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildListingIntentUrl,
  buildListingStoreUrl,
  isValidListingPublicId,
  PLAY_STORE_PACKAGE_URL,
} from "./listingStoreLink.ts";

const ID = "aB3_-xyz";

test("store URL keeps the package URL and a single referrer param", () => {
  const url = buildListingStoreUrl(ID);
  assert.ok(url.startsWith(`${PLAY_STORE_PACKAGE_URL}&referrer=`), url);
  assert.equal(url.split("referrer=").length - 1, 1);
});

test("referrer is URL-encoded and decodes back to the listing attribution", () => {
  const url = buildListingStoreUrl(ID);
  const encoded = url.slice(url.indexOf("referrer=") + "referrer=".length);
  assert.ok(!encoded.includes("&"), "raw & must not leak out of the referrer");
  assert.ok(!encoded.includes("="), "raw = must not leak out of the referrer");
  assert.equal(
    decodeURIComponent(encoded),
    `shotnode_listing=${ID}&utm_source=share&utm_medium=listing_link&utm_campaign=project_link`,
  );
});

test("intent URL encodes the id and embeds the encoded fallback", () => {
  const url = buildListingIntentUrl(ID);
  assert.ok(url.startsWith(`intent://l/${ID}#Intent;scheme=shotnode;package=com.shotnode.app;`), url);
  assert.ok(url.endsWith(";end"));
  const fallback = url.match(/S\.browser_fallback_url=([^;]*);end$/)?.[1];
  assert.ok(fallback, "fallback param present");
  assert.equal(decodeURIComponent(fallback), buildListingStoreUrl(ID));
});

test("intent URL has no raw & or ; inside the fallback value", () => {
  const url = buildListingIntentUrl(ID);
  const fallback = url.match(/S\.browser_fallback_url=([^;]*);end$/)?.[1] ?? "";
  assert.ok(!fallback.includes("&"));
  assert.ok(!fallback.includes(";"));
});

test("intent URL path segment is encoded", () => {
  const id = "abcd_1";
  assert.ok(buildListingIntentUrl(id).startsWith("intent://l/abcd_1#Intent"));
});

test("publicId validation matches the documented pattern", () => {
  assert.equal(isValidListingPublicId("abcd"), true);
  assert.equal(isValidListingPublicId("a".repeat(64)), true);
  assert.equal(isValidListingPublicId("abc"), false);
  assert.equal(isValidListingPublicId("a".repeat(65)), false);
  assert.equal(isValidListingPublicId("ab/cd"), false);
  assert.equal(isValidListingPublicId("ab&cd"), false);
  assert.equal(isValidListingPublicId("ab cd"), false);
});
