# Fullstack Week - Donalds

Este projeto faz parte da **Fullstack Week** e tem como objetivo criar um sistema de pedidos para restaurantes utilizando **Next.js**, **Prisma**, **PostgreSQL (NeonDB)** e **ShadCN**.

## 🚀 Tecnologias Utilizadas

- [Next.js 15.1.6](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL (NeonDB)](https://neon.tech/)
- [ShadCN UI](https://ui.shadcn.com/)

## 📋 Como Rodar o Projeto na Sua Máquina

Caso deseje clonar este repositório e executar o projeto localmente, siga os passos abaixo:

### 1️⃣ Clone o repositório
```sh
git clone https://github.com/leomatiazzz/fullstackweek-donalds.git
cd fullstackweek-donalds
```

### 2️⃣ Instale o Next.js na versão correta
Para evitar problemas de compatibilidade, instale o Next.js com o comando:
```sh
npx create-next-app@15.1.6 .
```
> **Nota:** Responda **sim** para todas as perguntas no terminal, exceto para **Turbopack** e **import alias**, a menos que queira utilizá-los.

### 3️⃣ Configure o banco de dados (PostgreSQL no NeonDB)
Crie um arquivo `.env` na raiz do projeto e adicione sua string de conexão ao banco de dados do **NeonDB**.
```sh
DATABASE_URL="sua_string_de_conexao"
```
> **Nota:** O PostgreSQL utilizado pode ser acessado através do [Neon Console](https://neon.tech/).

### 4️⃣ Execute a migração do Prisma
```sh
npx prisma format
npx prisma migrate dev
```

### 5️⃣ (Opcional) Instale os componentes do ShadCN
Se precisar instalar os componentes do **ShadCN**, execute:
```sh
npx shadcn@2.3.0 init
```
Para adicionar novos componentes, utilize o seguinte comando, sempre na versão 2.3.0:
```sh
npx shadcn@2.3.0 add [componente_a_ser_usado]
```

### 6️⃣ Inicie o projeto
```sh
npm run dev
```
O projeto estará disponível em `http://localhost:3000`

## 📱 Melhor visualização
A aplicação ainda **não está otimizada para desktop**, então recomenda-se visualizá-la em um **dispositivo móvel** ou utilizando o **DevTools do navegador** para simular um **layout responsivo**.

## 📜 Licença
Este projeto foi desenvolvido apenas para fins de aprendizado e estudo.

---
**Desenvolvido por [leomatiazzz](https://github.com/leomatiazzz)** 🚀


