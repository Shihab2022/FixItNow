export const ConfirmAccountTemplate = (
  name: string,
  url: string,
  baseUrl: string,
) => `
<!doctype html>
<html lang="en-US">

<head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
  <title>Confirm Your FixItNow Account</title>
  <meta name="description" content="Confirm Account">
  <style type="text/css">
    a:hover { opacity: 0.9 !important; text-decoration: none !important; }
    .button-container { margin: 30px 0; text-align: center; }
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0"
  style="margin: 0px; background-color: #f8fafc;" leftmargin="0">
  <!--100% body table-->
  <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f8fafc"
    style="@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <tr>
      <td>
        <table style="background-color: #f8fafc; max-width:600px; margin:0 auto;" width="100%" border="0"
          align="center" cellpadding="0" cellspacing="0">
          <tr><td style="height:40px;">&nbsp;</td></tr>
          <!-- Brand Logo Header -->
          <tr>
            <td style="text-align:center;">
              <a href="${baseUrl}" title="FixItNow" target="_blank" style="text-decoration: none;">
                <span style="font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                  FixIt<span style="color: #2563eb;">Now</span>
                </span>
              </a>
            </td>
          </tr>
          <tr><td style="height:24px;">&nbsp;</td></tr>
          <tr>
            <td>
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                style="max-width:600px; background:#ffffff; border-radius:12px; text-align:left;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 40px 36px;">
                    <h1 style="color:#0f172a; font-weight:700; margin:0; font-size:24px; text-align:center;">
                      Confirm your account
                    </h1>
                    
                    <div style="text-align: center; margin: 20px 0 28px;">
                      <span style="display:inline-block; border-bottom:2px solid #2563eb; width:60px;"></span>
                    </div>

                    <p style="color:#334155; font-size:15px; line-height:24px; margin:0 0 16px;">
                      Hello <strong>${name}</strong>,
                    </p>
                    
                    <p style="color:#334155; font-size:15px; line-height:24px; margin:0 0 24px;">
                      Welcome to <strong>FixItNow</strong>! Thank you for signing up. Please confirm your account to activate your profile and start scheduling services.
                    </p>

                    <!-- CTA Button -->
                    <div class="button-container" style="text-align: center; margin: 32px 0;">
                      <a href="${url}" class="button"
                        style="
                          background-color:#2563eb;
                          border-radius:8px;
                          color:#ffffff !important;
                          display:inline-block;
                          font-family:'Inter', sans-serif;
                          font-size:14px;
                          font-weight:600;
                          text-align:center;
                          text-decoration:none;
                          padding:14px 32px;
                          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
                        ">
                        Confirm Account
                      </a>
                    </div>

                    <p style="color:#64748b; font-size:13px; line-height:20px; margin:0 0 24px; padding-top: 12px; border-top: 1px solid #f1f5f9;">
                      If you did not initiate this request, you can safely ignore this email or contact support at <a href="mailto:support@fixitnow.com" style="color:#2563eb; text-decoration:none;">support@fixitnow.com</a>.
                    </p>

                    <p style="color:#334155; font-size:14px; line-height:22px; margin:0;">
                      Best regards,<br/> 
                      <strong>The FixItNow Team</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 24px 0; color: #94a3b8; font-size: 12px;">
              &copy; ${new Date().getFullYear()} FixItNow. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <!--/100% body table-->
</body>
</html>`;
