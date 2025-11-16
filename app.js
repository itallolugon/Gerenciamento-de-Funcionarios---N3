const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = 3000;

// ============ CONFIGURAÇÃO DO BANCO ============
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'employees_db',
    user: 'postgres',
    password: '1'
});

// Testar conexão
pool.on('connect', () => {
    console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Erro na conexão:', err.message);
});

// ============ MIDDLEWARES ============
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());

// ============ ROTAS ============

// GET /users - Listar todos
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, address, phone FROM users ORDER BY id'
        );
        res.json(result.rows);
        console.log(`✅ GET /users - ${result.rows.length} registros`);
    } catch (error) {
        console.error('❌ GET /users:', error.message);
        res.status(500).json({ erro: 'Erro ao buscar usuários' });
    }
});

// GET /users/:id - Buscar um
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT id, name, email, address, phone FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        res.json(result.rows[0]);
        console.log(`✅ GET /users/${id}`);
    } catch (error) {
        console.error('❌ GET /users/:id:', error.message);
        res.status(500).json({ erro: 'Erro ao buscar usuário' });
    }
});

// POST /users - Criar
app.post('/users', async (req, res) => {
    try {
        const { name, email, address, phone } = req.body;

        // Validação
        if (!name?.trim() || !email?.trim() || !address?.trim() || !phone?.trim()) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
        }

        // Verificar email único
        const checkEmail = await pool.query(
            'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
            [email]
        );

        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ erro: 'Email já existe' });
        }

        // Inserir
        const result = await pool.query(
            'INSERT INTO users (name, email, address, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, email, address, phone',
            [name.trim(), email.trim(), address.trim(), phone.trim()]
        );

        res.status(201).json(result.rows[0]);
        console.log(`✅ POST /users - Criado ID ${result.rows[0].id}`);
    } catch (error) {
        console.error('❌ POST /users:', error.message);
        res.status(500).json({ erro: 'Erro ao criar usuário' });
    }
});

// PUT /users/:id - Atualizar
app.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, address, phone } = req.body;

        // Validação
        if (!name?.trim() || !email?.trim() || !address?.trim() || !phone?.trim()) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
        }

        // Verificar se existe
        const checkUser = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [id]
        );

        if (checkUser.rows.length === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        // Verificar email único (excluindo o próprio)
        const checkEmail = await pool.query(
            'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2',
            [email, id]
        );

        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ erro: 'Email já existe' });
        }

        // Atualizar
        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2, address = $3, phone = $4 WHERE id = $5 RETURNING id, name, email, address, phone',
            [name.trim(), email.trim(), address.trim(), phone.trim(), id]
        );

        res.json(result.rows[0]);
        console.log(`✅ PUT /users/${id} - Atualizado`);
    } catch (error) {
        console.error('❌ PUT /users/:id:', error.message);
        res.status(500).json({ erro: 'Erro ao atualizar usuário' });
    }
});

// DELETE /users/:id - Deletar
app.delete('/users/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        // Verificar se existe
        const checkUser = await client.query(
            'SELECT id FROM users WHERE id = $1',
            [id]
        );

        if (checkUser.rows.length === 0) {
            client.release();
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        // Iniciar transação
        await client.query('BEGIN');

        // Deletar o registro
        await client.query('DELETE FROM users WHERE id = $1', [id]);

        // Buscar todos os IDs após o deletado, ordenados
        const recordsAfter = await client.query(
            'SELECT id FROM users WHERE id > $1 ORDER BY id ASC',
            [id]
        );

        // Reindexar: decrementar cada ID em 1
        for (let i = 0; i < recordsAfter.rows.length; i++) {
            const oldId = recordsAfter.rows[i].id;
            const newId = oldId - 1; // Apenas decrementar em 1
            await client.query(
                'UPDATE users SET id = $1 WHERE id = $2',
                [newId, oldId]
            );
        }

        // Resetar a sequência para o máximo ID + 1
        const maxIdResult = await client.query('SELECT MAX(id) as max_id FROM users');
        const maxId = maxIdResult.rows[0].max_id || 0;
        await client.query(`ALTER SEQUENCE users_id_seq RESTART WITH ${maxId + 1}`);

        // Commit da transação
        await client.query('COMMIT');
        client.release();

        res.json({ mensagem: 'Usuário deletado com sucesso' });
        console.log(`✅ DELETE /users/${id} - Deletado e IDs reindexados. Próximo ID será ${maxId + 1}`);
    } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        console.error('❌ DELETE /users/:id:', error.message);
        res.status(500).json({ erro: 'Erro ao deletar usuário' });
    }
});

// ============ ERRO HANDLER ============
app.use((err, req, res, next) => {
    console.error('❌ Erro não tratado:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
});

app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
});

// ============ INICIAR SERVIDOR ============
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Banco: PostgreSQL (employees_db)`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n📛 Encerrando...');
    await pool.end();
    process.exit(0);
});
