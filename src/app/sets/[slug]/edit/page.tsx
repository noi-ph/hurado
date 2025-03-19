import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { db } from "db";
import { getPath, Path } from "client/paths";
import { ProblemSetEditor } from "client/components/problem_set_editor";
import { ForbiddenPage } from "server/errors/forbidden";
import { getEditorProblemSet } from "server/logic/problem_sets/get_editor_problem_set";
import { getSession } from "server/sessions";
import { makeFindFromSlugOrHID, SlugLookup } from "server/slugs";

async function lookupProblemSetID(slug: string): Promise<string | undefined> {
  const set = await db
    .selectFrom("problem_sets")
    .select("id")
    .where("slug", "=", slug)
    .executeTakeFirst();
  return set?.id;
}

const getCachedEditorProblemSet = cache(getEditorProblemSet);
const findFromSlugOrHID = makeFindFromSlugOrHID(lookupProblemSetID);

type ProblemSetEditPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata(props: ProblemSetEditPageProps): Promise<Metadata | null> {
  const lookup = await findFromSlugOrHID(props.params.slug);
  if (lookup.kind == SlugLookup.NotFound || lookup.kind == SlugLookup.Slug) {
    return null;
  }

  const set = await getCachedEditorProblemSet(lookup.uuid);

  if (set == null) {
    return null;
  }

  return {
    title: `Admin | ${set.title}`,
    description: set.description,
  };
}

export default async function ProblemSetEditPage(props: ProblemSetEditPageProps) {
  const session = await getSession();
  if (session == null || session.user.role != "admin") {
    return <ForbiddenPage />;
  }

  const lookup = await findFromSlugOrHID(props.params.slug);
  if (lookup.kind == SlugLookup.NotFound) {
    return notFound();
  } else if (lookup.kind == SlugLookup.Slug) {
    return redirect(getPath({ kind: Path.ProblemSetEdit, uuid: lookup.uuid }));
  }

  const set = await getCachedEditorProblemSet(lookup.uuid);

  if (set == null) {
    return notFound();
  }

  return <ProblemSetEditor dto={set} />;
}
