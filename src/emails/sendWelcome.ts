import sendEmail from "./send-email";
import { child, x, facebook, insta } from "./images";
interface abc {
  email: string;
  course: string;
  first_name: string;
}
const sendWelcome = async (account: abc) => {
  const childImage = child.replace('data:image/png;base64,', '')
  const facebookImage = facebook.replace('data:image/png;base64,', '')
  const xImage = x.replace('data:image/png;base64,', '')
  const instaImage = insta.replace('data:image/png;base64,', '')

  const message = `<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<head>
  <meta name="viewport" content="width=device-width" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Reset Password</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet">
  <style type="text/css">
    html,
    body,
    div,
    span,
    applet,
    object,
    iframe,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p,
    blockquote,
    pre,
    a,
    abbr,
    acronym,
    address,
    big,
    cite,
    code,
    del,
    dfn,
    em,
    img,
    ins,
    kbd,
    q,
    s,
    samp,
    small,
    strike,
    sub,
    sup,
    tt,
    var,
    b,
    u,
    i,
    center,
    dl,
    dt,
    dd,
    ol,
    ul,
    li,
    fieldset,
    form,
    label,
    legend,
    table,
    caption,
    tbody,
    tfoot,
    thead,
    tr,
    th,
    td,
    article,
    aside,
    canvas,
    details,
    embed,
    figure,
    figcaption,
    footer,
    header,
    hgroup,
    menu,
    nav,
    output,
    ruby,
    section,
    summary,
    time,
    mark,
    audio,
    video {
      margin: 0;
      padding: 0;
      border: 0;
      font: inherit;
      vertical-align: baseline;
      box-sizing: border-box;
    }

    img {
      max-width: 100%;
    }

    body {
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: none;
      width: 100% !important;
      height: 100%;
    }

    body {
      background-color: #f6f6f6;
    }

    @media only screen and (max-width: 640px) {
      body {
        padding: 0 !important;
      }

      h1 {
        font-weight: 800 !important;
      }

      h2 {
        font-weight: 700 !important;
      }

      h3 {
        font-weight: 800 !important;
        margin: 20px 0 5px !important;
      }

      h4 {
        font-weight: 800 !important;
        margin: 20px 0 5px !important;
      }

      h1 {
        font-size: 36px !important;
      }

      h2 {
        font-size: 18px !important;
      }

      h3 {
        font-size: 16px !important;
      }

      .container {
        padding: 0 !important;
        width: 100% !important;
      }

      .content {
        padding: 0 !important;
      }

      .content-wrap {
        padding: 10px !important;
      }

      .invoice {
        width: 100% !important;
      }
    }
  </style>
</head>

<body
  style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; background-color: #F9FAFB; margin: 0;">
  <table class="body-wrap"
    style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; width: 100%; background-color: #f6f6f6; margin: 0;"
    bgcolor="#f6f6f6">

    <tr style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box;  margin: 0;">
      <td
        style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; vertical-align: top; margin: 0;"
        valign="top">

      </td>
      <td class="container" width="600"
        style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box;  display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;"
        valign="top">

        <div class="content"
          style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;">
          <table class="main" width="100%" cellpadding="0" cellspacing="0" itemprop="action"
            style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;"
            bgcolor="#fff">
            <tr
              style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
              <td class="content-wrap"
                style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;"
                valign="top">
                <meta itemprop="name" content="Confirm Email"
                  style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;" />
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box;  margin: 0;">
                  <tr>
                    <td>
                      <img style="margin-right: 15px; margin-top: 25px; margin-bottom: 25px; width: 200px"
                        src="cid:child" alt="child">
                    </td>
                  </tr>

                  <tr
                    style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 18px; margin: 0; line-height: 28px;">
                    <td class="content-block" style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; 
                                    line-height: 28px; color: #475467;" valign="top">
                      <p style="margin-top: 25px; font-size: 18px;">
                        Hi ${account.first_name}
                      </p>
                    </td>
                  </tr>
                  <tr
                    style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 18px; margin: 0; line-height: 28px;">
                    <td class="content-block" style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; 
                                  line-height: 28px;  color: #475467;" valign="top">
                      <p style="margin-top: 25px; font-size: 18px;">
                        Welcome to Tech Child! Your child’s tech journey starts now.
                      </p>
                    </td>
                  </tr>
                  <tr
                    style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 18px; margin: 0; line-height: 28px;">
                    <td class="content-block" style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; 
                                  line-height: 28px; padding: 0 0 20px;  color: #475467;" valign="top">
                      <p style="margin-top: 5px; font-size: 18px;">

                      </p>
                    </td>
                  </tr>
                  <tr
                    style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 18px; margin: 0; line-height: 28px;">
                    <td class="content-block" style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; 
                                line-height: 28px; padding: 0 0 20px;  color: #475467;" valign="top">
                      <p style="margin-top: 5px; font-size: 18px;">

                        You’ve successfully signed up and enrolled in  ${account.course}. Here’s what’s next:
                        <br>
                        ✅ Log in to access your dashboard.
                        <br>
                        ✅ Find your class link – it’s ready on your dashboard.
                        <br>
                        ✅ Set up your child’s profile for a personalized experience.
                        <br>
                        ✅ Start learning – fun, interactive lessons await!
                      </p>
                    </td>
                  </tr>
                  <tr
                    style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; margin: 0;">
                    <td>
                      <a href="https://www.mytechchild.com//login" class="btn-primary"
                        style="box-sizing: border-box; font-size: 16px; color: #FFF; text-decoration: none; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 8px; background-color: #FF5E00; margin-top: 15px; border-color: #FF5E00; border-style: solid; border-width: 10px 20px;">Go
                        to Dashboard</a>
                    </td>
                  <tr
                    style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 18px; margin: 0; line-height: 28px;">
                    <td class="content-block" style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; 
                                    line-height: 28px;  color: #475467;" valign="top">
                      <p style="margin-top: 25px; font-size: 18px;">
                        Need help? Email us at <a href="#" style="color: #FF5E00;">hello@mytechchild.com.</a>
                        <br>
                        <br>
                        Excited to have you on board!
                      </p>
                    </td>
                  </tr>
                  <tr
                    style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 18px; margin: 0; line-height: 28px;">
                    <td class="content-block" style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; 
                                  line-height: 28px; padding: 20px 0 0;  color: #475467;" valign="top">
                      <p style="font-size: 18px;">
                        Cheers
                        <br>
                        Lisa
                        <br>
                        Growth Manager
                        <br>
                        Tech Child
                      </p>
                    </td>
                  </tr>
            </tr>
            <tr style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; margin: 0;">
              <td>
                <p style="color: #475467; font-size: 14px; margin-top: 25px;">
                  This email was sent to <a href="#">${account.email}</a>. If you'd
                  rather not receive this kind of email, you can <a href="#">unsubscribe</a>

                </p>
              </td>
            </tr>
            <tr style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; margin: 0;">
              <td>
                <p style="color: #475467; font-size: 14px; margin-top: 10px;">
                  © 2355, 1007 N Orange St. 4th Floor , Wilmington, DE, New Castle, US,
                  19801
                </p>
              </td>
            </tr>
            <tr style="font-family: 'Space Grotesk',Helvetica,Arial,sans-serif; box-sizing: border-box; margin: 0;">
              <td>
                <a href="https://www.x.com/mytechchild" style="text-decoration: none;">
                  <img style="margin-right: 15px; margin-top: 30px;" src="cid:x" alt="X">
                </a>
                <a href="https://web.facebook.com/mytechchild" style="text-decoration: none;">
                  <img style="margin-right: 15px; margin-top: 25px;" src="cid:facebook" alt="Facebook">
                </a>
                <a href="https://www.instagram.com/mytechchild" style="text-decoration: none;">
                  <img src="cid:insta" alt="Instagram">
                </a>
              </td>
            </tr>
          </table>
      </td>
    </tr>
  </table>

  <div class="footer"
    style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;">
    <table width="100%"
      style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
      <tr
        style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
        <td class="aligncenter content-block"
          style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; color: #999; text-align: center; margin: 0; padding: 0 0 20px;"
          align="center" valign="top">Contact us <a href="https://www.mytechchild.com/"
            style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; color: #999; text-decoration: underline; margin: 0;"
            target="_blank">www.mytechchild.com</a>.
        </td>
      </tr>
    </table>
  </div>
  </div>
  </td>
  <td
    style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;"
    valign="top"></td>
  </tr>
  </table>
</body>

</html>`;

  try {
    await sendEmail(
      {
        to: account.email,
        subject: 'Welcome to Tech Child',
        html: message,
        from: "hello@mytechchild.com",
        attachments: [
          {
            filename: "x.png",
            content: xImage,
            contentType: "image/png",
            contentId: "x",
            // disposition: "inline",
          },
          {
            filename: "child.jpeg",
            content: childImage,
            contentType: "image/jpeg",
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

  }
}

export default sendWelcome;