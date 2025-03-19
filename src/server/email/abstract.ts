export abstract class EmailSenderAbstract {
  abstract send(recipient: string, sender: string, subject: string, text: string): Promise<unknown>;
}
