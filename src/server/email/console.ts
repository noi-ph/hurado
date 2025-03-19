import { EmailSenderAbstract } from "./abstract";

export class EmailSenderConsole implements EmailSenderAbstract {
  async send(recipient: string, sender: string, subject: string, body: string): Promise<void> {
    console.info("--------------------------------------------------");
    console.info(`Sending email`);
    console.info(`To: ${recipient}`);
    console.info(`From: ${sender}`);
    console.info(`Subject: ${subject}`);
    console.info(`Body:\n${body}`);
    console.info("--------------------------------------------------");
  }
}
