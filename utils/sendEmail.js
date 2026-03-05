const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Vemoda" <${process.env.EMAIL_USER}>`,
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
    // throw new Error('Failed to send email');
  }
};
const sendEmailToAdmin = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Vemoda" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.message,
      html: generateAdminAlertTemplate(options)
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // throw new Error('Failed to send email');
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
            background-color: #2F5249;
            padding: 2rem;
            color: #1f2937;
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
            background-color: #4f46e5;
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
            color: #2F5249;
          }
          .code {
            font-size: 2rem;
            font-weight: 700;
            letter-spacing: 0.2em;
            color: #4f46e5;
            background-color: #eef2ff;
            padding: 1rem;
            text-align: center;
            border-radius: 0.5rem;
            margin: 1.5rem 0;
          }
          .button {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
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
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Vemoda</div>
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
          <div class="footer">&copy; ${new Date().getFullYear()} Vemoda. All rights reserved.</div>
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
            background-color: #f3f4f6;
            padding: 2rem;
            color: #374151;
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
            background-color: #dc2626;
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
            color: #1f2937;
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
            color: #dc2626;
            font-weight: 600;
          }
          .stock-warning {
            color: #d97706;
            font-weight: 600;
          }
          .action-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
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
            color: #6b7280;
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



