import nodemailer from "nodemailer";
import sequelize from "sequelize";
import database from "../../database";
import Setting from "../../models/Setting";
import { config } from "dotenv";
config();
interface UserData {
  companyId: number;
}
const SendMail = async (email: string, tokenSenha: string) => {
  const { hasResult, data } = await filterEmail(email);
  if (!hasResult) {
    return { status: 404, message: "Email não encontrado" };
  }
  const userData = data[0][0] as UserData;
  if (!userData || userData.companyId === undefined) {
    return { status: 404, message: "Dados do usuário não encontrados" };
  }
  const companyId = userData.companyId;
  const urlSmtp = process.env.MAIL_HOST;
  const userSmtp = process.env.MAIL_USER;
  const passwordSmpt = process.env.MAIL_PASS;
  const fromEmail = process.env.MAIL_FROM;
  const transporter = nodemailer.createTransport({
    host: urlSmtp,
    port: Number(process.env.MAIL_PORT),
    secure: true,
    auth: { user: userSmtp, pass: passwordSmpt }
  });
  if (hasResult === true) {
    const { hasResults, datas } = await insertToken(email, tokenSenha);
    async function sendEmail() {
      try {
        const mailOptions = {
          from: fromEmail,
          to: email,
          subject: "Redefinição de Senha - Chat GF DIALOGO",
          html: `
          <!DOCTYPE html>
<html lang="pt" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no">
  <title>CHAT GF DIALOGO</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;400i;700;700i&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Roboto', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #F8F9FD;
      width: 100%;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table {
      border-collapse: collapse;
    }

    .container {
      width: 100%;
      height: 100%;
      background-color: #F8F9FD;
    }

    .header, .footer {
      width: 100%;
      background-color: transparent;
      padding: 20px 0;
    }

    .content {
      background-color: transparent;
      width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    h1, p {
      margin: 0;
      padding: 0;
    }

    h1 {
      font-size: 30px;
      font-weight: bold;
      color: #212121;
      line-height: 36px;
    }

    p {
      font-size: 16px;
      color: #131313;
      line-height: 24px;
    }

    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #0b317e;
      color: #fff;
      text-decoration: none;
      font-size: 16px;
      border-radius: 5px;
    }

    .footer {
      background-color: #071f4f;
      color: white;
      text-align: center;
      padding: 40px 20px;
    }

    @media only screen and (max-width: 600px) {
      .content {
        width: 100% !important;
        padding: 10px !important;
      }

      h1 {
        font-size: 24px !important;
        text-align: center !important;
      }

      p {
        font-size: 14px !important;
        text-align: center !important;
      }

      .footer {
        padding: 20px !important;
      }

      .footer p {
        font-size: 14px !important;
      }
    }
  </style>
</head>
<body>

  <div class="container">
    <!-- Header Section -->
    <table class="header" role="none">
      <tr>
        <td align="center">
          <img src="https://i.ibb.co/FDP649b/banneremail.png" alt="Chat GF DIALOGO" width="205">
        </td>
      </tr>
    </table>

    <!-- Content Section -->
    <table class="content" role="none">
      <tr>
        <td>
          <h1>Bem-vindo à Chat GF DIALOGO</h1>
          <p>Você solicitou a recuperação de senha do Whaticket!</p>

          <h2 style="color:#0b317e;">Código de Verificação:</h2>
          <p style="font-size: 20px; font-weight: bold; color: #0b317e;">${tokenSenha}</p>
          <p> </p>

          <p>Se você não solicitou a recuperação de senha, por favor ignore esta mensagem.</p>
          
          <p>Está com dúvidas? <a href="mailto:suporte@gfdialogo.com" class="button">Entre em contato</a></p>
        </td>
      </tr>
    </table>

    <!-- Footer Section -->
    <table class="footer" role="none">
      <tr>
        <td>
          <p>GF DIALOGO - Todos os direitos reservados.</p>
        </td>
      </tr>
    </table>
  </div>

</body>
</html>

          `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("E-mail enviado: " + info.response);
      } catch (error) {
        console.log(error);
      }
    }
    sendEmail();
  }
};
const filterEmail = async (email: string) => {
  const sql = `SELECT * FROM "Users"  WHERE email ='${email}'`;
  const result = await database.query(sql, {
    type: sequelize.QueryTypes.SELECT
  });
  return { hasResult: result.length > 0, data: [result] };
};
const insertToken = async (email: string, tokenSenha: string) => {
  const sqls = `UPDATE "Users" SET "resetPassword"= '${tokenSenha}' WHERE email ='${email}'`;
  const results = await database.query(sqls, {
    type: sequelize.QueryTypes.UPDATE
  });
  return { hasResults: results.length > 0, datas: results };
};
export default SendMail;
