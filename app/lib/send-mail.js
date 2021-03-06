const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function send(to, mailOptions) {
  const defaultOptions = {
    from: 'admin@example.com',
    subject: 'Message From example.com',
  };

  if (!to) {
    throw new Error('To Address Should Not Be Empty');
  }

  const message = Object.assign({}, defaultOptions, mailOptions, { to });
  return sgMail.send(message);
}


module.exports = {
  send,
};
