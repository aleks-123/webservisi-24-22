//! npm i form-data
//! npm i mailgun.js

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: '0c2e0141fd1e3c6066f1ac0cfccff8ce-f6fe91d3-a8521a16',
});

const sendMailgun = async (options) => {
  const emailData = {
    from: 'Mailgun Sandbox <postmaster@sandbox43c588f5abfa4eb7a9cbc957f503cbb3.mailgun.org>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await mg.messages.create('sandbox43c588f5abfa4eb7a9cbc957f503cbb3.mailgun.org', emailData);
};

module.exports = sendMailgun;
