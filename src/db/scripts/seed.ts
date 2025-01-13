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


// Hard-code these UUIDs so that you don't need to re-login after a db:reset, etc
const users: Insertable<UserTable>[] = [
  {
    id: "da3f6f95-096f-41fd-8214-34a5a7cb9a7f",
    email: "kevin@example.com",
    username: "kevinsogo",
    hashed_password: hashPassword("password"),
    school: "University of the Philippines - Diliman",
    name: "Kevin Sogo",
    role: "admin",
  },
  {
    id: "e7cbd74d-aa7c-477e-a17d-e558e63000dd",
    email: "vernon@example.com",
    username: "verngutz",
    hashed_password: hashPassword("password"),
    school: "Ateneo de Manila University",
    name: "Vernon Sago",
    role: "admin",
  },
  {
    id: "abfaecfe-5dd8-4f2a-81b1-d66efe22279e",
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
    id: "4a4638f5-b068-4c24-91a4-085fd15364dd",
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
    id: "c1c8d90b-15ed-49e9-b1e0-bc7089b9e5cf",
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
    id: "ed31191c-28ce-4c04-b7c3-cae9c88821f1",
    slug: "beginner",
    title: "Beginner Problems",
    description: "Problems for beginners",
    is_public: true,
    order: 0,
  },
  {
    id: "a4d5032e-e81d-4e6a-8241-56773831fd95",
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
  "batch-demo-checker.py",
  "batch-demo-1a.in",
  "batch-demo-1a.out",
  "batch-demo-1b.in",
  "batch-demo-1b.out",
  "batch-demo-2a.in",
  "batch-demo-2a.out",
  "batch-demo-2b.in",
  "batch-demo-2b.out",
  "chocolate-hills.jpg",
  "output-demo-1.out",
  "output-demo-2.out",
  "output-demo-3.out",
  "output-custom-checker.py",
  "output-custom-1.in",
  "output-custom-2.in",
  "output-custom-1.out",
  "output-custom-2.out",
  "comms-demo-communicator.py",
  "comms-demo-1a.in",
  "comms-demo-1a.out",
  "comms-demo-1b.in",
  "comms-demo-1b.out",
  "comms-demo-2a.in",
  "comms-demo-2a.out",
  "comms-demo-2b.in",
  "comms-demo-2b.out",
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
      id: getOrThrow(ids, "batch-demo"),
      slug: "batch-demo",
      title: "Batch Demo",
      statement: readFileSync("batch-demo.tex"),
      description: "Capitalize strings. A batch task with a custom grader",
      is_public: true,
      type: TaskType.Batch,
      score_max: 100,
      time_limit_ms: 2000,
      memory_limit_byte: 1_073_741_824,
      compile_memory_limit_byte: null,
      compile_time_limit_ms: null,
      submission_size_limit_byte: null,
      checker_kind: CheckerKind.Custom,
      checker_file_name: "batch-demo-checker.py",
      sample_IO: [],
      scripts: [
        {
          file_name: "batch-demo-checker.py",
          file_hash: getOrThrow(hashes, "batch-demo-checker.py"),
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
          score_max: 40,
          reducer_kind: ReducerKind.MinData,
          data: [
            {
              name: "Test Case #1",
              is_sample: false,
              input_file_name: "batch-demo-1a.in",
              input_file_hash: getOrThrow(hashes, "batch-demo-1a.in"),
              judge_file_name: "batch-demo-1a.out",
              judge_file_hash: getOrThrow(hashes, "batch-demo-1a.out"),
            },
            {
              name: "Test Case #2",
              is_sample: false,
              input_file_name: "batch-demo-1b.in",
              input_file_hash: getOrThrow(hashes, "batch-demo-1b.in"),
              judge_file_name: "batch-demo-1b.out",
              judge_file_hash: getOrThrow(hashes, "batch-demo-1b.out"),
            },
          ],
        },
        {
          name: "Subtask #2",
          score_max: 60,
          reducer_kind: ReducerKind.MinData,
          data: [
            {
              name: "Test Case #1",
              is_sample: false,
              input_file_name: "batch-demo-2a.in",
              input_file_hash: getOrThrow(hashes, "batch-demo-2a.in"),
              judge_file_name: "batch-demo-2a.out",
              judge_file_hash: getOrThrow(hashes, "batch-demo-2a.out"),
            },
            {
              name: "Test Case #2",
              is_sample: false,
              input_file_name: "batch-demo-2b.in",
              input_file_hash: getOrThrow(hashes, "batch-demo-2b.in"),
              judge_file_name: "batch-demo-2b.out",
              judge_file_hash: getOrThrow(hashes, "batch-demo-2b.out"),
            },
          ],
        },
      ],
    },
    {
      id: getOrThrow(ids, "output-demo"),
      slug: "output-demo",
      title: "Output Demo",
      statement: readFileSync("output-demo.tex"),
      description: "Sum the first N numbers. A basic output-only task.",
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
              judge_file_name: "output-demo-1.out",
              judge_file_hash: getOrThrow(hashes, "output-demo-1.out"),
            },
          ],
        },
        {
          name: "Subtask #2",
          score_max: 30,
          data: [
            {
              name: "Test Case #1",
              judge_file_name: "output-demo-2.out",
              judge_file_hash: getOrThrow(hashes, "output-demo-2.out"),
            },
          ],
        },
        {
          name: "Subtask #3",
          score_max: 50,
          data: [
            {
              name: "Test Case #1",
              judge_file_name: "output-demo-3.out",
              judge_file_hash: getOrThrow(hashes, "output-demo-3.out"),
            },
          ],
        },
      ],
    },
    {
      id: getOrThrow(ids, "output-custom"),
      slug: "output-custom",
      title: "Output-Only Custom Checker",
      statement: readFileSync("output-custom.tex"),
      description: "Capitalize strings. An output-only task with a custom grader.",
      is_public: true,
      type: TaskType.OutputOnly,
      flavor: TaskFlavor.OutputFile,
      score_max: 100,
      submission_size_limit_byte: null,
      checker_kind: CheckerKind.Custom,
      checker_file_name: "output-custom-checker.py",
      scripts: [
        {
          file_name: "output-custom-checker.py",
          file_hash: getOrThrow(hashes, "output-custom-checker.py"),
          language: Language.Python3,
        },
      ],
      attachments: [
        {
          path: "output-custom-1.in",
          mime_type: "text/plain",
          file_hash: getOrThrow(hashes, "output-custom-1.in"),
        },
        {
          path: "output-custom-2.in",
          mime_type: "text/plain",
          file_hash: getOrThrow(hashes, "output-custom-2.in"),
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
              judge_file_name: "output-custom-1.out",
              judge_file_hash: getOrThrow(hashes, "output-custom-1.out"),
            },
          ],
        },
        {
          name: "Subtask #2",
          score_max: 30,
          data: [
            {
              name: "Test Case #1",
              judge_file_name: "output-custom-2.out",
              judge_file_hash: getOrThrow(hashes, "output-custom-2.out"),
            },
          ],
        },
      ],
    },
    {
      type: TaskType.Communication,
      id: getOrThrow(ids, "comms-demo"),
      slug: "comms-demo",
      title: "Communication Task Demo",
      statement: readFileSync("comms-demo.tex"),
      description: "Sum the first N numbers. A basic output-only task.",
      is_public: true,
      score_max: 100,
      time_limit_ms: 2000,
      memory_limit_byte: 1_073_741_824,
      compile_memory_limit_byte: null,
      compile_time_limit_ms: null,
      submission_size_limit_byte: null,
      checker_kind: CheckerKind.LenientDiff,
      communicator_file_name: "comms-demo-communicator.py",
      sample_IO: [],
      scripts: [
        {
          file_name: "comms-demo-communicator.py",
          file_hash: getOrThrow(hashes, "comms-demo-communicator.py"),
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
              input_file_name: "comms-demo-1a.in",
              input_file_hash: getOrThrow(hashes, "comms-demo-1a.in"),
              judge_file_name: "comms-demo-1a.out",
              judge_file_hash: getOrThrow(hashes, "comms-demo-1a.out"),
            },
            {
              name: "Test Case #2",
              is_sample: false,
              input_file_name: "comms-demo-1b.in",
              input_file_hash: getOrThrow(hashes, "comms-demo-1b.in"),
              judge_file_name: "comms-demo-1b.out",
              judge_file_hash: getOrThrow(hashes, "comms-demo-1b.out"),
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
              input_file_name: "comms-demo-2a.in",
              input_file_hash: getOrThrow(hashes, "comms-demo-2a.in"),
              judge_file_name: "comms-demo-2a.out",
              judge_file_hash: getOrThrow(hashes, "comms-demo-2a.out"),
            },
            {
              name: "Test Case #2",
              is_sample: false,
              input_file_name: "comms-demo-2b.in",
              input_file_hash: getOrThrow(hashes, "comms-demo-2b.in"),
              judge_file_name: "comms-demo-2b.out",
              judge_file_hash: getOrThrow(hashes, "comms-demo-2b.out"),
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
          id: "defdfb9a-803f-418c-86e3-e255a3b9b698",
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
          id: "ab5a30fd-6c36-4c61-8b35-517fe2442917",
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
          id: "c5f03145-c3a6-4680-bd2f-1fa1888f5af7",
          title: "Batch Demo",
          slug: "batch-demo",
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
          id: "6d477ea2-c50c-4495-b4fd-9fed7db7c7c4",
          title: "Output-Only Demo",
          slug: "output-demo",
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
          id: "af30838c-ba65-4258-bbfc-d54b398f2c0e",
          title: "Output-Only Custom Checker",
          slug: "output-custom",
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
          id: "31a564d9-c80e-4b2b-a598-9d7cfbe3bf6f",
          title: "Hard of Hearing",
          slug: "comms-demo",
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
