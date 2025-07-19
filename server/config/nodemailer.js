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
    console.log("Sending email to:", booking.user.email);
    console.log("Subject:", subject);
    console.log("Body preview:", body.slice(0, 100));
    return info;
}

export default sendEmail;