import { input, password, confirm } from "@inquirer/prompts";
import { Updateable } from "kysely";
import { db } from "db";
import { createUser } from "server/logic/users";
import { zAdminCreate, zAdminUpdate } from "common/validation/user_validation";
import { UserTable } from "common/types";

export class DeveloperToolsCRUD {
  static async adminCreate() {
    // Read in values
    const username = await input({ message: "Username:" });
    const email = await input({ message: "Email:" });
    const passwd = await password({ message: "Password:" });
    const admin = await confirm({ message: "Is Admin?" });

    // Parse with zod
    const parsed = zAdminCreate.safeParse({
      email,
      username,
      password: passwd,
      role: admin ? "admin" : "user",
    });

    if (!parsed.success) {
      console.error(parsed.error.errors);
      return false;
    }

    const finish = await confirmUser(parsed.data);
    if (!finish) {
      console.warn("Cancelled");
      return false;
    }

    return db.transaction().execute(async (trx) => {
      createUser(trx, {
        email: email,
        username: username,
        password: passwd,
        role: "admin",
      });
    });
  }

  static async adminUpdate() {
    // Look up the user by username
    const username = await input({ message: "Username:" });
    const user = await db
      .selectFrom("users")
      .select(["id", "name", "email", "username", "role"])
      .where("username", "=", username)
      .executeTakeFirst();

    if (user == null) {
      console.error("User not found");
      return false;
    }

    // Print out the current information
    console.info("Email: ", user.email);
    console.info("Username: ", user.username);
    console.info("Name: ", user.name);
    console.info("Role: ", user.role);

    const updates: Updateable<UserTable> = {
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    // Query the user for updates
    const updateEmail = await confirm({ message: "Update email?" });
    if (updateEmail) {
      const email = await input({ message: "Email:" });
      updates.email = email;
    }

    const updateUsername = await confirm({ message: "Update username?" });
    if (updateUsername) {
      const username = await input({ message: "Username:" });
      updates.username = username;
    }

    const updateName = await confirm({ message: "Update name?" });
    if (updateName) {
      const name = await input({ message: "Name:" });
      updates.name = name;
    }

    const updateRole = await confirm({ message: "Update role?" });
    if (updateRole) {
      const admin = await confirm({ message: "Is Admin?" });
      updates.role = admin ? "admin" : "user";
    }

    const parsed = zAdminUpdate.safeParse(updates);
    if (!parsed.success) {
      console.error(parsed.error.errors);
      return false;
    }

    const finish = await confirmUser(updates);
    if (!finish) {
      console.warn("Cancelled");
      return false;
    }

    if (Object.keys(updates).length > 0) {
      await db.updateTable("users").where("id", "=", user.id).set(updates).execute();
    }
  }
}

async function confirmUser(user: Updateable<UserTable>): Promise<boolean> {
  // Print out the current information
  console.info("Email: ", user.email);
  console.info("Username: ", user.username);
  console.info("Name: ", user.name);
  console.info("Role: ", user.role);

  return confirm({ message: "Are you sure?" });
}
