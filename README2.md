# Full Stack Week Donalds 🍔🚀

![Next.js](https://img.shields.io/badge/Next.js-13-blue) ![Prisma](https://img.shields.io/badge/Prisma-ORM-green) ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-%2338B2AC.svg)

## 📌 Sobre o Projeto

O **Full Stack Week Donalds** é um projeto desenvolvido durante a Full Stack Week, simulando um sistema de pedidos para um restaurante fast-food. Utilizando tecnologias modernas como **Next.js, Prisma, Tailwind CSS e PostgreSQL**, o objetivo é proporcionar uma experiência prática no desenvolvimento full stack.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Next.js (App Router)
- **Estilização:** Tailwind CSS
- **Backend:** API Routes no Next.js
- **Banco de Dados:** PostgreSQL + Prisma ORM + Neon Console
- **Autenticação:** (Adicionar se houver autenticação)
- **Componentes UI:** Shadcn/ui

## 📷 Demonstração

(Adicionar imagens ou GIFs do funcionamento do projeto)

## 🚀 Como Rodar o Projeto

### 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

### 🔽 Clonando o Repositório

```bash
  git clone https://github.com/leomatiazzz/fullstackweek-donalds.git
  cd fullstackweek-donalds
```

### 📦 Instalando Dependências

```bash
  npm install  # ou yarn install
```

### ⚙️ Configurando Banco de Dados

1. Crie um banco de dados no PostgreSQL
2. Configure o arquivo **.env** com as credenciais do banco de dados:

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
```

3. Execute as migrações do Prisma:

```bash
  npx prisma migrate dev
```

### 🏃 Executando o Projeto

```bash
  npm run dev  # ou yarn dev
```

A aplicação estará rodando em **http://localhost:3000/fsw-donalds** 🚀

## 📌 Funcionalidades

- [x] Listagem de produtos do restaurante 🍔
- [x] Adição de produtos ao carrinho 🛒
- [x] Finalização de pedidos ✅
- [x] Consulta de pedidos pelo CPF 📋
- [ ] (Adicionar funcionalidades futuras se houver)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

Feito com 💙 por [leomatiazzz](https://github.com/leomatiazzz) 🚀

