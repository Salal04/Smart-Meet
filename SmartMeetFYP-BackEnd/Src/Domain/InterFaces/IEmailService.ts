export interface IEmailService{
    sendCode(email:string ,code:string ): Promise<boolean>
    sendEmail(receivers: string[], content:string, time: string): Promise<boolean>
}