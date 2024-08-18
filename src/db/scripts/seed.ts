import { hashSync } from "bcryptjs";
import { UserTable } from "common/types";
import { TaskDTO } from "common/validation/task_validation";
import { db } from "db";
import { Insertable } from "kysely";
import path from "path";
import { promises as fs } from "fs";
import { sha256 } from "common/utils/hashing";
import { TaskFileStorage } from "server/files";
import { updateEditorTask } from "server/logic/tasks/update_editor_task";

const users: Insertable<UserTable>[] = [
  {
    email: "kevin@example.com",
    username: "kevin",
    hashed_password: hashPassword("password"),
    school: "University of the Philippines - Diliman",
    name: "Kevin Sogo",
    role: "admin",
  },
];

const filenames = [
  "who-is-the-oldest-1a.in",
  "who-is-the-oldest-1b.in",
  "who-is-the-oldest-1c.in",
  "who-is-the-oldest-2a.in",
  "who-is-the-oldest-2b.in",
  "who-is-the-oldest-2c.in",
  "who-is-the-oldest-1a.out",
  "who-is-the-oldest-1b.out",
  "who-is-the-oldest-1c.out",
  "who-is-the-oldest-2a.out",
  "who-is-the-oldest-2b.out",
  "who-is-the-oldest-2c.out",
];

function makeTasks(ids: Map<string, string>, hashes: Map<string, string>) {
  const tasks: TaskDTO[] = [
    {
      id: getOrThrow(ids, "who-is-the-oldest"),
      slug: "who-is-the-oldest",
      title: "Who is the oldest?",
      statement: [
        "Alvin, Berto, and Carlo are friends. Their ages are $A$, $B$ and $C$, respectively. No two of them have the same age. Who is the oldest among them?",
        "The input contains three lines. The first line contains a single integer, $A$. The second line contains a single integer, $B$. The third line contains a single integer, $C$.",
        "Output the name of the oldest among the three, which should be either Alvin, Berto or Carlo.",
      ].join("\n"),
      description: "Determine the oldest among friends.",
      score_max: 100,
      checker: "",
      attachments: [],
      credits: [
        {
          name: "kevinsogo",
          role: "Problem Idea",
        },
        {
          name: "guissmo",
          role: "Story Author",
        },
        {
          name: "shisuko",
          role: "Tester",
        },
        {
          name: "verngutz",
          role: "Tester",
        },
      ],
      subtasks: [
        {
          name: "Subtask #1",
          score_max: 30,
          data: [
            {
              name: "Test Case #1",
              is_sample: true,
              input_file_name: "who-is-the-oldest-1a.in",
              input_file_hash: getOrThrow(hashes, "who-is-the-oldest-1a.in"),
              output_file_name: "who-is-the-oldest-1a.out",
              output_file_hash: getOrThrow(hashes, "who-is-the-oldest-1a.out"),
              judge_file_name: null,
              judge_file_hash: null,
            },
            {
              name: "Test Case #2",
              is_sample: true,
              input_file_name: "who-is-the-oldest-1b.in",
              input_file_hash: getOrThrow(hashes, "who-is-the-oldest-1b.in"),
              output_file_name: "who-is-the-oldest-1b.out",
              output_file_hash: getOrThrow(hashes, "who-is-the-oldest-1b.out"),
              judge_file_name: null,
              judge_file_hash: null,
            },
            {
              name: "Test Case #3",
              is_sample: false,
              input_file_name: "who-is-the-oldest-1c.in",
              input_file_hash: getOrThrow(hashes, "who-is-the-oldest-1c.in"),
              output_file_name: "who-is-the-oldest-1c.out",
              output_file_hash: getOrThrow(hashes, "who-is-the-oldest-1c.out"),
              judge_file_name: null,
              judge_file_hash: null,
            },
          ],
        },
        {
          name: "Subtask #2",
          score_max: 70,
          data: [
            {
              name: "Test Case #1",
              is_sample: false,
              input_file_name: "who-is-the-oldest-2a.in",
              input_file_hash: getOrThrow(hashes, "who-is-the-oldest-2a.in"),
              output_file_name: "who-is-the-oldest-2a.out",
              output_file_hash: getOrThrow(hashes, "who-is-the-oldest-2a.out"),
              judge_file_name: null,
              judge_file_hash: null,
            },
            {
              name: "Test Case #2",
              is_sample: false,
              input_file_name: "who-is-the-oldest-2b.in",
              input_file_hash: getOrThrow(hashes, "who-is-the-oldest-2b.in"),
              output_file_name: "who-is-the-oldest-2b.out",
              output_file_hash: getOrThrow(hashes, "who-is-the-oldest-2b.out"),
              judge_file_name: null,
              judge_file_hash: null,
            },
            {
              name: "Test Case #3",
              is_sample: false,
              input_file_name: "who-is-the-oldest-2c.in",
              input_file_hash: getOrThrow(hashes, "who-is-the-oldest-2c.in"),
              output_file_name: "who-is-the-oldest-2c.out",
              output_file_hash: getOrThrow(hashes, "who-is-the-oldest-2c.out"),
              judge_file_name: null,
              judge_file_hash: null,
            },
          ],
        },
      ],
    },
  ];
  return tasks;
}

export class __DO_NOT_IMPORT__DeveloperSeeds {
  static async run() {
    await db.insertInto("users").values(users).execute();
    const dbTasks = await db
      .insertInto("tasks")
      .values([
        {
          title: "Who is the oldest",
          slug: "who-is-the-oldest",
          statement: "",
          score_max: 100,
        },
      ])
      .returning(["id"])
      .execute();

    const ids = new Map<string, string>([["who-is-the-oldest", dbTasks[0].id]]);
    const hashes = new Map<string, string>();
    const hashset = new Set<string>();
    for (const filename of filenames) {
      const hash = await __DO_NOT_IMPORT__DeveloperSeeds.uploadFile(filename, hashset);
      hashes.set(filename, hash);
      hashset.add(hash);
    }
    const tasks = makeTasks(ids, hashes);
    for (const task of tasks) {
      updateEditorTask(task);
    }
  }

  private static async uploadFile(filename: string, hashset: Set<string>): Promise<string> {
    const filepath = path.join(__dirname, "data", filename);
    const stats = await fs.stat(filepath);
    const file = await fs.open(filepath);
    const buffer = await file.readFile();
    await file.close();
    const hash = await sha256(buffer);

    if (hashset.has(hash)) {
      console.log(`Skipping '${filename}' (${hash})`);
      return hash;
    }

    console.log(`Uploading '${filename}' (${hash})`);

    const blobClient = TaskFileStorage.getBlockBlobClient(hash);
    await blobClient.uploadData(buffer);

    await db
      .insertInto("task_files")
      .values({
        hash: hash,
        size: stats.size,
      })
      .returning("hash")
      .executeTakeFirstOrThrow();

    return hash;
  }
}

function getOrThrow<K, T>(map: Map<K, T>, key: K): T {
  if (!map.has(key)) {
    throw new Error(`Key ${key} is missing from map`);
  }

  return map.get(key)!;
}

function hashPassword(password: string) {
  return hashSync(password, 10);
}
