const nodemailer = require("nodemailer");

module.exports = async function(email,token,type) {
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
    if(type === "verify"){
      var subject = "Verify your email";
      var body_html = `<!DOCTYPE> 
      <html>
        <body>
          <p>
            for verification click
            <a href="http://localhost:3000/api/users/verify/${token}">here</a>
          </p> 
        </body>
      </html>`;
    }
    else{
      var subject = "Reset your password";
      var body_html = `<!DOCTYPE> 
      <html>
        <body>
          <p>
            Hi,${email}
            for password reset click
            <a href="http://localhost:3000/api/users/reset/${token}">here</a>
            <br />expires in 10 minutes
          </p> 
        </body>
      </html>`;
    }

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

