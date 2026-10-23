
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (char) => {
        const entities: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };
        return entities[char];
    });
}

export async function sendWelcomeEmail(data: {
    email: string;
    name: string;
    username: string;
    password: string;
    role: string;
}) {
    const appUrl = process.env.APP_URL;

    if (!appUrl || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('Email configuration is missing.');
    }

    const name = escapeHtml(data.name);
    const username = escapeHtml(data.username);
    const role = escapeHtml(data.role.toUpperCase());
    const loginUrl = escapeHtml(appUrl);

    await transporter.sendMail({
        from: `"FNF Online" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: 'Your FNF Online Account Has Been Created',
        text: `
Hello ${data.name},

Your FNF Online account has been created successfully.

Website: ${appUrl}
Username: ${data.username}
Password: ${data.password}
Role: ${data.role.toUpperCase()}

Please log in and change your password as soon as possible.

FNF Online Support Team
    `,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#1f2937">
        <h2 style="color:#0d9488">Welcome to FNF Online</h2>
        <p>Hello ${name},</p>
        <p>Your account has been created successfully.</p>
        <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:20px">
          <p><strong>Website:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Password:</strong> ${escapeHtml(data.password)}</p>
          <p><strong>Role:</strong> ${role}</p>
        </div>
        <p style="margin-top:20px">
          <a href="${loginUrl}" style="display:inline-block;background:#0d9488;color:white;padding:12px 20px;text-decoration:none;border-radius:8px">
            Login to Your Account
          </a>
        </p>
        <p style="font-size:13px;color:#64748b">
          For security, change your password after your first login.
        </p>
        <p>Regards,<br>FNF Online Dev Team</p>
      </div>
    `,
    });
}
