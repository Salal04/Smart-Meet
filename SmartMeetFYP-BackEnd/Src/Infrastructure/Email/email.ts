import type { IEmailService } from "../../Domain/InterFaces/IEmailService.js";
import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

export class BrevoEmail implements IEmailService {
    private transactionalApi: TransactionalEmailsApi;
    private senderemail :string
    
    constructor(email:string) {
        this.transactionalApi = new TransactionalEmailsApi();
        (this.transactionalApi as any).authentications["apiKey"].apiKey = process.env.BREVO_API_KEY!;
        this.senderemail = email; 
    }
    sendEmail(receivers: string[], content: string, time:string): Promise<boolean> {
        const msg = new SendSmtpEmail();
        msg.sender = { name: "SmartMeet", email: this.senderemail };
        msg.to = receivers.map(email => ({ email }));
        msg.subject = "Meeting Invitation from your organization";
        msg.htmlContent = content;
        msg.textContent = content;
        return this.transactionalApi.sendTransacEmail(msg)
            .then(() => {
                console.log("Email sent successfully via Brevo!");
                return true;
            })
            .catch((error: any) => {
                console.error("Error sending email via Brevo:", error);
                return false;
            });
    }
 

    async sendCode(email: string, code: string): Promise<boolean> {
        const msg = new SendSmtpEmail();
        msg.sender = { name: "SmartMeet", email: this.senderemail };
        msg.to = [{ email }];
        msg.subject = "Your Login Code";
        msg.htmlContent = `<p>Your login code is: <strong>${code}</strong></p>`;
        msg.textContent = `Your login code is: ${code}`;

        try {
            await this.transactionalApi.sendTransacEmail(msg);
            console.log("Login code sent successfully via Brevo!");
            return true;
        } catch (error: any) {
            console.error("Error sending login code via Brevo:", error);
            return false;
        }
    }

    async submitResponse(name: string, email: string, response: string): Promise<boolean> {
        const msg = new SendSmtpEmail();
        msg.sender = { name: "SmartMeet", email: this.senderemail };
        msg.to = [{ email: this.senderemail }];  
        msg.subject = `Response from ${name}`;
        msg.htmlContent = `<p>${name} (${email}) has responded: <strong>${response}</strong></p>`;
        msg.textContent = `${name} (${email}) has responded: ${response}`;

        try {
            await this.transactionalApi.sendTransacEmail(msg);
            console.log("Response submitted successfully via Brevo!");
            return true;
        } catch (error: any) {
            console.error("Error submitting response via Brevo:", error);
            return false;
        }
    }
}
