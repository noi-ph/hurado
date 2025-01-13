import fs from "fs";
import path from "path";
import { Insertable } from "kysely";
import { db } from "db";
import { ContestTable, ProblemSetTable, UserTable } from "common/types";
import { TaskDTO } from "common/validation/task_validation";
import { sha256 } from "common/utils/hashing";
import { CheckerKind, Language, ReducerKind, TaskFlavor, TaskType } from "common/types/constants";
import { TaskFileStorage } from "server/files";
import { updateEditorTask } from "server/logic/tasks/update_editor_task";
import { hashPassword } from "server/logic/users";


const users: Insertable<UserTable>[] = [
  {
    email: "kevin@example.com",
    username: "kevinsogo",
    hashed_password: hashPassword("password"),
    school: "University of the Philippines - Diliman",
    name: "Kevin Sogo",
    role: "admin",
  },
  {
    email: "vernon@example.com",
    username: "verngutz",
    hashed_password: hashPassword("password"),
    school: "Ateneo de Manila University",
    name: "Vernon Sago",
    role: "admin",
  },
  {
    email: "cisco@example.com",
    username: "shisuko",
    hashed_password: hashPassword("password"),
    school: "Ateneo de Manila University",
    name: "Cisco Sugoi",
    role: "user",
  },
];

const contests: Insertable<ContestTable>[] = [
  {
    slug: "noi-elims",
    title: "NOI.PH Eliminations",
    description: "The best elimination round",
    statement: "Join this contest to get eliminated!",
    owner_id: "kevinsogo",
    is_public: true,
    start_time: null,
    end_time: null,
  },
  {
    slug: "noi-finals",
    title: "NOI.PH Finals",
    description: "Secret final contest",
    statement: "Join this contest to win the greatest prize of all!",
    owner_id: "kevinsogo",
    is_public: false,
    start_time: null,
    end_time: null,
  },
];

const psets: Insertable<ProblemSetTable>[] = [
  {
    slug: "beginner",
    title: "Beginner Problems",
    description: "Problems for beginners",
    is_public: true,
    order: 0,
  },
  {
    slug: "advanced",
    title: "Advanced Problems",
    description: "Problems for advanced users",
    is_public: true,
    order: 1,
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
  "sharing-chocolates-1a.in",
  "sharing-chocolates-1b.in",
  "sharing-chocolates-1c.in",
  "sharing-chocolates-1d.in",
  "sharing-chocolates-1e.in",
  "sharing-chocolates-1f.in",
  "sharing-chocolates-2a.in",
  "sharing-chocolates-1a.out",
  "sharing-chocolates-1b.out",
  "sharing-chocolates-1c.out",
  "sharing-chocolates-1d.out",
  "sharing-chocolates-1e.out",
  "sharing-chocolates-1f.out",
  "sharing-chocolates-2a.out",
  "crazy-problem-checker.py",
  "crazy-problem-1a.in",
  "crazy-problem-1a.out",
  "crazy-problem-2a.in",
  "crazy-problem-2a.out",
  "chocolate-hills.jpg",
  "sum-of-n-1.out",
  "sum-of-n-2.out",
  "sum-of-n-3.out",
  "please-add-checker.py",
  "please-add-1.in",
  "please-add-2.in",
  "please-add-1.out",
  "please-add-2.out",
  "hard-of-hearing-communicator.py",
  "hard-of-hearing-1.in",
  "hard-of-hearing-2.in",
  "hard-of-hearing-1.out",
  "hard-of-hearing-2.out",
];

function makeTasks(ids: Map<string, string>, hashes: Map<string, string>) {
  const tasks: TaskDTO[] = [
    {
      type: TaskType.Batch,
      id: getOrThrow(ids, "who-is-the-oldest"),
      slug: "who-is-the-oldest",
      title: "Who is the oldest?",
      statement: [
        "Alvin, Berto, and Carlo are friends. Their ages are $A$, $B$ and $C$, respectively. No two of them have the same age. Who is the oldest among them?",
        "The input contains three lines. The first line contains a single integer, $A$. The second line contains a single integer, $B$. The third line contains a single integer, $C$.",
        "Output the name of the oldest among the three, which should be either Alvin, Berto or Carlo.",
      ].join("\n"),
      description: "Determine the oldest among friends.",
      is_public: true,
      score_max: 100,
      time_limit_ms: 2000,
      memory_limit_byte: 1_073_741_824,
      compile_memory_limit_byte: null,
      compile_time_limit_ms: null,
      submission_size_limit_byte: null,
      checker_kind: CheckerKind.LenientDiff,
      scripts: [],
      attachments: [],
      sample_IO: [],
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
          reducer_kind: ReducerKind.MinData,
          data: [
            {
              name: "Test Case #1",
              is_sample: true,
              input_file_name: "who-is-the-oldest-1a.in",
              input_file_hash: getOrThrow(hashes, "who-is-the-oldest-1a.in"),
              judge_file_name: "who-is-the-oldest-1a.out",
              judge_file_hash: getOrThrow(hashes, "who-is-the-oldest-1a.out"),
            },
            {
              name: "Test Case #2",
              is_sample: true,
              input_file_name: "who-is-the-oldest-1b.in",
              input_file_hash: getOrThrow(hashes, "who-is-the-oldest-1b.in"),
              judge_file_name: "who-is-the-oldest-1b.out",
              judge_file_hash: getOrThrow(hashes, "who-is-the-oldest-1b.out"),
            },
            {
              name: "Test Case #3",
              is_sample: false,
              input_file_name: "who-is-the-oldest-1c.in",
              input_file_hash: getOrThrow(hashes, "who-is-the-oldest-1c.in"),
              judge_file_name: "who-is-the-oldest-1c.out",
              judge_file_hash: getOrThrow(hashes, "who-is-the-oldest-1c.out"),
            },
          ],
        },
        {
          name: "Subtask #2",
          score_max: 70,
          reducer_kind: ReducerKind.MinData,
          data: [
            {
              name: "Test Case #1",
              is_sample: false,
              input_file_name: "who-is-the-oldest-2a.in",
              input_file_hash: getOrThrow(hashes, "who-is-the-oldest-2a.in"),
              judge_file_name: "who-is-the-oldest-2a.out",
              judge_file_hash: getOrThrow(hashes, "who-is-the-oldest-2a.out"),
            },
            {
              name: "Test Case #2",
              is_sample: false,
              input_file_name: "who-is-the-oldest-2b.in",
              input_file_hash: getOrThrow(hashes, "who-is-the-oldest-2b.in"),
              judge_file_name: "who-is-the-oldest-2b.out",
              judge_file_hash: getOrThrow(hashes, "who-is-the-oldest-2b.out"),
            },
            {
              name: "Test Case #3",
              is_sample: false,
              input_file_name: "who-is-the-oldest-2c.in",
              input_file_hash: getOrThrow(hashes, "who-is-the-oldest-2c.in"),
              judge_file_name: "who-is-the-oldest-2c.out",
              judge_file_hash: getOrThrow(hashes, "who-is-the-oldest-2c.out"),
            },
          ],
        },
      ],
    },
    {
      id: getOrThrow(ids, "sharing-chocolates"),
      slug: "sharing-chocolates",
      title: "Sharing Chocolates",
      statement: [
        "Alvin and Berto are best of friends, and just won a programming contest together. " +
          "As part of the prize, Alvin was given chocolates, and Berto was given chocolates. " +
          "But since they're such good friends, they want to split the chocolates fairly between them. ",
        "Alvin and Berto have enlisted your help in finding out if they can share their chocolates fairly " +
          "(that is, such that the exact same number of chocolates go to Alvin and to Berto each), " +
          "without cutting their chocolates into pieces.",
      ].join("\n"),
      description: "Can Alvin and Berto share their chocolates fairly?",
      is_public: true,
      type: TaskType.Batch,
      score_max: 100,
      time_limit_ms: 2000,
      memory_limit_byte: 1_073_741_824,
      compile_memory_limit_byte: null,
      compile_time_limit_ms: null,
      submission_size_limit_byte: null,
      checker_kind: CheckerKind.LenientDiff,
      scripts: [],
      attachments: [],
      sample_IO: [],
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
          score_max: 50,
          reducer_kind: ReducerKind.MinData,
          data: [
            {
              name: "Test Case #1",
              is_sample: true,
              input_file_name: "sharing-chocolates-1a.in",
              input_file_hash: getOrThrow(hashes, "sharing-chocolates-1a.in"),
              judge_file_name: "sharing-chocolates-1a.out",
              judge_file_hash: getOrThrow(hashes, "sharing-chocolates-1a.out"),
            },
            {
              name: "Test Case #2",
              is_sample: true,
              input_file_name: "sharing-chocolates-1b.in",
              input_file_hash: getOrThrow(hashes, "sharing-chocolates-1b.in"),
              judge_file_name: "sharing-chocolates-1b.out",
              judge_file_hash: getOrThrow(hashes, "sharing-chocolates-1b.out"),
            },
            {
              name: "Test Case #3",
              is_sample: false,
              input_file_name: "sharing-chocolates-1c.in",
              input_file_hash: getOrThrow(hashes, "sharing-chocolates-1c.in"),
              judge_file_name: "sharing-chocolates-1c.out",
              judge_file_hash: getOrThrow(hashes, "sharing-chocolates-1c.out"),
            },
            {
              name: "Test Case #4",
              is_sample: false,
              input_file_name: "sharing-chocolates-1d.in",
              input_file_hash: getOrThrow(hashes, "sharing-chocolates-1d.in"),
              judge_file_name: "sharing-chocolates-1d.out",
              judge_file_hash: getOrThrow(hashes, "sharing-chocolates-1d.out"),
            },
            {
              name: "Test Case #5",
              is_sample: false,
              input_file_name: "sharing-chocolates-1e.in",
              input_file_hash: getOrThrow(hashes, "sharing-chocolates-1e.in"),
              judge_file_name: "sharing-chocolates-1e.out",
              judge_file_hash: getOrThrow(hashes, "sharing-chocolates-1e.out"),
            },
            {
              name: "Test Case #6",
              is_sample: false,
              input_file_name: "sharing-chocolates-1f.in",
              input_file_hash: getOrThrow(hashes, "sharing-chocolates-1f.in"),
              judge_file_name: "sharing-chocolates-1f.out",
              judge_file_hash: getOrThrow(hashes, "sharing-chocolates-1f.out"),
            },
          ],
        },
        {
          name: "Subtask #2",
          score_max: 50,
          reducer_kind: ReducerKind.MinData,
          data: [
            {
              name: "Test Case #1",
              is_sample: false,
              input_file_name: "sharing-chocolates-2a.in",
              input_file_hash: getOrThrow(hashes, "sharing-chocolates-2a.in"),
              judge_file_name: "sharing-chocolates-2a.out",
              judge_file_hash: getOrThrow(hashes, "sharing-chocolates-2a.out"),
            },
          ],
        },
      ],
    },
    {
      id: getOrThrow(ids, "crazy-problem"),
      slug: "crazy-problem",
      title: "Crazy Problem",
      statement: readFileSync("crazy-problem.tex"),
      description: "Read a crazy statement. Solve a crazy problem.",
      is_public: true,
      type: TaskType.Batch,
      score_max: 100,
      time_limit_ms: 2000,
      memory_limit_byte: 1_073_741_824,
      compile_memory_limit_byte: null,
      compile_time_limit_ms: null,
      submission_size_limit_byte: null,
      checker_kind: CheckerKind.Custom,
      checker_file_name: "crazy-problem-checker.py",
      sample_IO: [],
      scripts: [
        {
          file_name: "crazy-problem-checker.py",
          file_hash: getOrThrow(hashes, "crazy-problem-checker.py"),
          language: Language.Python3,
        },
      ],
      attachments: [
        {
          path: "path/to/chocolate-hills.jpg",
          mime_type: "image/jpeg",
          file_hash: getOrThrow(hashes, "chocolate-hills.jpg"),
        },
      ],
      credits: [
        {
          name: "jabbawookiees",
          role: "Problem Idea",
        },
        {
          name: "jabbawookiees",
          role: "Story Author",
        },
        {
          name: "jabbawookiees",
          role: "Tester",
        },
      ],
      subtasks: [
        {
          name: "Subtask #1",
          score_max: 30,
          reducer_kind: ReducerKind.MinData,
          data: [
            {
              name: "Test Case #1",
              is_sample: false,
              input_file_name: "crazy-problem-1a.in",
              input_file_hash: getOrThrow(hashes, "crazy-problem-1a.in"),
              judge_file_name: "crazy-problem-1a.out",
              judge_file_hash: getOrThrow(hashes, "crazy-problem-1a.out"),
            },
          ],
        },
        {
          name: "Subtask #2",
          score_max: 70,
          reducer_kind: ReducerKind.MinData,
          data: [
            {
              name: "Test Case #1",
              is_sample: false,
              input_file_name: "crazy-problem-2a.in",
              input_file_hash: getOrThrow(hashes, "crazy-problem-2a.in"),
              judge_file_name: "crazy-problem-2a.out",
              judge_file_hash: getOrThrow(hashes, "crazy-problem-2a.out"),
            },
          ],
        },
      ],
    },
    {
      id: getOrThrow(ids, "sum-of-n"),
      slug: "sum-of-n",
      title: "Sum of N",
      statement:
        "Get the sum of the first n numbers. Subtask 1: n = 3. Subtask 2: n = 10, Subtask 3: n = 100",
      description: "Solve a quadratic equation!",
      is_public: true,
      type: TaskType.OutputOnly,
      flavor: TaskFlavor.OutputText,
      score_max: 100,
      submission_size_limit_byte: null,
      checker_kind: CheckerKind.LenientDiff,
      scripts: [],
      attachments: [],
      sample_IO: [],
      credits: [
        {
          name: "jabbawookiees",
          role: "Problem Idea",
        },
        {
          name: "jabbawookiees",
          role: "Story Author",
        },
        {
          name: "jabbawookiees",
          role: "Tester",
        },
      ],
      subtasks: [
        {
          name: "Subtask #1",
          score_max: 20,
          data: [
            {
              name: "Test Case #1",
              judge_file_name: "sum-of-n-1.out",
              judge_file_hash: getOrThrow(hashes, "sum-of-n-1.out"),
            },
          ],
        },
        {
          name: "Subtask #2",
          score_max: 30,
          data: [
            {
              name: "Test Case #1",
              judge_file_name: "sum-of-n-2.out",
              judge_file_hash: getOrThrow(hashes, "sum-of-n-2.out"),
            },
          ],
        },
        {
          name: "Subtask #3",
          score_max: 50,
          data: [
            {
              name: "Test Case #1",
              judge_file_name: "sum-of-n-3.out",
              judge_file_hash: getOrThrow(hashes, "sum-of-n-3.out"),
            },
          ],
        },
      ],
    },
    {
      id: getOrThrow(ids, "please-add"),
      slug: "please-add",
      title: "Please Add",
      statement:
        "Please add the numbers in the input files \\href{/tasks/please-add/attachments/please-add-1.in}{Subtask 1} \\href{/tasks/please-add/attachments/please-add-2.in}{Subtask 2}",
      description: "Follow instructions!",
      is_public: true,
      type: TaskType.OutputOnly,
      flavor: TaskFlavor.OutputFile,
      score_max: 100,
      submission_size_limit_byte: null,
      checker_kind: CheckerKind.Custom,
      checker_file_name: "please-add-checker.py",
      scripts: [
        {
          file_name: "please-add-checker.py",
          file_hash: getOrThrow(hashes, "please-add-checker.py"),
          language: Language.Python3,
        },
      ],
      attachments: [
        {
          path: "please-add-1.in",
          mime_type: "text/plain",
          file_hash: getOrThrow(hashes, "please-add-1.in"),
        },
        {
          path: "please-add-2.in",
          mime_type: "text/plain",
          file_hash: getOrThrow(hashes, "please-add-2.in"),
        },
      ],
      sample_IO: [],
      credits: [
        {
          name: "jabbawookiees",
          role: "Problem Idea",
        },
        {
          name: "jabbawookiees",
          role: "Story Author",
        },
        {
          name: "jabbawookiees",
          role: "Tester",
        },
      ],
      subtasks: [
        {
          name: "Subtask #1",
          score_max: 20,
          data: [
            {
              name: "Test Case #1",
              judge_file_name: "please-add-1.out",
              judge_file_hash: getOrThrow(hashes, "please-add-1.out"),
            },
          ],
        },
        {
          name: "Subtask #2",
          score_max: 30,
          data: [
            {
              name: "Test Case #1",
              judge_file_name: "please-add-2.out",
              judge_file_hash: getOrThrow(hashes, "please-add-2.out"),
            },
          ],
        },
      ],
    },
    {
      type: TaskType.Communication,
      id: getOrThrow(ids, "hard-of-hearing"),
      slug: "hard-of-hearing",
      title: "Hard of Hearing",
      statement: [
        "Your grandfather is deaf and you want to write a hearing-to-deaf translator.",
        "We will provide a program that will send lines of text and you have to send them back in uppercase.",
      ].join("\n"),
      description: "Help your grandfather hear better!",
      is_public: true,
      score_max: 100,
      time_limit_ms: 2000,
      memory_limit_byte: 1_073_741_824,
      compile_memory_limit_byte: null,
      compile_time_limit_ms: null,
      submission_size_limit_byte: null,
      checker_kind: CheckerKind.LenientDiff,
      communicator_file_name: "hard-of-hearing-communicator.py",
      sample_IO: [],
      scripts: [
        {
          file_name: "hard-of-hearing-communicator.py",
          file_hash: getOrThrow(hashes, "hard-of-hearing-communicator.py"),
          language: Language.Python3,
        },
      ],
      attachments: [],
      credits: [
        {
          name: "jabbawookiees",
          role: "Problem Idea",
        },
        {
          name: "jabbawookiees",
          role: "Story Author",
        },
        {
          name: "jabbawookiees",
          role: "Tester",
        },
      ],
      subtasks: [
        {
          name: "Subtask #1",
          score_max: 30,
          reducer_kind: ReducerKind.MinData,
          data: [
            {
              name: "Test Case #1",
              is_sample: true,
              input_file_name: "hard-of-hearing-1.in",
              input_file_hash: getOrThrow(hashes, "hard-of-hearing-1.in"),
              judge_file_name: "hard-of-hearing-1.out",
              judge_file_hash: getOrThrow(hashes, "hard-of-hearing-1.out"),
            },
          ],
        },
        {
          name: "Subtask #2",
          score_max: 70,
          reducer_kind: ReducerKind.MinData,
          data: [
            {
              name: "Test Case #1",
              is_sample: false,
              input_file_name: "hard-of-hearing-2.in",
              input_file_hash: getOrThrow(hashes, "hard-of-hearing-2.in"),
              judge_file_name: "hard-of-hearing-2.out",
              judge_file_hash: getOrThrow(hashes, "hard-of-hearing-2.out"),
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
    const dbUsers = await db
      .insertInto("users")
      .values(users)
      .returning(["id", "username"])
      .execute();

    const userIds = new Map<string, string>(dbUsers.map((u) => [u.username, u.id]));

    const dbTasks = await db
      .insertInto("tasks")
      .values([
        {
          title: "Who is the oldest",
          slug: "who-is-the-oldest",
          statement: "",
          is_public: true,
          type: TaskType.Batch,
          score_max: 100,
          time_limit_ms: 2000,
          memory_limit_byte: 1_073_741_824,
          checker_kind: CheckerKind.LenientDiff,
          owner_id: getOrThrow(userIds, "kevinsogo"),
        },
        {
          title: "Sharing Chocolates",
          slug: "sharing-chocolates",
          statement: "",
          is_public: true,
          type: TaskType.Batch,
          score_max: 100,
          time_limit_ms: 2000,
          memory_limit_byte: 1_073_741_824,
          checker_kind: CheckerKind.LenientDiff,
          owner_id: getOrThrow(userIds, "kevinsogo"),
        },
        {
          title: "Crazy Problem",
          slug: "crazy-problem",
          statement: "",
          is_public: true,
          type: TaskType.Batch,
          score_max: 100,
          time_limit_ms: 2000,
          memory_limit_byte: 1_073_741_824,
          checker_kind: CheckerKind.LenientDiff,
          owner_id: getOrThrow(userIds, "kevinsogo"),
        },
        {
          title: "Sum of N",
          slug: "sum-of-n",
          statement: "",
          is_public: true,
          type: TaskType.OutputOnly,
          flavor: TaskFlavor.OutputText,
          score_max: 100,
          time_limit_ms: 2000,
          memory_limit_byte: 1_073_741_824,
          checker_kind: CheckerKind.LenientDiff,
          owner_id: getOrThrow(userIds, "kevinsogo"),
        },
        {
          title: "Please Add",
          slug: "please-add",
          statement: "",
          is_public: true,
          type: TaskType.OutputOnly,
          flavor: TaskFlavor.OutputFile,
          score_max: 100,
          time_limit_ms: 2000,
          memory_limit_byte: 1_073_741_824,
          checker_kind: CheckerKind.LenientDiff,
          owner_id: getOrThrow(userIds, "kevinsogo"),
        },
        {
          title: "Hard of Hearing",
          slug: "hard-of-hearing",
          statement: "",
          is_public: true,
          type: TaskType.Communication,
          score_max: 100,
          time_limit_ms: 2000,
          memory_limit_byte: 1_073_741_824,
          checker_kind: CheckerKind.LenientDiff,
          owner_id: getOrThrow(userIds, "kevinsogo"),
        },
      ])
      .returning(["id", "slug"])
      .execute();

    const taskids = new Map<string, string>(dbTasks.map((t) => [t.slug, t.id]));
    const fileHashMap = new Map<string, string>();
    const fileHashSet = new Set<string>();
    for (const filename of filenames) {
      const hash = await __DO_NOT_IMPORT__DeveloperSeeds.uploadFile(filename, fileHashSet);
      fileHashMap.set(filename, hash);
      fileHashSet.add(hash);
    }
    const tasks = makeTasks(taskids, fileHashMap);
    for (const task of tasks) {
      await updateEditorTask(task);
    }

    const _dbContests = await db
      .insertInto("contests")
      .values(
        contests.map((c) => ({
          slug: c.slug,
          title: c.title,
          description: c.description,
          statement: c.statement,
          owner_id: getOrThrow(userIds, c.owner_id),
          is_public: c.is_public,
        }))
      )
      .returning(["id", "slug"])
      .execute();

      const _dbProblemSets = await db
        .insertInto("problem_sets")
        .values(
          psets.map((p) => ({
            slug: p.slug,
            title: p.title,
            description: p.description,
            is_public: p.is_public,
            order: p.order,
          }))
        )
        .returning(["id", "slug"])
        .execute();
  }

  private static async uploadFile(filename: string, hashset: Set<string>): Promise<string> {
    const filepath = path.join(__dirname, "data", filename);
    const stats = await fs.promises.stat(filepath);
    const file = await fs.promises.open(filepath);
    const buffer = await file.readFile();
    await file.close();
    const hash = await sha256(buffer);

    if (hashset.has(hash)) {
      console.log(`Skipping '${filename}' (${hash})`);
      return hash;
    }

    console.log(`Uploading '${filename}' (${hash})`);

    await TaskFileStorage.uploadFromBuffer(hash, buffer);

    await db
      .insertInto("files")
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

function readFileSync(filename: string): string {
  const filepath = path.join(__dirname, "data", filename);
  const buffer = fs.readFileSync(filepath);
  return buffer.toString("utf8");
}
