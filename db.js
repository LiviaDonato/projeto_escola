require('dotenv').config()
const { Pool } = require('pg')

const BD = new Pool({
    connectionString: process.env.DATABASE_URL
    // user: 'postgres', // Nome usuário do Banco de Dados
    // host: 'localhost', // Endereço do servidor
    // database: 'escola', // Nome do Banco de Dados
    // password: 'admin', // Senha do Banco de Dados
    // port: 5432 // Porta de conexão servidor
})
module.exports = BD