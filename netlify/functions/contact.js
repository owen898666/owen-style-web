// netlify/functions/contact.js
// Serverless function: receives form data, sends email via Gmail SMTP

const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, email, phone, service, date, where, message } = body;

  // Validation
  if (!name || !email || !service || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields: name, email, service, message' })
    };
  }

  // Email regex check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email address' }) };
  }

  // Gmail transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'owen898666@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  const serviceMap = {
    '婚禮紀錄': '婚禮紀錄',
    '結婚登記': '結婚登記',
    '孕寫真': '孕寫真',
    '家庭寫真': '家庭寫真',
    '抓週紀錄': '抓週紀錄',
    '其他': '其他'
  };

  const mailOptions = {
    from: '"Owen Style 官網表單" <owen898666@gmail.com>',
    to: 'owen898666@gmail.com',
    replyTo: email,
    subject: `【預約諮詢】${serviceMap[service] || service} — ${name}`,
    html: `
      <div style="font-family: 'Noto Sans TC', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8ddd4; border-radius: 8px; overflow: hidden;">
        <div style="background: #2c2420; color: #fff; padding: 24px 32px;">
          <h2 style="margin: 0; font-size: 1.4rem; letter-spacing: 2px;">✦ Owen Style 預約諮詢</h2>
          <p style="margin: 8px 0 0; opacity: 0.7; font-size: 0.9rem;">婚禮紀錄 · 孕寫真 · 家庭寫真 · 抓週</p>
        </div>
        <div style="padding: 28px 32px; background: #faf7f4;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
            <tr style="border-bottom: 1px solid #e8ddd4;">
              <td style="padding: 10px 0; color: #8a7060; width: 110px;">姓名</td>
              <td style="padding: 10px 0; font-weight: 600; color: #2c2420;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e8ddd4;">
              <td style="padding: 10px 0; color: #8a7060;">Email</td>
              <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #b8965a;">${email}</a></td>
            </tr>
            ${phone ? `<tr style="border-bottom: 1px solid #e8ddd4;">
              <td style="padding: 10px 0; color: #8a7060;">聯絡電話</td>
              <td style="padding: 10px 0;">${phone}</td>
            </tr>` : ''}
            <tr style="border-bottom: 1px solid #e8ddd4;">
              <td style="padding: 10px 0; color: #8a7060;">服務項目</td>
              <td style="padding: 10px 0; color: #b8965a; font-weight: 600;">${serviceMap[service] || service}</td>
            </tr>
            ${date ? `<tr style="border-bottom: 1px solid #e8ddd4;">
              <td style="padding: 10px 0; color: #8a7060;">預計拍攝日期</td>
              <td style="padding: 10px 0;">${date}</td>
            </tr>` : ''}
            ${where ? `<tr style="border-bottom: 1px solid #e8ddd4;">
              <td style="padding: 10px 0; color: #8a7060;">拍攝地點</td>
              <td style="padding: 10px 0;">${where}</td>
            </tr>` : ''}
          </table>
          <div style="margin-top: 20px;">
            <p style="color: #8a7060; font-size: 0.85rem; margin-bottom: 8px;">訊息內容</p>
            <div style="background: #fff; border: 1px solid #e8ddd4; border-radius: 6px; padding: 16px; color: #2c2420; white-space: pre-wrap; line-height: 1.7;">${message}</div>
          </div>
          <p style="margin-top: 24px; font-size: 0.8rem; color: #b0a098;">
            此信件由 owen-style.tw 官網表單自動發送<br>
            來自 IP：${event.headers['x-forwarded-for'] || 'unknown'}
          </p>
        </div>
      </div>
    `,
    text: `
【Owen Style 預約諮詢】

姓名：${name}
Email：${email}
${phone ? '電話：' + phone : ''}
服務項目：${serviceMap[service] || service}
${date ? '預計拍攝日期：' + date : ''}
${where ? '拍攝地點：' + where : ''}

訊息：
${message}
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: '已收到你的訊息，我會儘快回覆！' })
    };
  } catch (error) {
    console.error('Email error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: '寄信失敗，請直接加 LINE: @owen722 聯絡我', details: error.message })
    };
  }
};
