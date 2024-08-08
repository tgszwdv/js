// scraping.js
const puppeteer = require('puppeteer');
const axios = require('axios');

async function scrape() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const url = 'https://selecao-login.app.ufgd.edu.br/';
  await page.goto(url, { waitUntil: 'networkidle2' });

  const processos = await page.evaluate(() => {
    const processos = [];
    const rows = document.querySelectorAll('tr[ng-repeat="processo in ctrl.inscricoesAbertas track by $index"]');
    
    rows.forEach((row, index) => {
      const cells = row.querySelectorAll('td');
      const titulo = cells[0].innerText.trim();
      const descricao = cells[1].innerText.trim().replace('Mostrar mais', '').trim();
      const periodo = cells[2].innerText.trim();
      const editalUrl = cells[3].querySelector('a').href;
      const paginaUrl = cells[4].querySelector('a').href;

      if (!titulo.startsWith('PSIE')) {
        processos.push({
          titulo: titulo,
          descricao: descricao,
          periodo: periodo,
          url: paginaUrl,
          edital: editalUrl
        });
      }
    });

    return processos;
  });

  await browser.close();

  console.log('Dados extraídos do scraping:', JSON.stringify({ processos: processos }, null, 2));

  try {
    await axios.put('https://jsserver.vercel.app/processosAbertos/1', { processos: processos });
    console.log('Dados atualizados com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar os dados na API:', error);
  }
}

module.exports = scrape;
