import sendEmail from "./send-email";
import { child, x, facebook, insta } from "./images";
interface abc {
  email: string;
  reset_token: string;
  full_name: string;
  appName: string
}
const sendPasswordResetEmail = async (account: abc, origin: string | undefined) => {
  const childImage = child.replace('data:image/png;base64,', '')
  const facebookImage = facebook.replace('data:image/png;base64,', '')
  const xImage = x.replace('data:image/png;base64,', '')
  const instaImage = insta.replace('data:image/png;base64,', '')
  const { reset_token, email, full_name, appName } = account
  let message;
  if (origin) {
    const resetUrl = `${origin}/resetpassword/${reset_token}`;
    message = `<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Reset Password</title>
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

<body
    style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; background-color: #F9FAFB; margin: 0;">
    <table class="body-wrap"
        style="font-family: 'Geist', sans-serif; box-sizing: border-box; width: 100%; background-color: #f6f6f6; margin: 0;"
        bgcolor="#f6f6f6">

        <tr style="font-family: 'Geist', sans-serif; box-sizing: border-box;  margin: 0;">
            <td style="font-family: 'Geist', sans-serif; box-sizing: border-box; vertical-align: top; margin: 0;"
                valign="top">

            </td>
            <td class="container" width="600"
                style="font-family: 'Geist', sans-serif; box-sizing: border-box;  display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;"
                valign="top">

                <div class="content"
                    style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;">
                    <table class="main" width="100%" cellpadding="0" cellspacing="0" itemprop="action"
                        style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;"
                        bgcolor="#fff">
                        <tr
                            style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                            <td class="content-wrap"
                                style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;"
                                valign="top">
                                <meta itemprop="name" content="Confirm Email"
                                    style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;" />
                                <table width="100%" cellpadding="0" cellspacing="0"
                                    style="font-family: 'Geist', sans-serif; box-sizing: border-box;  margin: 0;">
                                    <tr>
                                      <td align="center">
                                          <img style="margin-right: 15px; margin-top: 25px; margin-bottom: 25px; width: 200px; height: 200px;" src="cid:child"
                                              alt="zamagile">
                                      </td>
                                    </tr>

                                    <tr
                                        style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 18px; margin: 0; line-height: 28px;">
                                        <td class="content-block" style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; 
                                    line-height: 28px; padding: 0 0 20px;  color: #475467;" valign="top">
                                            <p style="margin-top: 25px; font-size: 18px;">
                                                Hi ${full_name}
                                            </p>
                                        </td>
                                    </tr>
                                    <tr
                                        style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 18px; margin: 0; line-height: 28px;">
                                        <td class="content-block" style="font-family:'Geist', sans-serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; 
                                  line-height: 28px; padding: 0 0 20px;  color: #475467;" valign="top">
                                            <p style="margin-top: 5px; font-size: 18px;">
                                                You recently asked to reset your password for your account. To reset
                                                your password, Please click the below link to reset your password, the link will be valid for 1 day:
                                            </p>
                                        </td>
                                    </tr>
                                    <tr
                                        style="font-family: 'Geist', sans-serif; box-sizing: border-box; margin: 0;">
                                        <td align="center">
                                            <a href=${resetUrl} class="btn-primary"
                                                style="background-color:#008235; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:6px; font-size:16px; display:inline-block;">Reset
                                                password</a>
                                        </td>

                                    </tr>
                                    <tr>
                                        <td style="color:#718096; font-size:14px; line-height:1.6;">
                                            <p>
                                                If the button above does not work, copy and paste this link into your
                                                browser:
                                            </p>
                                            <p style="word-break:break-all;">
                                                <a href="${reset_token}" style="color:#53ab97;">
                                                    ${reset_token}
                                                </a>
                                                <p />

                                            <p>
                                                If you were not expecting this invitation, you can safely ignore this
                                                email.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr
                                        style="font-family: 'Geist', sans-serif; box-sizing: border-box; margin: 0;">
                                        <td>
                                            <a href="https://www.x.com" style="text-decoration: none;">
                                                <img style="margin-right: 15px; margin-top: 30px;" src="cid:x" alt="X">
                                            </a>
                                            <a href="https://web.facebook.com" style="text-decoration: none;">
                                                <img style="margin-right: 15px; margin-top: 25px;" src="cid:facebook"
                                                    alt="Facebook">
                                            </a>
                                            <a href="https://www.instagram.com" style="text-decoration: none;">
                                                <img src="cid:insta" alt="Instagram">
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-top:30px; font-size:12px; color:#a0aec0;" align="center">
                                            © ${new Date().getFullYear()} ${appName}. All rights reserved.
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <div class="footer"
                        style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;">
                        <table width="100%"
                            style="font-family:'Geist', sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                            <tr
                                style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                                <td class="aligncenter content-block"
                                    style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; color: #999; text-align: center; margin: 0; padding: 0 0 20px;"
                                    align="center" valign="top">Contact us <a href="https://www.blueorbita.com/"
                                        style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 12px; color: #999; text-decoration: underline; margin: 0;"
                                        target="_blank">www.blueorbita.com</a>.
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </td>
            <td style="font-family: 'Geist', sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;"
                valign="top"></td>
        </tr>
    </table>
</body>

</html>`;
  } else {
    message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${reset_token}</code></p>`;
  }

  try {
    await sendEmail(
      {
        to: email,
        subject: 'Reset Password',
        html: message,
        from: "Admin <noreply@contact.blueorbita.com>",
        attachments: [
          {
            filename: "x.png",
            content: xImage,
            contentType: "image/png",
            contentId: "x"
          },
          {
            filename: "child.png",
            content: childImage,
            contentType: "image/png",
            contentId: "child"
          },
          {
            filename: "facebook.png",
            content: facebookImage,
            contentType: "image/png",
            contentId: "facebook"
          },
          {
            filename: "insta.png",
            content: instaImage,
            contentType: "image/png",
            contentId: "insta"

          },
        ],
      }
    )
  } catch (error) {

  }
}

export default sendPasswordResetEmail;