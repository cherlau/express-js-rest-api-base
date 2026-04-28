# Guia Completo: Express.js REST API Base
### Do Zero ao Entendimento Profundo

---

## Sumário

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Pré-requisitos e Configuração Inicial](#2-pré-requisitos-e-configuração-inicial)
3. [Mapa da Estrutura de Pastas](#3-mapa-da-estrutura-de-pastas)
4. [Deep Dive nos Arquivos](#4-deep-dive-nos-arquivos)
   - [4.1 Ponto de Entrada — `index.js`](#41-ponto-de-entrada--indexjs)
   - [4.2 Validação de Ambiente — `config/env.js`](#42-validação-de-ambiente--configenvjs)
   - [4.3 Banco de Dados — `database/`](#43-banco-de-dados--database)
   - [4.4 Models — `models/`](#44-models--models)
   - [4.5 Rotas — `routes/`](#45-rotas--routes)
   - [4.6 Controllers — `controllers/`](#46-controllers--controllers)
   - [4.7 Middlewares — `middlewares/`](#47-middlewares--middlewares)
   - [4.8 Utilitários — `utils/tokens.js`](#48-utilitários--utilstokensjs)
   - [4.9 Validators — `validators/`](#49-validators--validators)
5. [Fluxo Completo de uma Requisição](#5-fluxo-completo-de-uma-requisição)
6. [Sistema de Autenticação em Detalhes](#6-sistema-de-autenticação-em-detalhes)
7. [Guia Prático: Adicionando o Recurso "Products"](#7-guia-prático-adicionando-o-recurso-products)
8. [Boas Práticas e Decisões de Design](#8-boas-práticas-e-decisões-de-design)
9. [Referência Rápida de Endpoints](#9-referência-rápida-de-endpoints)

---

## 1. Visão Geral da Arquitetura

### O Padrão Escolhido: Layered Architecture (Arquitetura em Camadas)

Este boilerplate segue uma **Arquitetura em Camadas**, que é uma evolução natural do padrão MVC adaptada para APIs REST. O princípio central é a **Separação de Responsabilidades** (*Separation of Concerns*): cada camada tem uma responsabilidade única e bem definida, e nunca invade o território da outra.

```
Cliente (Browser / App)
        │
        ▼
  ┌─────────────┐
  │   Routes    │  ← Define os caminhos (URLs) e aplica middlewares
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │ Middlewares │  ← Valida, autentica, limita antes de passar adiante
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │ Controllers │  ← Orquestra: recebe a request, chama o Model, retorna a response
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │   Models    │  ← Abstrai o banco de dados (queries SQL)
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  Database   │  ← MySQL via Knex.js
  └─────────────┘
```

### Por que não colocar tudo em um único arquivo?

Imagine um arquivo `server.js` de 800 linhas com rotas, lógica de negócio e queries misturadas. Quando você precisar:

- **Trocar MySQL por PostgreSQL**: terá de caçar queries espalhadas em centenas de linhas.
- **Adicionar autenticação em uma rota**: terá de encontrar o lugar certo entre dezenas de `app.get(...)`.
- **Corrigir um bug de validação**: não saberá se a validação está na rota, no `if` do controller ou em algum helper perdido.

Com arquitetura em camadas, cada mudança tem um lugar óbvio e único. Isso é chamado de **princípio de responsabilidade única** (o "S" do SOLID).

---

## 2. Pré-requisitos e Configuração Inicial

### Dependências necessárias

| Ferramenta | Versão mínima | Para quê |
|---|---|---|
| Node.js | 18+ | Runtime JavaScript |
| npm | 9+ | Gerenciador de pacotes |
| MySQL | 8+ | Banco de dados |

### Stack de produção

| Pacote | Versão | Responsabilidade |
|---|---|---|
| `express` | 4.x | Framework web |
| `knex` | 3.x | Query builder / Migrations |
| `mysql2` | 3.x | Driver MySQL |
| `bcryptjs` | 3.x | Hash de senhas |
| `jsonwebtoken` | 9.x | Geração e verificação de JWT |
| `zod` | 4.x | Validação de schemas |
| `helmet` | 7.x | Headers de segurança HTTP |
| `cors` | 2.x | Controle de origem cruzada |
| `express-rate-limit` | 8.x | Limitação de requisições |
| `dotenv` | 16.x | Variáveis de ambiente |

### Passo a passo para rodar

```bash
# 1. Clone ou baixe o projeto
git clone <url-do-repositório>
cd express-js-rest-api-base

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Abra o .env e preencha os valores

# 4. Crie o banco de dados no MySQL
mysql -u root -p -e "CREATE DATABASE usertest;"

# 5. Execute as migrations (cria as tabelas)
npm run migrate

# 6. Inicie em modo desenvolvimento
npm run dev
# A API estará disponível em http://localhost:8686
```

---

## 3. Mapa da Estrutura de Pastas

```
express-js-rest-api-base/
│
├── index.js                    # Ponto de entrada da aplicação
├── knexfile.js                 # Configuração do Knex para migrations
├── package.json                # Dependências e scripts npm
├── .env.example                # Template das variáveis de ambiente
│
├── config/
│   └── env.js                  # Validação das variáveis obrigatórias
│
├── database/
│   ├── connection.js           # Conexão singleton com o banco
│   └── migrations/
│       ├── 001_create_users.js        # Tabela de usuários
│       └── 002_create_refresh_tokens.js  # Tabela de tokens
│
├── models/
│   ├── User.js                 # Queries da tabela users
│   └── RefreshToken.js         # Queries da tabela refresh_tokens
│
├── routes/
│   ├── routes.js               # Roteador principal (raiz)
│   └── auth.js                 # Rotas de autenticação
│
├── controllers/
│   ├── HomeController.js       # Rota de health check
│   ├── AuthController.js       # Lógica de auth (register, login, etc.)
│   └── UserController.js       # CRUD de usuários
│
├── middlewares/
│   ├── auth.js                 # Verificação do JWT
│   ├── validate.js             # Validação de payload com Zod
│   └── rateLimiter.js          # Limitação de requisições
│
├── utils/
│   └── tokens.js               # Geração e verificação de JWT
│
└── validators/
    ├── auth.js                 # Schemas Zod para register/login
    └── user.js                 # Schemas Zod para CRUD de usuários
```

> **Regra de ouro:** se você não sabe onde criar um arquivo novo, pergunte: "Qual a responsabilidade deste código?" A resposta vai apontar a pasta certa.

---

## 4. Deep Dive nos Arquivos

### 4.1 Ponto de Entrada — `index.js`

```javascript
import 'dotenv/config'
import { validateEnv } from './config/env.js'
validateEnv()  // ← Primeira coisa que roda: garante que o .env está correto

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { globalLimiter } from './middlewares/rateLimiter.js'
import router from './routes/routes.js'

const app = express()
const PORT = process.env.PORT || 8686

// 1. Segurança: headers HTTP defensivos
app.use(helmet())

// 2. CORS: controla quem pode chamar esta API
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }))

// 3. Rate limiting global: no máximo 100 req/15min por IP
app.use(globalLimiter)

// 4. Parsers: lê JSON e formulários no corpo da requisição
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// 5. Rotas: delega para o roteador principal
app.use('/', router)

// 6. Error handler global: captura qualquer next(err)
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
```

**O que este arquivo faz:**
É o único lugar onde a aplicação Express é criada e configurada. Ele monta os middlewares globais em ordem e delega as rotas para o roteador.

**Por que a ordem importa:**
O Express processa middlewares **em sequência, de cima para baixo**. Se você colocar `express.json()` depois das rotas, os controllers não conseguirão ler `req.body`. Se o error handler vier antes das rotas, ele nunca vai interceptar nada.

**Impacto de remover:**
- Sem `helmet()`: a API retorna headers padrão do Express, expondo informações como `X-Powered-By: Express`.
- Sem `express.json()`: `req.body` será sempre `undefined`.
- Sem o error handler: erros jogados com `next(err)` virarão crashes silenciosos ou respostas HTML do Express padrão.

---

### 4.2 Validação de Ambiente — `config/env.js`

```javascript
const REQUIRED = [
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
]

export const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error(`[ERRO] Variáveis de ambiente obrigatórias não definidas: ${missing.join(', ')}`)
    console.error('Copie o arquivo .env.example para .env e preencha os valores.')
    process.exit(1)  // ← Mata o processo antes de tentar usar valores undefined
  }
}
```

**O que este arquivo faz:**
Verifica se todas as variáveis de ambiente críticas estão definidas **antes** de qualquer outra coisa rodar.

**Por que isso é fundamental:**
Sem esta validação, a aplicação subiria "com sucesso" e só quebraria no momento em que alguém tentasse fazer login (`JWT_SECRET` undefined) ou fazer uma query (`DB_HOST` undefined). O erro apareceria em produção, para o usuário final, de forma confusa. Com a validação, o erro aparece no boot, no terminal do desenvolvedor, com uma mensagem clara.

**O padrão:**
`process.exit(1)` com código 1 sinaliza para o sistema operacional (e para ferramentas como Docker, PM2, systemd) que o processo falhou propositalmente — não foi um crash aleatório.

**Impacto de remover:**
Bugs difíceis de diagnosticar em produção. A aplicação rodaria parcialmente e falharia em runtime com mensagens de erro genéricas.

---

### 4.3 Banco de Dados — `database/`

#### `database/connection.js` — O singleton de conexão

```javascript
import knex from 'knex'

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
})

export default db
```

**O que é o Knex:**
Knex é um **Query Builder** — uma biblioteca que permite escrever queries SQL usando JavaScript, com suporte a múltiplos bancos (MySQL, PostgreSQL, SQLite). Ele não é um ORM completo (como Sequelize ou Prisma): não cria classes com métodos mágicos, mas oferece uma API fluente para montar queries.

```javascript
// Com Knex (legível, seguro contra SQL injection)
db('users').where({ email: 'joao@email.com' }).first()

// SQL equivalente gerado
// SELECT * FROM `users` WHERE `email` = 'joao@email.com' LIMIT 1
```

**Por que singleton:**
`db` é criado uma única vez quando o módulo é importado pela primeira vez. Todas as importações subsequentes recebem a mesma instância. Isso é essencial porque o Knex mantém um **pool de conexões** internamente — criar múltiplas instâncias desperdiçaria conexões com o banco.

#### `database/migrations/` — Controle de versão do schema

```javascript
// 001_create_users.js
export const up = (knex) =>
  knex.schema.createTable('users', (table) => {
    table.increments('id').primary()             // INT AUTO_INCREMENT PRIMARY KEY
    table.string('name').notNullable()            // VARCHAR(255) NOT NULL
    table.string('email').notNullable().unique()  // VARCHAR(255) NOT NULL UNIQUE
    table.string('password').notNullable()
    table.timestamps(true, true)                  // created_at e updated_at automáticos
  })

export const down = (knex) => knex.schema.dropTable('users')
```

**O conceito de migrations:**
Migrations são scripts numerados que aplicam mudanças incrementais ao schema do banco. Funcionam como um `git` para o banco de dados: cada migration tem uma função `up` (aplicar) e `down` (reverter).

| Comando | O que faz |
|---|---|
| `npm run migrate` | Aplica todas as migrations pendentes |
| `npm run migrate:rollback` | Reverte a última migration executada |
| `npm run migrate:make nome` | Cria um novo arquivo de migration |

**Por que o número no nome do arquivo:**
O Knex executa as migrations em ordem alfabética. O prefixo `001_`, `002_` garante que `users` seja criado antes de `refresh_tokens` (que tem uma foreign key para `users`).

---

### 4.4 Models — `models/`

Os Models encapsulam todas as interações com o banco. **Nenhum outro arquivo faz query diretamente.**

```javascript
// models/User.js
import db from '../database/connection.js'

const TABLE = 'users'

const User = {
  findAll:     () =>     db(TABLE).select('id', 'name', 'email', 'created_at'),
  findById:    (id) =>   db(TABLE).select('id', 'name', 'email', 'created_at').where({ id }).first(),
  findByEmail: (email) => db(TABLE).where({ email }).first(),
  create:      (data) => db(TABLE).insert(data),
  update:      (id, data) => db(TABLE).where({ id }).update(data),
  remove:      (id) =>   db(TABLE).where({ id }).delete(),
}

export default User
```

**Observe o que `findAll` e `findById` NÃO retornam:**
A coluna `password`. Isso é uma decisão de segurança consciente — campos sensíveis são excluídos na camada de dados, não no controller. Se você adicionar `password` ao `select`, vai expor o hash em todas as listagens.

**Por que um objeto simples em vez de uma classe com `new`:**
Métodos estáticos em um objeto literal são funcionalmente idênticos a métodos estáticos de classe, mas com sintaxe mais direta. O `User` aqui não precisa de estado interno, então não há vantagem em instanciá-lo.

**`RefreshToken` — tokens com expiração no banco:**

```javascript
const RefreshToken = {
  create:         (data) =>    db(TABLE).insert(data),
  findByToken:    (token) =>   db(TABLE).where({ token }).first(),
  deleteByToken:  (token) =>   db(TABLE).where({ token }).delete(),
  deleteByUserId: (user_id) => db(TABLE).where({ user_id }).delete(),
  deleteExpired:  () =>        db(TABLE).where('expires_at', '<', new Date()).delete(),
}
```

> **Nota:** `deleteExpired` existe no Model mas ainda não é chamado automaticamente. Em produção, você chamaria isso via um **cron job** periódico para evitar que a tabela cresça indefinidamente.

---

### 4.5 Rotas — `routes/`

#### `routes/routes.js` — Roteador principal

```javascript
import { Router } from 'express'
// ... imports

const router = Router()

router.get('/', HomeController.index)

// Monta o sub-roteador de auth em /auth
router.use('/auth', authRoutes)

// Rotas protegidas: o middleware `auth` vem ANTES do controller
router.get('/users',      auth,                              UserController.index)
router.get('/users/:id',  auth,                              UserController.show)
router.post('/users',     auth, validate(createUserSchema),  UserController.store)
router.put('/users/:id',  auth, validate(updateUserSchema),  UserController.update)
router.delete('/users/:id', auth,                            UserController.destroy)

export default router
```

**O que o `Router` do Express faz:**
`Router()` cria um mini-aplicativo Express isolado. Você define rotas nele e o "monta" no app principal com `app.use()`. Isso permite organizar rotas em arquivos separados sem perder a hierarquia de URLs.

**A anatomia de uma rota com middlewares:**
```
router.post('/users', auth, validate(createUserSchema), UserController.store)
              │         │           │                          │
             URL    Middleware   Middleware               Handler final
                   (autentica)  (valida body)
```

Cada argumento depois da URL é um middleware. O Express os executa em sequência. Se qualquer um chamar `res.json()` sem chamar `next()`, a cadeia para ali.

#### `routes/auth.js` — Sub-roteador de autenticação

```javascript
router.post('/register',   authLimiter, validate(registerSchema), AuthController.register)
router.post('/login',      authLimiter, validate(loginSchema),    AuthController.login)
router.post('/refresh',    authLimiter,                           AuthController.refresh)
router.post('/logout',                                            AuthController.logout)
router.post('/logout-all', auth,                                  AuthController.logoutAll)
```

**Por que um arquivo separado para auth:**
As rotas de autenticação têm um conjunto diferente de middlewares (o `authLimiter` é mais restritivo que o `globalLimiter`). Separar em arquivo próprio deixa essas diferenças explícitas e evita poluir o roteador principal.

---

### 4.6 Controllers — `controllers/`

Controllers são os **orquestradores**: recebem a requisição, chamam os Models necessários, tomam decisões simples de fluxo e devolvem a resposta.

#### `AuthController.js` — O mais complexo

**Register:**
```javascript
async register(req, res, next) {
  try {
    const { name, email, password } = req.validatedBody  // ← vem do middleware validate

    const existing = await User.findByEmail(email)
    if (existing) {
      return res.status(409).json({ error: 'E-mail já cadastrado' })  // 409 Conflict
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)  // SALT_ROUNDS = 12
    const [id] = await User.create({ name, email, password: hashedPassword })

    const payload = { id, email }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    await RefreshToken.create({ user_id: id, token: refreshToken, expires_at: refreshExpiresAt() })

    res.status(201).json({ accessToken, refreshToken })
  } catch (err) {
    next(err)  // ← Delega ao error handler global
  }
}
```

**Login — proteção contra user enumeration:**
```javascript
const user = await User.findByEmail(email)
const passwordMatch = user ? await bcrypt.compare(password, user.password) : false

// Mesma resposta para e-mail e senha incorretos — evita user enumeration
if (!user || !passwordMatch) {
  return res.status(401).json({ error: 'Credenciais inválidas' })
}
```

User enumeration é um ataque onde o atacante descobre quais e-mails estão cadastrados testando mensagens diferentes ("e-mail não encontrado" vs "senha incorreta"). Retornando a mesma mensagem nos dois casos, você elimina essa diferenciação.

**Refresh — rotação de tokens:**
```javascript
// Invalida o token usado e emite um novo par
await RefreshToken.deleteByToken(refreshToken)

const newAccessToken = generateAccessToken(payload)
const newRefreshToken = generateRefreshToken(payload)
await RefreshToken.create({ user_id: decoded.id, token: newRefreshToken, expires_at: refreshExpiresAt() })

res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
```

**Por que rotação:** cada vez que o cliente usa um refresh token para renovar o acesso, o token usado é descartado e um novo é gerado. Se um atacante roubar um refresh token e tentar usá-lo depois que o usuário legítimo já o usou, o token estará inválido no banco.

#### `UserController.js` — CRUD padrão

```javascript
class UserController {
  async index(req, res, next) {
    try {
      const users = await User.findAll()
      res.json(users)
    } catch (err) {
      next(err)
    }
  }

  async show(req, res, next) {
    try {
      const user = await User.findById(req.params.id)
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
      res.json(user)
    } catch (err) {
      next(err)
    }
  }

  // update e destroy seguem o mesmo padrão
}
```

**O padrão `try/catch/next(err)`:**
Todo controller usa este padrão. O motivo: `async/await` não propaga erros automaticamente para o error handler global do Express. Sem o `catch`, uma rejeição de Promise simplesmente vai sumir (em versões antigas do Node) ou derrubar o processo (versões modernas). Com `next(err)`, o erro é capturado e tratado de forma centralizada.

---

### 4.7 Middlewares — `middlewares/`

Middlewares são funções com a assinatura `(req, res, next)`. Eles podem ler e modificar `req` e `res`, ou interromper a cadeia retornando uma resposta.

#### `auth.js` — Guarda das rotas protegidas

```javascript
import { verifyAccessToken } from '../utils/tokens.js'

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]  // "Bearer eyJ..." → "eyJ..."

  try {
    req.user = verifyAccessToken(token)  // ← Injeta o payload decodificado em req.user
    next()
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido'
    return res.status(401).json({ error: message })
  }
}
```

**O padrão Bearer:**
O header `Authorization` segue o formato `Bearer <token>`. O prefixo "Bearer" é parte do padrão OAuth 2.0 e indica o tipo de credencial. A verificação `.startsWith('Bearer ')` rejeita tanto ausência de header quanto formatos inválidos.

**`req.user`:**
Após este middleware, qualquer controller pode acessar `req.user.id` e `req.user.email` — os dados do usuário autenticado, extraídos do JWT sem precisar consultar o banco.

#### `validate.js` — Validação com Zod

```javascript
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    return res.status(422).json({
      error: 'Dados inválidos',
      details: result.error.flatten().fieldErrors,
    })
  }

  req.validatedBody = result.data  // ← Dados limpos e tipados
  next()
}
```

**Higher-order function:**
`validate` é uma função que **retorna** um middleware. Isso permite passar o schema como parâmetro:
```javascript
validate(registerSchema)   // retorna um middleware configurado para aquele schema
validate(createUserSchema) // retorna outro middleware para outro schema
```

**`safeParse` vs `parse`:**
`safeParse` retorna `{ success, data, error }` sem lançar exceção. `parse` lança exceção em caso de falha. O `safeParse` é preferível em middlewares porque permite tratar o erro de forma controlada.

**`req.validatedBody`:**
Os dados em `req.validatedBody` são garantidamente válidos e têm exatamente os campos definidos no schema — campos extras enviados pelo cliente são removidos automaticamente pelo Zod.

**Status 422 Unprocessable Entity:**
422 é semanticamente mais correto que 400 para erros de validação: o servidor entendeu a requisição, mas os dados são inválidos.

#### `rateLimiter.js` — Dois níveis de proteção

```javascript
// Limiter global: 100 requisições por 15 minutos por IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,   // Envia RateLimit-* headers no response
  legacyHeaders: false,     // Não envia os antigos X-RateLimit-* headers
  message: { error: 'Muitas requisições...' },
})

// Limiter de auth: apenas 10 tentativas por 15 minutos
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  // ...
})
```

**Por que dois limiters:**
Rotas de autenticação são o alvo principal de **brute force** e **credential stuffing**. Um limite de 10 tentativas em 15 minutos torna ataques automatizados inviáveis. O limiter global protege contra abuso em geral, mas é mais permissivo para não prejudicar usuários legítimos.

---

### 4.8 Utilitários — `utils/tokens.js`

```javascript
import jwt from 'jsonwebtoken'

export const generateAccessToken  = (payload) => jwt.sign(payload, process.env.JWT_SECRET,         { expiresIn: '15m' })
export const generateRefreshToken = (payload) => jwt.sign(payload, process.env.JWT_REFRESH_SECRET,  { expiresIn: '7d' })
export const verifyAccessToken    = (token)   => jwt.verify(token, process.env.JWT_SECRET)
export const verifyRefreshToken   = (token)   => jwt.verify(token, process.env.JWT_REFRESH_SECRET)
```

**Access Token vs Refresh Token:**

| | Access Token | Refresh Token |
|---|---|---|
| Validade | 15 minutos | 7 dias |
| Segredo | `JWT_SECRET` | `JWT_REFRESH_SECRET` |
| Uso | Cada requisição autenticada | Apenas para renovar o access token |
| Armazenamento | Memory do cliente | Storage seguro (HttpOnly cookie ideal) |

**Por que segredos diferentes:**
Se `JWT_SECRET` for comprometido, o atacante pode forjar access tokens — mas não refresh tokens (que usam `JWT_REFRESH_SECRET`). E vice-versa. Isso limita o raio de impacto de um vazamento.

**Por que 15 minutos para o access token:**
JWTs são stateless: uma vez emitido, o servidor não pode invalidá-lo. Se um access token for roubado, ele funcionará até expirar. Com 15 minutos de validade, a janela de exposição é pequena. O refresh token, armazenado no banco, pode ser revogado a qualquer momento (logout).

---

### 4.9 Validators — `validators/`

```javascript
// validators/auth.js
import { z } from 'zod'

export const registerSchema = z.object({
  name:     z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

export const loginSchema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})
```

```javascript
// validators/user.js
export const updateUserSchema = z.object({
  name:  z.string().min(2).optional(),   // ← .optional() para PATCH/PUT parcial
  email: z.string().email().optional(),
})
```

**Por que separar validators de middlewares:**
Schemas são dados de configuração, não lógica de execução. Mantê-los em arquivos separados permite reutilizá-los (ex: em testes), alterá-los sem tocar nos middlewares, e documentá-los facilmente.

---

## 5. Fluxo Completo de uma Requisição

Vamos rastrear o caminho de um `POST /auth/login` com credenciais válidas:

```
Cliente envia:
POST /auth/login
Content-Type: application/json
Body: { "email": "joao@email.com", "password": "123456" }
```

**Passo 1 — `index.js` recebe a requisição**
```
app.use(helmet())        ✓ Headers de segurança adicionados ao response futuro
app.use(cors(...))       ✓ Verifica se a origem é permitida
app.use(globalLimiter)   ✓ Conta +1 para este IP. Abaixo de 100? Continua.
app.use(express.json())  ✓ Lê o body e popula req.body = { email: ..., password: ... }
app.use('/', router)     → Passa para o roteador principal
```

**Passo 2 — `routes/routes.js`**
```
router.use('/auth', authRoutes)  → URL começa com /auth? Passa para authRoutes
```

**Passo 3 — `routes/auth.js`**
```
router.post('/login', authLimiter, validate(loginSchema), AuthController.login)
                          │               │                       │
                     Conta +1 (max 10)  Valida body         Handler final
```

**Passo 4 — `middlewares/rateLimiter.js` (authLimiter)**
```
Este IP fez 3 tentativas em 15 min? Abaixo de 10. → next()
```

**Passo 5 — `middlewares/validate.js` (com loginSchema)**
```javascript
loginSchema.safeParse({ email: 'joao@email.com', password: '123456' })
// → { success: true, data: { email: 'joao@email.com', password: '123456' } }
req.validatedBody = { email: 'joao@email.com', password: '123456' }
next()
```

**Passo 6 — `controllers/AuthController.js` (método login)**
```javascript
const { email, password } = req.validatedBody
const user = await User.findByEmail(email)                    // SELECT * FROM users WHERE email = ?
const passwordMatch = await bcrypt.compare(password, user.password)  // → true
const accessToken = generateAccessToken({ id: 1, email: 'joao@email.com' })
const refreshToken = generateRefreshToken({ id: 1, email: 'joao@email.com' })
await RefreshToken.create(...)
res.json({ accessToken, refreshToken })
```

**Resposta chega ao cliente:**
```json
HTTP/1.1 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Fluxo com erro de validação (senha em branco):**
```
validate(loginSchema) → safeParse falha
→ res.status(422).json({ error: 'Dados inválidos', details: { password: ['Senha obrigatória'] } })
→ AuthController.login NUNCA é chamado
```

---

## 6. Sistema de Autenticação em Detalhes

### Diagrama do fluxo completo de autenticação

```
┌─────────────────────────────────────────────────────────────┐
│                        REGISTRO                             │
│  POST /auth/register → hash senha → salva user →           │
│  gera tokens → salva refresh no banco → retorna tokens     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                          LOGIN                              │
│  POST /auth/login → verifica senha → gera tokens →         │
│  salva refresh no banco → retorna tokens                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  REQUISIÇÃO AUTENTICADA                     │
│  GET /users → middleware auth → verifica JWT →             │
│  injeta req.user → controller executa                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                RENOVAÇÃO (TOKEN EXPIRADO)                   │
│  POST /auth/refresh → verifica refresh token →             │
│  valida no banco → deleta o antigo →                       │
│  gera novo par → salva novo refresh → retorna              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         LOGOUT                              │
│  POST /auth/logout → deleta refresh token do banco         │
│  POST /auth/logout-all (protegido) → deleta todos          │
└─────────────────────────────────────────────────────────────┘
```

### Como usar no frontend

```javascript
// 1. Login
const { data } = await axios.post('/auth/login', { email, password })
localStorage.setItem('accessToken', data.accessToken)
localStorage.setItem('refreshToken', data.refreshToken)

// 2. Requisição autenticada
const users = await axios.get('/users', {
  headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
})

// 3. Interceptor de renovação automática (padrão Axios)
axios.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401 && error.config?.url !== '/auth/refresh') {
    const { data } = await axios.post('/auth/refresh', {
      refreshToken: localStorage.getItem('refreshToken')
    })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    error.config.headers.Authorization = `Bearer ${data.accessToken}`
    return axios(error.config)
  }
  return Promise.reject(error)
})
```

---

## 7. Guia Prático: Adicionando o Recurso "Products"

Vamos adicionar um CRUD completo de produtos. Siga exatamente esta ordem.

### Passo 1 — Migration

```bash
npm run migrate:make create_products
```

Abra o arquivo criado em `database/migrations/` e edite:

```javascript
// database/migrations/003_create_products.js
export const up = (knex) =>
  knex.schema.createTable('products', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.text('description')
    table.decimal('price', 10, 2).notNullable()
    table.integer('stock').defaultTo(0)
    table.timestamps(true, true)
  })

export const down = (knex) => knex.schema.dropTable('products')
```

```bash
npm run migrate
```

### Passo 2 — Model

Crie `models/Product.js`:

```javascript
import db from '../database/connection.js'

const TABLE = 'products'

const Product = {
  findAll:  ()          => db(TABLE).select('*'),
  findById: (id) =>       db(TABLE).where({ id }).first(),
  create:   (data) =>     db(TABLE).insert(data),
  update:   (id, data) => db(TABLE).where({ id }).update(data),
  remove:   (id) =>       db(TABLE).where({ id }).delete(),
}

export default Product
```

### Passo 3 — Validators

Crie `validators/product.js`:

```javascript
import { z } from 'zod'

export const createProductSchema = z.object({
  name:        z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  description: z.string().optional(),
  price:       z.number().positive('Preço deve ser positivo'),
  stock:       z.number().int().min(0).optional(),
})

export const updateProductSchema = z.object({
  name:        z.string().min(2).optional(),
  description: z.string().optional(),
  price:       z.number().positive().optional(),
  stock:       z.number().int().min(0).optional(),
})
```

### Passo 4 — Controller

Crie `controllers/ProductController.js`:

```javascript
import Product from '../models/Product.js'

class ProductController {
  async index(req, res, next) {
    try {
      const products = await Product.findAll()
      res.json(products)
    } catch (err) {
      next(err)
    }
  }

  async show(req, res, next) {
    try {
      const product = await Product.findById(req.params.id)
      if (!product) return res.status(404).json({ error: 'Produto não encontrado' })
      res.json(product)
    } catch (err) {
      next(err)
    }
  }

  async store(req, res, next) {
    try {
      const [id] = await Product.create(req.validatedBody)
      res.status(201).json({ id })
    } catch (err) {
      next(err)
    }
  }

  async update(req, res, next) {
    try {
      const affected = await Product.update(req.params.id, req.validatedBody)
      if (!affected) return res.status(404).json({ error: 'Produto não encontrado' })
      res.json({ updated: true })
    } catch (err) {
      next(err)
    }
  }

  async destroy(req, res, next) {
    try {
      const affected = await Product.remove(req.params.id)
      if (!affected) return res.status(404).json({ error: 'Produto não encontrado' })
      res.json({ deleted: true })
    } catch (err) {
      next(err)
    }
  }
}

export default new ProductController()
```

### Passo 5 — Registrar as rotas

Abra `routes/routes.js` e adicione as linhas marcadas:

```javascript
import ProductController from '../controllers/ProductController.js'
import { createProductSchema, updateProductSchema } from '../validators/product.js'

// Adicione após as rotas de users:
router.get('/products',        auth,                               ProductController.index)
router.get('/products/:id',    auth,                               ProductController.show)
router.post('/products',       auth, validate(createProductSchema), ProductController.store)
router.put('/products/:id',    auth, validate(updateProductSchema), ProductController.update)
router.delete('/products/:id', auth,                               ProductController.destroy)
```

### Resultado: 5 novos endpoints funcionando

| Método | URL | Descrição |
|---|---|---|
| GET | `/products` | Lista todos os produtos |
| GET | `/products/:id` | Busca produto por ID |
| POST | `/products` | Cria novo produto |
| PUT | `/products/:id` | Atualiza produto |
| DELETE | `/products/:id` | Remove produto |

Todos exigem autenticação via header `Authorization: Bearer <token>`.

---

## 8. Boas Práticas e Decisões de Design

### Segurança

| Prática | Onde | Detalhe |
|---|---|---|
| **Bcrypt com 12 rounds** | `AuthController.register` | Salt rounds alto aumenta o custo computacional de ataques de dicionário |
| **Anti user enumeration** | `AuthController.login` | Mesma mensagem para e-mail não encontrado e senha errada |
| **JWT de curta duração** | `utils/tokens.js` | Access token expira em 15 min, limitando janela de exposição |
| **Rotação de refresh tokens** | `AuthController.refresh` | Token usado uma vez e invalidado, mitiga roubo |
| **Headers HTTP defensivos** | `index.js` (Helmet) | Remove X-Powered-By, adiciona CSP, HSTS, X-Frame-Options |
| **CORS configurável** | `index.js` | Aceita apenas a origem definida em `ALLOWED_ORIGIN` |
| **Rate limiting duplo** | Rotas de auth | 10 req/15min em auth vs 100/15min global |
| **Validação no servidor** | `middlewares/validate.js` | Dados nunca chegam ao controller sem validação |

### Tratamento de Erros

```
try/catch em todo controller
        │
        └── next(err)
                │
                └── Error handler global em index.js
                        │
                        └── res.status(err.status || 500).json({ error: ... })
```

Esse padrão garante que **nenhum erro não tratado chegue ao cliente** como HTML de stack trace ou crash silencioso.

### Escalabilidade

- **Sem estado no servidor:** JWTs são verificados sem consulta ao banco (exceto refresh tokens). Isso permite rodar múltiplas instâncias da API sem compartilhamento de sessão.
- **Pool de conexões:** O Knex gerencia um pool interno de conexões MySQL, evitando abrir/fechar conexões a cada requisição.
- **Separação de responsabilidades:** Adicionar um novo recurso nunca exige alterar código existente — apenas criar novos arquivos e registrar rotas.

### Convenções de resposta HTTP

| Situação | Status |
|---|---|
| Sucesso com dados | `200 OK` |
| Recurso criado | `201 Created` |
| Dados inválidos | `422 Unprocessable Entity` |
| Não autenticado | `401 Unauthorized` |
| Recurso já existe | `409 Conflict` |
| Não encontrado | `404 Not Found` |
| Erro interno | `500 Internal Server Error` |

---

## 9. Referência Rápida de Endpoints

### Autenticação

| Método | URL | Auth | Body |
|---|---|---|---|
| POST | `/auth/register` | — | `{ name, email, password }` |
| POST | `/auth/login` | — | `{ email, password }` |
| POST | `/auth/refresh` | — | `{ refreshToken }` |
| POST | `/auth/logout` | — | `{ refreshToken }` |
| POST | `/auth/logout-all` | Bearer | — |

### Usuários

| Método | URL | Auth | Body |
|---|---|---|---|
| GET | `/users` | Bearer | — |
| GET | `/users/:id` | Bearer | — |
| POST | `/users` | Bearer | `{ name, email, password }` |
| PUT | `/users/:id` | Bearer | `{ name?, email? }` |
| DELETE | `/users/:id` | Bearer | — |

### Health Check

| Método | URL | Auth | Resposta |
|---|---|---|---|
| GET | `/` | — | `{ message: 'API funcionando!' }` |

---

*Este guia cobre 100% da base atual. Para evoluir o projeto, siga sempre o padrão de 5 passos da seção 7: migration → model → validator → controller → rota.*
