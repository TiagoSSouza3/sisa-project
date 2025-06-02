# SISA - Backend

Sistema de Gestão de Documentos Acadêmicos - Backend

## Requisitos

- Node.js (v14 ou superior)
- MySQL (v8.0 ou superior)
- NPM ou Yarn

## Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd sisa-project/backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=sisa_db
JWT_SECRET=sua_chave_secreta
PORT=3000
```

4. Execute as migrações do banco de dados:
```bash
npx sequelize-cli db:migrate
```

5. (Opcional) Execute os seeders para dados iniciais:
```bash
npx sequelize-cli db:seed:all
```

## Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Estrutura do Projeto

```
backend/
├── config/         # Configurações do banco de dados e outras
├── controllers/    # Controladores da aplicação
├── middleware/     # Middlewares (auth, upload, etc)
├── models/         # Modelos do Sequelize
├── routes/         # Rotas da API
├── uploads/        # Diretório para uploads de arquivos
└── server.js       # Arquivo principal da aplicação
```

## API Endpoints

### Documentos
- `GET /api/documents` - Lista todos os documentos
- `GET /api/documents/:id` - Obtém um documento específico
- `POST /api/documents` - Cria um novo documento
- `PUT /api/documents/:id` - Atualiza um documento
- `DELETE /api/documents/:id` - Remove um documento
- `GET /api/documents/:id/versions` - Lista versões de um documento
- `GET /api/documents/:id/download` - Download do documento em PDF

### Templates
- `GET /api/templates` - Lista todos os templates
- `POST /api/templates` - Cria um novo template
- `PUT /api/templates/:id` - Atualiza um template
- `DELETE /api/templates/:id` - Remove um template

## Solução de Problemas

### Erro de Permissão no Upload
- Verifique se o diretório `uploads/` existe e tem permissões corretas
- Execute: `chmod 755 uploads/`

### Erro de Conexão com Banco de Dados
- Verifique as credenciais no arquivo `.env`
- Confirme se o serviço MySQL está rodando
- Verifique se o banco de dados existe

### Erro no Multer
- Verifique o tamanho máximo do arquivo (limite: 5MB)
- Confirme se o tipo do arquivo é permitido (PDF/DOCX)

## Segurança

- Todas as senhas são hasheadas usando bcrypt
- Autenticação via JWT
- Validação de uploads de arquivos
- Sanitização de nomes de arquivos
- Controle de acesso baseado em roles

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request 