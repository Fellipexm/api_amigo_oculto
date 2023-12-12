const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuração do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'acesso123',
  database: 'amigo',
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conexão bem-sucedida ao banco de dados');
    createTable(); // Chama a função para criar a tabela se ainda não existir
  }
});

// Middleware para habilitar o CORS
app.use(cors());

// Middleware para analisar dados JSON
app.use(bodyParser.json());

// Função para criar a tabela se ainda não existir
function createTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      access_token VARCHAR(255) -- Armazenar token de acesso do Gmail
    )
  `;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error('Erro ao criar tabela:', err);
    } else {
      console.log('Tabela criada com sucesso ou já existente');
    }
  });
}

// Rota para gravar informações de login (incluindo Gmail) no banco de dados
app.post('/login', (req, res) => {
  const { username, password, email, access_token } = req.body;

  const insertQuery = 'INSERT INTO users (username, password, email, access_token) VALUES (?, ?, ?, ?)';

  db.query(insertQuery, [username, password, email, access_token], (err, result) => {
    if (err) {
      console.error('Erro ao gravar informações de login:', err);
      res.status(500).send('Erro ao gravar informações de login');
    } else {
      console.log('Informações de login gravadas com sucesso');
      res.status(200).send('Informações de login gravadas com sucesso');
    }
  });
});

// Rota para obter informações de login (incluindo Gmail) do banco de dados
app.get('/login/:username', (req, res) => {
  const { username } = req.params;

  const selectQuery = 'SELECT * FROM users WHERE username = ?';

  db.query(selectQuery, [username], (err, result) => {
    if (err) {
      console.error('Erro ao obter informações de login:', err);
      res.status(500).send('Erro ao obter informações de login');
    } else {
      if (result.length > 0) {
        const user = result[0];
        res.status(200).json(user);
      } else {
        res.status(404).send('Usuário não encontrado');
      }
    }
  });
});

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
