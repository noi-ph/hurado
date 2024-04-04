import type { Task } from "lib/models";

export async function generateStaticParams() {
  const response = await fetch("/api/v1/tasks");
  const tasks = await response.json();

  return tasks.map((task: Task) => ({
    params: { slug: task.title },
  }));
}

type props = {
  params: {
    slug: string;
  };
};

async function generateStaticProps(slug: string) {
  // generateStaticProps does not resolve the server URL
  const response = await fetch(`${process.env.SERVER!}/api/v1/tasks/${slug}`);
  const task = await response.json();

  return {
    title: task.title,
    description: task.description ?? "",
    statement: task.statement,
  };
}

async function Page({ params: { slug } }: props) {
  const { title, description, statement } = await generateStaticProps(slug);

  return (
    <>
      <h1>{title}</h1>
      <p>{description}</p>
      <p>{statement}</p>
    </>
  );
}

export default Page;
