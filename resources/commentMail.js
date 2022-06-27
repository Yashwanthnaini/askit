const nodemailer = require("nodemailer");

module.exports = async function(email,token,name,type,nametwo) {
    // Create the SMTP transport.
    let transporter = nodemailer.createTransport({
      host: "smtp-relay.sendinblue.com",
      port: 587,
      auth: {
        user: "b171561@rgukt.ac.in",
        pass: "DRZwGEPUxBAVO4Km",
      },
    });
    const senderAddress = "nainiyashwanth@gmail.com";
    var toAddress = email;
    var subject = "Comment Received";
      var body_html = `
      <!DOCTYPE> 
      <html>
        <body>
          <p> Hi , ${name} some one named ${nametwo} commented on your ${type} : </p> <b><a herf="https://askito.herokuapp.com/questions/get/${token}">click here</a></b>
        </body>
      </html>`;

    // Specify the fields in the email.
    let mailOptions = {
      from: senderAddress,
      to: toAddress,
      subject: subject,
      html: body_html,
    };
    await transporter.sendMail(mailOptions);
    return;
}

