"use client";

import { useRouter } from "next/navigation";
import { getPath, Path } from "client/paths";

export const ProblemSearchBar = () => {
  const router = useRouter();

  const submit = (formData: FormData) => {
    const query = formData.get("query");
    if (query !== null && query !== '') {
      router.push(getPath({ kind: Path.TaskSearch, query: query.toString() }));
    }
  };

  return (
    <div className="py-2">
      <form action={submit}>
        <input type="text"
          name="query"
          className="p-1 m-2 border border-gray-300 text-gray-500 rounded-md"
          placeholder="Search by task name..." />
        <button className="p-1 text-white bg-blue-400 focus:bg-purple-500 rounded-md" type="submit"> Search </button>
      </form>
    </div>
  );
};
