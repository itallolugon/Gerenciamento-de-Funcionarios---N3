# Sistema de Gerenciamento de Funcionários

Este é um sistema completo de CRUD (Create, Read, Update, Delete) para gerenciamento de funcionários, desenvolvido com Node.js, Express e PostgreSQL.

## 🚀 Funcionalidades

- **Cadastro de funcionários** com validação de dados em tempo real
- **Listagem completa** de todos os funcionários cadastrados
- **Edição** de informações de funcionários existentes
- **Exclusão** de registros com confirmação modal
- **Reindexação automática** de IDs após exclusão
- **Validações robustas** tanto no frontend quanto no backend

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** com Express 5.x
- **PostgreSQL** (pg) para banco de dados relacional
- **CORS** configurado para permitir requisições do frontend
- API RESTful com rotas padronizadas

### Frontend
- **HTML5** + **CSS3** + **JavaScript Vanilla**
- Design responsivo com gradientes modernos
- Máscaras de entrada para telefone e validação de campos
- Modal de confirmação para exclusões
- Sistema de alertas para feedback ao usuário

## 📋 Recursos do Sistema

### Validações Implementadas
- **Nome**: Apenas letras (com acentuação)
- **Email**: Formato válido com obrigatoriedade do `@`
- **Telefone**: Formato brasileiro (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
- **Endereço**: Campo obrigatório

### Operações da API
- `GET /users` - Lista todos os funcionários
- `GET /users/:id` - Busca um funcionário específico
- `POST /users` - Cria novo funcionário
- `PUT /users/:id` - Atualiza funcionário existente
- `DELETE /users/:id` - Remove funcionário (com reindexação automática)

## 🎨 Interface

Interface moderna e intuitiva com:
- Gradiente roxo/azul no cabeçalho
- Formulário com campos organizados em grid responsivo
- Tabela estilizada com hover effects
- Botões com animações sutis
- Sistema de cores consistente

## ⚙️ Configuração

O sistema utiliza PostgreSQL com as seguintes configurações padrão:
- **Host**: localhost
- **Porta**: 5432
- **Database**: employees_db
- **Usuário**: postgres
- **Senha**: 1

## 📦 Dependências

```json
{
  "express": "^5.1.0",
  "pg": "^8.16.3"
}
```

## 🔄 Funcionalidade Especial

O sistema implementa **reindexação automática de IDs** após exclusão, mantendo a sequência numérica contínua e prevenindo lacunas no banco de dados.

---

Sistema ideal para pequenas e médias empresas que precisam gerenciar informações básicas de seus funcionários de forma simples e eficiente.
