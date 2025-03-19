import { cache } from "react";
import { huradoIDToUUID } from "common/utils/uuid";

export enum SlugLookup {
  Slug,
  HID,
  NotFound,
}

type SlugLookupResult =
  | { kind: SlugLookup.HID; uuid: string }
  | { kind: SlugLookup.Slug; uuid: string }
  | { kind: SlugLookup.NotFound };

type SlugLookupFn = (slug: string) => Promise<string | undefined>;

async function uncachedFindFromSlugOrHID(
  slug: string,
  lookup: SlugLookupFn
): Promise<SlugLookupResult> {
  const uuid = huradoIDToUUID(slug);
  if (uuid == null) {
    const objID = await lookup(slug);
    if (objID == null) {
      return { kind: SlugLookup.NotFound };
    }
    return { kind: SlugLookup.Slug, uuid: objID };
  }
  return { kind: SlugLookup.HID, uuid: uuid };
}

export function makeFindFromSlugOrHID(lookup: SlugLookupFn) {
  return cache((slug: string) => uncachedFindFromSlugOrHID(slug, lookup));
}
