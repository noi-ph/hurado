import { EMAIL_PROVIDER } from "server/secrets";
import { EmailSenderAbstract } from "./abstract";
import { EmailSenderConsole } from "./console";
import { EmailSenderSES } from "./ses";

export const EmailSender: EmailSenderAbstract =
  EMAIL_PROVIDER == "console" ? new EmailSenderConsole() : new EmailSenderSES();
