// config.js

const config = {
    host: 'localhost',       // Endereço onde o PostgreSQL está rodando [cite: 36]
    database: 'employees_db', // O banco de dados que criamos (o slide usava 'postgres') [cite: 37]
    port: 5432,              // Porta padrão do PostgreSQL [cite: 39]
    user: 'postgres',        // Usuário padrão [cite: 40]
    password: '1',    // Senha padrão (ajuste se a sua for diferente) [cite: 42]
    ssl: false               // Configuração de segurança [cite: 44]
};

module.exports = config;