import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { AWS_SES_REGION, AWS_SES_ACCESS_KEY_ID, AWS_SES_SECRET_ACCESS_KEY } from "server/secrets";
import { EmailSenderAbstract } from "./abstract";

export class EmailSenderSES implements EmailSenderAbstract {
  async send(recipient: string, sender: string, subject: string, text: string): Promise<unknown> {
    const client = new SESClient({
      region: AWS_SES_REGION,
      credentials: {
        accessKeyId: AWS_SES_ACCESS_KEY_ID,
        secretAccessKey: AWS_SES_SECRET_ACCESS_KEY,
      },
    });

    const params = {
      Destination: {
        ToAddresses: [recipient],
      },
      Message: {
        Body: {
          Text: {
            Data: text,
          },
        },
        Subject: {
          Data: subject,
        },
      },
      Source: sender, // Replace with your verified sender
    };

    const command = new SendEmailCommand(params);
    return await client.send(command);
  }
}
