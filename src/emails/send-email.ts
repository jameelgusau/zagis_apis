import { Resend } from "resend";
import { config } from "../config/env";

const resend = new Resend(config.email_secret_Key);

interface Attachment {
    filename: string;
    content: string; // base64
    contentType: string;
    contentId: string;
    // disposition: string;

}

interface Params {
    to: string;
    from: string; // Resend expects string format
    subject: string;
    html: string;
    attachments?: Attachment[];
    replyTo?: string;
}

const sendEmail = async ({
    to,
    subject,
    html,
    from,
    attachments,
    replyTo,
}: Params) => {
    try {

        const msg = await resend.emails.send({
            from,
            to,
            subject,
            html,
            ...(replyTo && { reply_to: replyTo }),
            ...(attachments && { attachments }),
        });
        if (!msg || msg.error) {
            return { success: false, error: msg.error || msg };
        }
        return { success: true, data: msg };
    } catch (error) {
        return { success: false, error };
    }
};

export default sendEmail;
