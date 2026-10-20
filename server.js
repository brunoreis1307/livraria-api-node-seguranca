const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');


const app = express();

app.use(cors());
app.use(express.json());

// --- ROTAS DO SWAGGER ---
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/docs/api.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação Swagger disponível em http://localhost:${PORT}/docs`);
});