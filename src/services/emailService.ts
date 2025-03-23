import nodemailer from "nodemailer";

const sendMail = async (
  to: string,
  url: string,
  shortUrl: string,
  text: string,
): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: to,
      subject: "Thanh toán vé xem hoà nhạc",
      html: `
                <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
                    <h2 style="text-align: center; text-transform: uppercase;color: teal;">Đặt vé xem hoà nhạc</h2>
                    <p>Xin cảm ơn bạn đã đặt vé xem buổi hoà nhạc.</p>
                    
                    <p>Vui lòng click nút thanh toán bên dưới để hoàn tất quá trình mua vé.</p>
                    
                    <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${text}</a>
                
                    <p>Nếu nút này không hoạt động vì bất kỳ lý do gì, bạn cũng có thể nhấp vào liên kết bên dưới:</p>
                
                    <div>Link 1: ${url}</div>
                    <div>Link 2: ${shortUrl}</div>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default sendMail;
