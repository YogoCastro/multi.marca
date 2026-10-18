
# Multicheiros

E-commerce full stack desenvolvido para demonstrar conhecimentos em desenvolvimento web, integração entre frontend e backend, autenticação de usuários e banco de dados MySQL.

## Sobre o projeto

O Multicheiros é uma aplicação de comércio eletrônico que está sendo desenvolvida com o objetivo de oferecer uma experiência de compra online, com gerenciamento de produtos e funcionalidades para clientes e administradores.


## Tecnologias utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express

### Banco de dados
- MySQL

### Ferramentas
- Git e GitHub
- Visual Studio Code
- Thunder Client


## Funcionalidades

### Clientes
- Cadastro e autenticação de usuários
- Visualização dos produtos disponíveis
- Adição de produtos ao carrinho
- Consulta dos itens e valores do carrinho

### Administração
- Cadastro de produtos
- Edição e exclusão de produtos
- Gerenciamento de informações, preços e estoque
- Upload de imagens dos produtos

### Backend
- API REST para integração com o frontend
- Autenticação e controle de permissões por perfil
- Integração com banco de dados MySQL


## Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [MySQL](https://dev.mysql.com/downloads/)

## Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/YogoCastro/multi.marca.git
```

### 2. Entrar na pasta do backend

```bash
cd multi.marca/backend
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Configurar o ambiente

Configure as variáveis de ambiente necessárias para a conexão com o MySQL antes de iniciar o servidor.

Consulte a seção de variáveis de ambiente deste README.


## Variáveis de ambiente

Crie um arquivo `.env` dentro da pasta `backend` e configure as seguintes variáveis:

```env
PORT=4000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=multicheiros
DB_PORT=3306

JWT_SECRET=seu_segredo_jwt
```

**Importante:**
- Substitua os valores de exemplo pelos dados do seu ambiente.
- Utilize um segredo JWT forte e privado.
- Nunca envie senhas ou segredos reais para o GitHub.
- Não publique o arquivo `.env` no repositório.


## Executar o backend

Dentro da pasta `backend`, execute:

```bash
npm run dev
```

O servidor será iniciado conforme a configuração do projeto.


## API — Rotas disponíveis

A API do Multicheiros permite gerenciar usuários e produtos.

### Produtos

| Método | Endpoint | Acesso |
|---|---|---|
| GET | `/api/products` | Público |
| GET | `/api/products/:id` | Público |
| POST | `/api/products` | ADMIN |
| PUT | `/api/products/:id` | ADMIN |
| DELETE | `/api/products/:id` | ADMIN |

As operações de criação e atualização aceitam upload de até 10 imagens usando o campo `image` em requisições multipart/form-data.

### Autenticação

| Método | Endpoint | Acesso |
|---|---|---|
| POST | `/api/auth/register` | Público |
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/me` | Usuário autenticado |
| GET | `/api/auth/admin-test` | ADMIN |

As rotas protegidas exigem autenticação. As rotas administrativas também verificam a permissão do usuário.


### Carrinho de compras

Todas as rotas do carrinho exigem autenticação.

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/cart` | Adicionar produto ao carrinho |
| GET | `/api/cart` | Consultar o carrinho |
| PUT | `/api/cart/:productId` | Atualizar quantidade de um produto |
| DELETE | `/api/cart/:productId` | Remover um produto do carrinho |
| DELETE | `/api/cart` | Limpar o carrinho |

O acesso é controlado pelo middleware de autenticação.


### Pedidos

| Método | Endpoint | Acesso |
|---|---|---|
| POST | `/api/orders` | Usuário autenticado |
| GET | `/api/orders` | Usuário autenticado |
| GET | `/api/orders/:id` | Usuário autenticado |
| GET | `/api/orders/admin` | ADMIN |
| GET | `/api/orders/admin/:id` | ADMIN |
| PUT | `/api/orders/:id/status` | ADMIN |

As rotas administrativas exigem autenticação e permissão de administrador.


### Usuários

| Método | Endpoint | Acesso |
|---|---|---|
| GET | `/api/users` | ADMIN |

Essa rota permite consultar a lista de usuários cadastrados. O acesso exige autenticação e permissão de administrador.


Os clientes autenticados podem criar pedidos e consultar pedidos pelas rotas destinadas aos usuários.



