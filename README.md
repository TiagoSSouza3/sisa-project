# 📘 SISA — Sistema Integrado de Supervisão Acadêmica

Sistema de gerenciamento com múltiplos perfis de usuários: administradores, colaboradores e professores. O objetivo é organizar informações de participantes, atividades (turmas/matérias) e documentos acadêmicos.

---

## 📦 Tecnologias utilizadas

### Back-end
- Node.js
- Express
- Sequelize (ORM)
- MySQL
- JWT (autenticação)
- dotenv

### Front-end
- React
- Axios
- React Router
- Vite ou Create React App

---

## 🚀 Como rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/sisa.git
cd sisa
```

---

### 2. ⚙️ Configuração do Back-end

```bash
cd backend
npm install
```

#### Crie o arquivo `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=sisa
JWT_SECRET=segredo_super_secreto
```

#### Crie o banco de dados no MySQL:

```sql
CREATE DATABASE sisa;
```

#### Rode o servidor:

```bash
npm start
```

> O back-end estará rodando em: http://localhost:5000

---

### 3. 💻 Configuração do Front-end

```bash
cd ../frontend
npm install
```

#### Crie o arquivo `.env`:

```env
REACT_APP_API=http://localhost:5000/api
```

#### Inicie o servidor de desenvolvimento:

```bash
npm start
```

> O front-end estará disponível em: http://localhost:3000

---

## 👥 Tipos de usuários e permissões

| Tipo de usuário | Permissões principais |
|------------------|------------------------|
| **Administrador** | Total acesso. Cria usuários, gerencia permissões, edita tudo. |
| **Colaborador**   | Visualiza e edita participantes e atividades. Não edita permissões nem documentos padrão. |
| **Professor**     | Apenas visualiza turmas e informações dos participantes. |

---

## 📄 Funcionalidades

- Login com controle de acesso
- CRUD de participantes, atividades e usuários
- Upload de documentos vinculados a atividades
- Controle granular de permissões com checkboxes
- Interface em português, código em inglês
- Totalmente responsivo e adaptável

---

## ☁️ Publicação

Você pode publicar o sistema facilmente com:

- **Front-end**: [Vercel](https://vercel.com) ou [Netlify](https://netlify.com)
- **Back-end**: [Render](https://render.com), [Railway](https://railway.app) ou VPS
- **Banco de dados**: Pode usar MySQL em [PlanetScale](https://planetscale.com) ou host próprio

---

## 📌 Observações finais

- O sistema foi pensado para ser simples, limpo e fácil de expandir.
- Recomendado usar Docker para facilitar a publicação no futuro.
- O projeto já está pronto para começar a ser preenchido com conteúdo real.

---
