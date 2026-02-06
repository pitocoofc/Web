const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio'); // Para processar o HTML e extrair os dados
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Busca vazia" });

    try {
        // Alvo: Ahmia (O buscador da Deep Web que aceita requisições da Clearnet)
        const targetUrl = `https://ahmia.fi/search/?q=${encodeURIComponent(query)}`;

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 8000 // Para não travar seu servidor se a rede onion estiver lenta
        });

        const $ = cheerio.load(response.data);
        const results = [];

        // Extraindo os links e descrições dos resultados do Ahmia
        $('.result').each((i, element) => {
            if (i < 15) { // Limite de 15 resultados para manter a RAM baixa
                const title = $(element).find('a').first().text();
                const link = $(element).find('cite').text();
                const desc = $(element).find('p').text();

                if (title && link) {
                    results.push({ title, link, desc });
                }
            }
        });

        // Retorna o JSON direto para o seu Navegador (Front-end)
        res.json({
            provider: "Deep Search Engine",
            query: query,
            results: results
        });

    } catch (error) {
        res.status(500).json({ error: "Erro na conexão com a rede profunda." });
    }
});

app.listen(PORT, () => console.log(`Motor rodando na porta ${PORT}`));
  
