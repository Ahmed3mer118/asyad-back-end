const nodemailer = require("nodemailer");

// ASYAD brand palette (deep green + gold)
const BRAND_PRIMARY = "#1F4B43";
const BRAND_PRIMARY_SOFT = "#E8F1EF";
const BRAND_ACCENT = "#C8A45D";
const BRAND_TEXT = "#1D2B28";
const BRAND_MUTED = "#6B7D78";

const parseBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
};

const normalizeEmailPassword = (value = "") =>
  // Gmail app passwords are often copied with spaces.
  String(value).replace(/\s+/g, "");

const createTransporter = () => {
  if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email service env vars are missing (EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS)");
  }

  // In local/dev environments behind proxy/corporate certificates,
  // SMTP may fail unless certificate verification is relaxed.
  const rejectUnauthorized = parseBoolean(
    process.env.EMAIL_TLS_REJECT_UNAUTHORIZED,
    process.env.NODE_ENV === "production"
  );

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: normalizeEmailPassword(process.env.EMAIL_PASS)
    },
    tls: {
      rejectUnauthorized
    }
  });
};

const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"ASYAD" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.message,
      html: generateEmailTemplate(options)
    };
    console.log("Mail Options: ", mailOptions);
    console.log("Transporter: ", transporter);
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
const sendEmailToAdmin = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"ASYAD" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.message,
      html: generateAdminAlertTemplate(options)
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const extractCode = (text) => {
  const match = text.match(/\d{4,6}/);
  return match ? match[0] : '';
};

const generateEmailTemplate = (options) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${options.subject}</title>
        <style>
          body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
            background-color: ${BRAND_PRIMARY};
            padding: 2rem;
            color: ${BRAND_TEXT};
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
          }
          .header {
            background-color: ${BRAND_PRIMARY};
            color: white;
            text-align: center;
            padding: 1.5rem;
            font-size: 1.5rem;
            font-weight: 700;
          }
          .content {
            padding: 2rem;
          }
          .content h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 1rem;
          }
          .content p {
            margin-bottom: 1rem;
            font-size: 1rem;
            color: ${BRAND_TEXT};
          }
          .code {
            font-size: 2rem;
            font-weight: 700;
            letter-spacing: 0.2em;
            color: ${BRAND_PRIMARY};
            background-color: ${BRAND_PRIMARY_SOFT};
            border: 1px dashed ${BRAND_ACCENT};
            padding: 1rem;
            text-align: center;
            border-radius: 0.5rem;
            margin: 1.5rem 0;
          }
          .button {
            display: inline-block;
            background-color: ${BRAND_ACCENT};
            color: ${BRAND_TEXT};
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            border-radius: 0.5rem;
            font-weight: 600;
            text-align: center;
            margin-top: 1rem;
          }
          .footer {
            text-align: center;
            padding: 1.5rem;
            font-size: 0.875rem;
            color: ${BRAND_MUTED};
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">ASYAD</div>
          <div class="content">
            <h2>${options.subject}</h2>
            <p>Hello ${options.to || 'User'},</p>
            ${options.message.includes('verification code') || options.message.match(/\d{4,6}/)
      ? `<p>Use the verification code below:</p>
                   <div class="code">${extractCode(options.message)}</div>
                   <p>This code will expire in 10 minutes.</p>`
      : `<p>${options.message}</p>`
    }
            ${options.buttonText && options.buttonUrl
      ? `<div style="text-align:center;">
                    <a href="${options.buttonUrl}" class="button">${options.buttonText}</a>
                   </div>`
      : ''
    }
          </div>
          <div class="footer">&copy; ${new Date().getFullYear()} ASYAD. All rights reserved.</div>
        </div>
      </body>
    </html>
    `;
};
const generateAdminAlertTemplate = (options) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${options.subject}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: ${BRAND_PRIMARY_SOFT};
            padding: 2rem;
            color: ${BRAND_TEXT};
          }
          .container {
            max-width: 650px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: ${BRAND_PRIMARY};
            color: white;
            padding: 1.5rem;
            text-align: center;
          }
          .header h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0;
          }
          .alert-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
          .content {
            padding: 2rem;
          }
          .content h2 {
            color: ${BRAND_TEXT};
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
            font-weight: 600;
          }
          .product-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
          }
          .product-table th {
            background-color: #f9fafb;
            text-align: left;
            padding: 0.75rem;
            font-weight: 600;
            color: #4b5563;
            border-bottom: 1px solid #e5e7eb;
          }
          .product-table td {
            padding: 0.75rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .product-table tr:last-child td {
            border-bottom: none;
          }
          .stock-critical {
            color: #B42318;
            font-weight: 600;
          }
          .stock-warning {
            color: ${BRAND_ACCENT};
            font-weight: 600;
          }
          .action-button {
            display: inline-block;
            background-color: ${BRAND_ACCENT};
            color: ${BRAND_TEXT};
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            border-radius: 0.375rem;
            font-weight: 500;
            margin-top: 1.5rem;
          }
          .footer {
            text-align: center;
            padding: 1.5rem;
            font-size: 0.875rem;
            color: ${BRAND_MUTED};
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="alert-icon">⚠️</div>
            <h1>${options.subject}</h1>
          </div>
          <div class="content">
            <h2>Inventory Alert Notification</h2>
            <p>Dear Admin,</p>
            <p>The following products are running low on stock and require your attention:</p>
            
            <table class="product-table">
              <thead>
                <tr>
                  <th>Product</th>

                  <th>Current Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${options.products?.map(product => `
                  <tr>
                    <td>${product.product_title}</td>

                    <td>${product.stock} units</td>
                    <td class="${product.stock <= 3 ? 'stock-critical' : 'stock-warning'}">
                      ${product.stock <= 3 ? 'CRITICAL' : 'LOW STOCK'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <p style="margin-top: 1.5rem;">Please take necessary action to replenish inventory.</p>
            
            ${options.dashboardUrl ? `
              <div style="text-align: center;">
                <a href="${options.dashboardUrl}" class="action-button">View Inventory Dashboard</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${options.companyName || 'Your Company'}. All rights reserved.</p>
            <p>This is an automated notification - please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
module.exports = { sendEmail, sendEmailToAdmin };



