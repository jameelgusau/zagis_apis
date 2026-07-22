// import { child, x, facebook, insta } from "./images";
import sendEmail from "./send-email";
import { child, x, facebook, insta } from "./images";
interface abc {
  email: string;
  verificationToken: string;
  name: string;
  appName: string;
  adminName: string;
}
const sendVerificationEmail = async (account: abc, origin: string | undefined) => {

  const childImage = child.replace('data:image/png;base64,', '')
  const facebookImage = facebook.replace('data:image/png;base64,', '')
  const xImage = x.replace('data:image/png;base64,', '')
  const instaImage = insta.replace('data:image/png;base64,', '')

  let message;
  if (origin) {
    const verifyUrl = `${origin}/confirm-email/${account.verificationToken}`;
    message = `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Confirm Email</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&display=swap"
        rel="stylesheet">
    <style type="text/css">
        body {
            -webkit-font-smoothing: antialiased;
            -webkit-text-size-adjust: none;
            width: 100% !important;
            height: 100%;
        }
    </style>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: 'Geist', sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">

        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; border-radius:8px; padding:40px;">
                    <tr>
                        <td align="center">
                            <img style="margin-right: 15px; margin-top: 25px; margin-bottom: 25px; width: 100px; height: 100px;" src="cid:child"
                                alt="zamagile">
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <h2 style="margin:0; color:#008235;">You're Invited to Join ${account.appName}</h2>
                        </td>
                    </tr>

                    <tr>
                        <td style="color:#4a5568; font-size:16px; line-height:1.6;">
                            <p>Hello ${account.name},</p>

                            <p>
                                <strong>${account.adminName}</strong> has
                                created
                                an account for you on <strong> ${account.appName} portal</strong>.
                            </p>

                            <p>
                                To activate your account and verify your email address,
                                please click the button below:
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 30px 0;">
                            <a href=${verifyUrl} target="_blank"
                                style="background-color:#008235; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:6px; font-size:16px; display:inline-block;">
                                Verify & Activate Account
                            </a>
                        </td>
                    </tr>

                    <tr>
                        <td style="color:#718096; font-size:14px; line-height:1.6;">
                            <p>
                                If the button above does not work, copy and paste this link into your browser:
                            </p>
                            <p style="word-break:break-all;">
                                <a href="${verifyUrl}" style="color:#475467">
                                    ${verifyUrl}
                                </a>
                            <p/>

                            <p>
                                If you were not expecting this invitation, you can safely ignore this email.
                            </p>
                        </td>
        </t>
        <tr style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; margin: 0;">
            <td>
                <a href="https://www.x.com" style="text-decoration: none;">
                    <img style="margin-right: 15px; margin-top: 30px;" src="cid:x" alt="X">
                </a>
                <a href="https://web.facebook.com" style="text-decoration: none;">
                    <img style="margin-right: 15px; margin-top: 25px;" src="cid:facebook" alt="Facebook">
                </a>
                <a href="https://www.instagram.com" style="text-decoration: none;">
                    <img src="cid:insta" alt="Instagram">
                </a>
            </td>
        </tr>
        <tr>
            <td style="padding-top:30px; font-size:12px; color:#a0aec0;" align="center">
                © ${new Date().getFullYear()} ${account.appName}. All rights reserved.
            </td>
        </tr>

    </table>
    </td>
    </tr>
    </table>
</body>
</html>
    `;
  } else {
    message = `< p > Please use the below token to verify your email address with the<code> / verify - email < /code> api route:</p >
<p><a href= "#" > ${account.verificationToken} </a></p > `;
  }

  try {
    await sendEmail(
      {
        to: account.email || "",
        subject: 'Email Verification',
        html: message,
        from: "Admin <noreply@contact.blueorbita.com>",
        attachments: [
          {
            filename: "x.png",
            content: xImage,
            contentType: "image/png",
            contentId: "x",
            // disposition: "inline",
          },
          {
            filename: "child.png",
            content: childImage,
            contentType: "image/png",
            contentId: "child",
            // disposition: "inline",
          },
          {
            filename: "facebook.png",
            content: facebookImage,
            contentType: "image/png",
            contentId: "facebook",
            // disposition: "inline",
          },
          {
            filename: "insta.png",
            content: instaImage,
            contentType: "image/png",
           contentId: "insta",
            // disposition: "inline",
            
          },
        ],
      }
    )
  } catch (error) {
    throw error
  }
}

export default sendVerificationEmail;

// import { Resend } from 'resend';

// const resend = new Resend('re_P67SJt7i_9iY98vVg8p77oWpWWpj5KM2m');

// resend.emails.send({
//   from: 'onboarding@resend.dev',
//   to: 'jameelgusau@gmail.com',
//   subject: 'Hello World',
//   html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
// });