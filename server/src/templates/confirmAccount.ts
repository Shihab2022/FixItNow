export const ConfirmAccountTemplate = (
  name: string,
  url: string,
  baseUrl: string,
) => `
<!doctype html>
<html lang="en-US">

<head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
  <title>Confirm Account</title>
  <meta name="description" content="Confirm Account">
  <style type="text/css">
    a:hover { text-decoration: underline !important; }
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0"
  style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
  <!--100% body table-->
  <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
    style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700);
      font-family: 'Open Sans', sans-serif;">
    <tr>
      <td>
        <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0"
          align="center" cellpadding="0" cellspacing="0">
          <tr><td style="height:80px;">&nbsp;</td></tr>
          <tr>
            <td style="text-align:center;">
               <a href=${baseUrl} title="logo" target="_blank">
                            <img style="width: 100px; height: auto;" src="cid:logoImage" title="logo" alt="logo">
                          </a>
            </td>
          </tr>
          <tr><td style="height:20px;">&nbsp;</td></tr>
          <tr>
            <td>
              <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;
                  box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                <tr><td style="height:40px;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:0 35px;">
                    <h1 style="color:#1e1e2d;font-weight:500;margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
                      Confirm your Account
                    </h1>
                    <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px;
                      border-bottom:1px solid #cecece; width:100px;"></span>
                    <p align="left" style="color:#455056;font-size:15px;line-height:24px;margin:0;">
                      Hello ${name},<br/>
                      Please confirm your Chatty account. Please click on the confirm button and then login to app.
                    </p>
                                                    <a href="${url}" class="button"
  style="
    background-color:#20e277;
    border-radius:50px;
    color:#ffffff !important;
    display:inline-block;
    font-family:Arial, sans-serif;
    font-size:14px;
    font-weight:600;
    text-align:center;
    text-decoration:none;
    text-transform:uppercase;
    padding:12px 30px;
    border:1px solid #20e277;
  ">
Confirm Account
</a>
                    <p align="left" style="color:#455056;font-size:15px;line-height:24px;margin:0;">
                      If you did not initiate this request, please contact us immediately at support@fixitnow.com
                      <br/><br/><br/>
                    </p>
                    <p align="left" style="color:#455056;font-size:15px;line-height:24px;margin:0;">
                      Thank you, <br/> The FixItNow Team
                    </p>
                  </td>
                </tr>
                <tr><td style="height:40px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:20px;">&nbsp;</td></tr>
          <tr><td style="height:80px;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
  <!--/100% body table-->
</body>
</html>`;
