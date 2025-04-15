# Indique e Ganhe

Sistema de indicações com ranking e premiação.

## Funcionalidades

- Sistema de indicações via WhatsApp
- Ranking de indicadores
- Painel administrativo para validação
- Premiação de R$ 1.500,00 para os melhores indicadores

## Tecnologias

- Frontend: React + Vite + TypeScript + Chakra UI
- Backend: Node.js + Express + TypeScript
- Banco de dados: MongoDB

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências do backend:
```bash
npm install
```

3. Instale as dependências do frontend:
```bash
cd frontend
npm install
```

4. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto
- Adicione as seguintes variáveis:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/indique-e-ganhe
JWT_SECRET=sua-chave-secreta-aqui
CORS_ORIGIN=http://localhost:5173
```

5. Inicie o servidor de desenvolvimento:
```bash
# Backend (na raiz do projeto)
npm run dev

# Frontend (na pasta frontend)
cd frontend
npm run dev
```

6. Crie um usuário administrador:
```bash
npm run create-admin
```

## Estrutura do Projeto

```
.
├── frontend/           # Aplicação React
├── src/               # Código fonte do backend
│   ├── models/        # Modelos do MongoDB
│   └── server.ts      # Servidor Express
├── package.json
└── README.md
```

## Endpoints da API

- `POST /api/users/login` - Login de usuário
- `POST /api/indicacoes` - Criar nova indicação
- `GET /api/indicacoes` - Listar todas as indicações
- `PATCH /api/indicacoes/:id/status` - Atualizar status da indicação
- `GET /api/indicacoes/ranking` - Obter ranking de indicadores
- `POST /api/formulario/indicacao` - Receber indicação do formulário externo

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. 