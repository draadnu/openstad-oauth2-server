const nunjucks          = require('nunjucks');
const path              = require('path');
const nodemailer        = require('nodemailer');
const Promise           = require("bluebird");
const dateFilter        = require('../nunjucks/dateFilter');
const currencyFilter    = require('../nunjucks/currency');
const limitTo           = require('../nunjucks/limitTo');
const jsonFilter        = require('../nunjucks/json');
const timestampFilter   = require('../nunjucks/timestamp');

exports.send = function ({subject, toName, toEmail, templateString, template, variables, fromEmail, fromName, replyTo}) {

  // Set current date in readable format
  var currDate = new Date();
  currDate.setHours(currDate.getHours() + 1);
  var dateString = ('0' + currDate.getUTCDate()).slice(-2) + '/' + ('0' + (currDate.getUTCMonth() + 1)).slice(-2) + '/' + currDate.getUTCFullYear() + ' ' + ('0' + currDate.getUTCHours()).slice(-2) + ':' + ('0' + currDate.getUTCMinutes()).slice(-2);
  
  /**
   * Enrich variables with URLS in order to make absolute urls in E-mails
   */
  variables = Object.assign(variables, {
    emailAssetsUrl: process.env.EMAIL_ASSETS_URL,
    appUrl: process.env.APP_URL,
    emailLogoFile: process.env.EMAIL_LOGO_FILE,
    emailLogoWidth: process.env.EMAIL_LOGO_WIDTH,
    emailLogoHeight: process.env.EMAIL_LOGO_HEIGHT,
    showMailHeader: process.env.SHOW_MAIL_HEADER,
    contentType: process.env.CONTENT_TYPE,
    dateString: dateString,
    siteTitle: process.env.SITE_TITLE
  });

  /**
   * Initiatilize Nunjucks to render E-mail template
   */
  const nunjucksEnv = nunjucks.configure(path.resolve(__dirname,'../views'), {
    autoescape: true,
  });

  nunjucksEnv.addFilter('date', dateFilter);

  /**
   * Render email template
   */
  const mail = !!templateString ? nunjucks.renderString(templateString, variables) : nunjucks.render(template, variables);

  /**
    * Format the to name
    */
  const to = !!toName ? `${toName}<${toEmail}>` : toEmail;

  /**
   * If from name & e-mail not specified fallback to default in .env
   */
  fromEmail = fromEmail ? fromEmail : process.env.FROM_EMAIL;
  fromName = fromName ? fromName : process.env.FROM_NAME;

  /**
   * Format Message object
   */
  const message = {
    from: `${fromName}<${fromEmail}>`,// sender@server.com',
    to: to,
    subject: subject,
    html: mail,
  };

  if (replyTo) {
    message.replyTo = replyTo;
  }

  /**
   * Create instance of SMTP transporter
   */
  const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SERVER_URL,
      port: process.env.MAIL_SERVER_PORT,
      secure: process.env.MAIL_SERVER_SECURE, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_SERVER_USER_NAME, // generated ethereal user
        pass: process.env.MAIL_SERVER_PASSWORD // generated ethereal password
      }
  });

  return new Promise(function(resolve, reject) {
    // send mail with defined transport object
    transporter.sendMail(message, (error, info) => {
        if (error) {
          return reject(error);
        } else {
          console.log('Message sent: %s', info.messageId);
          // Preview only available when sending through an Ethereal account
        //  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          resolve();
        }

    })
  });
}
