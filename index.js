require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

// URL da página que será scrapped
const url = 'https://lolesports.com/pt-BR/gpr';

// Função para realizar o scraping dos dados
async function scrapeData() {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let classificacao = [];

    // Seleciona a tabela de classificação final
    $('.classificacao-tabela tbody tr').each((index, element) => {
      const posicao = $(element).find('.classificacao-posicao').text().trim();
      const equipe = $(element).find('.classificacao-equipe').text().trim();
      const pontuacao = $(element).find('.classificacao-pontos').text().trim();
      const vitoriasDerrotas = $(element).find('.classificacao-vd').text().trim();

      classificacao.push({ posicao, equipe, pontuacao, vitoriasDerrotas });
    });

    return classificacao;
  } catch (error) {
    console.error('Erro ao fazer scraping:', error);
    return null;
  }
}

// Função para enviar e-mail
async function sendEmail(classificacao) {
  let emailContent = `<h2>Classificação Final 2024</h2><table border="1" cellspacing="0" cellpadding="5"><tr><th>#</th><th>Equipe</th><th>Pontuação</th><th>V/D</th></tr>`;
  
  classificacao.forEach(item => {
    emailContent += `<tr><td>${item.posicao}</td><td>${item.equipe}</td><td>${item.pontuacao}</td><td>${item.vitoriasDerrotas}</td></tr>`;
  });
  
  emailContent += '</table>';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: 'Classificação Final de 2024 - LoL Esports',
    html: emailContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

// Função principal
async function main() {
  const classificacao = await scrapeData();
  
  if (classificacao && classificacao.length > 0) {
    await sendEmail(classificacao);
  } else {
    console.log('Falha ao obter dados de classificação.');
  }
}

main();