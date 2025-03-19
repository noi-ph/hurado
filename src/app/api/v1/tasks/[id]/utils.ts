import { checkUUIDv4, huradoIDToUUID } from "common/utils/uuid";
import { db } from "db";

export async function lookupFromSlugOrId(slug: string) {
  const uuid = huradoIDToUUID(slug) ?? checkUUIDv4(slug);

  const lookups = await db
    .selectFrom("tasks")
    .where((eb) => {
      if (uuid != null) {
        return eb.or([eb("id", "=", uuid), eb("slug", "=", slug)]);
      } else {
        return eb("slug", "=", slug);
      }
    })
    .select(["id", "slug", "title"])
    .execute();

  // Sort the results. Matching UUID trumps matching slug. Best result goes to lowest index.
  lookups.sort((a, b) => {
    if (a.id === uuid) {
      return b.id === uuid ? 0 : -1;
    }
    return b.id === uuid ? 1 : 0;
  });

  return lookups[0];
}
