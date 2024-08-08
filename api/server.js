const jsonServer = require('json-server');
const path = require('path');
const express = require('express');
const scrape = require('./scraping'); // Importar a função de scraping

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

server.use('/pages', express.static(path.join(__dirname, '../pages')));

server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id'
}));

// Adicionar a rota para acionar o scraping
server.get('/scrape', async (req, res) => {
    try {
        await scrape(); // Chama a função de scraping
        res.send('Scraping concluído com sucesso!');
    } catch (error) {
        console.error('Erro ao executar o scraping:', error);
        res.status(500).send('Erro ao executar o scraping.');
    }
});

server.use(router);

server.listen(3000, () => {
    console.log('JSON Server is running');
});

module.exports = server;
