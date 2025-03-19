import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { db } from "db";
import { ContestEditor } from "client/components/contest_editor";
import { getPath, Path } from "client/paths";
import { ForbiddenPage } from "server/errors/forbidden";
import { getEditorContest } from "server/logic/contests/get_editor_contest";
import { getSession } from "server/sessions";
import { makeFindFromSlugOrHID, SlugLookup } from "server/slugs";

async function lookupContestID(slug: string): Promise<string | undefined> {
  const set = await db
    .selectFrom("contests")
    .select("id")
    .where("slug", "=", slug)
    .executeTakeFirst();
  return set?.id;
}

const getCachedEditorContest = cache(getEditorContest);
const findFromSlugOrHID = makeFindFromSlugOrHID(lookupContestID);

type ContestEditPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata(props: ContestEditPageProps): Promise<Metadata | null> {
  const lookup = await findFromSlugOrHID(props.params.slug);
  if (lookup.kind == SlugLookup.NotFound || lookup.kind == SlugLookup.Slug) {
    return null;
  }

  const contest = await getCachedEditorContest(lookup.uuid);

  if (contest == null) {
    return null;
  }

  return {
    title: `Admin | ${contest.title}`,
    description: contest.description,
  };
}

export default async function ContestEditPage(props: ContestEditPageProps) {
  const session = await getSession();
  if (session == null || session.user.role != "admin") {
    return <ForbiddenPage />;
  }

  const lookup = await findFromSlugOrHID(props.params.slug);
  if (lookup.kind == SlugLookup.NotFound) {
    return notFound();
  } else if (lookup.kind == SlugLookup.Slug) {
    return redirect(getPath({ kind: Path.ContestEdit, uuid: lookup.uuid }));
  }

  const contest = await getCachedEditorContest(lookup.uuid);

  if (contest == null) {
    return notFound();
  }

  return <ContestEditor dto={contest} />;
}
