import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(express.json());
const client = new Anthropic(); // lê ANTHROPIC_API_KEY do ambiente

const SISTEMA = `Você é o assistente do app Rastreador. Responda em português,
de forma curta, apenas sobre: conectar via Bluetooth, botão Tocar,
localização/histórico e período de silêncio (23:00–07:00).`;

app.post('/ajuda', async (req, res) => {
  try {
    const r = await client.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 500,
      system: SISTEMA,
      messages: req.body.mensagens, // [{ role: 'user', content: '...' }]
    });
    res.json({ texto: r.content.filter(b => b.type === 'text').map(b => b.text).join('') });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao consultar a IA' });
  }
});

app.listen(3000);