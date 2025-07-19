import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async ({ to, subject, body }) => {
    const info = await transporter.sendMail({
        from: "myapp@example.com",
        to,
        subject,
        html: body,
    })
    console.log(info.from)
    console.log(info.to)
    console.log(info.subject)
    console.log(info.html)
    return info;
}

export default sendEmail;