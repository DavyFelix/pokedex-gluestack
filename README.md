
# 📱 Pokedex – Aplicativo Mobile com React Native

## 📘 Trabalho Acadêmico

Aplicativo mobile desenvolvido como **trabalho acadêmico**, com o objetivo de aplicar conceitos de **desenvolvimento mobile**, **consumo de APIs**, **GraphQL**, **gerenciamento de estado** e **notificações locais**.

---

## 🎯 Objetivo do Projeto

Desenvolver um aplicativo mobile utilizando **React Native com Expo** que permita ao usuário:

- Visualizar informações detalhadas sobre Pokémon
- Consultar tipos, evoluções, resistências e fraquezas
- Marcar Pokémon como favoritos
- Receber notificações ao adicionar um Pokémon aos favoritos

---

## 🛠️ Tecnologias Utilizadas

- React Native  
- Expo  
- TypeScript  
- GraphQL  
- Apollo Client  
- Redux Toolkit  
- Redux Persist  
- Expo Notifications  
- Expo Device  
- React Navigation  
- Expo Linear Gradient  

---

## 🌐 Fonte de Dados

Os dados dos Pokémon são obtidos por meio da API:

- GraphQL Pokémon API  
  https://graphql-pokemon2.vercel.app

---

## 📂 Estrutura do Projeto

```
pokedex-gluestack/
│
├── src/
│   ├── components/
│   ├── graphql/
│   ├── screens/
│   ├── services/
│   ├── store/
│   ├── theme/
│   └── types/
│
├── App.tsx
├── app.json
├── package.json
└── README.md
```

---

## ⭐ Funcionalidades

- Listagem de Pokémon
- Tela de detalhes
- Sistema de favoritos
- Persistência local de dados
- Notificações locais
- Tema claro e escuro
- Animações e Skeleton loading

---

## 🔔 Notificações

O aplicativo utiliza notificações locais para informar o usuário quando um Pokémon é adicionado aos favoritos.

⚠️ Funciona apenas em dispositivos físicos.

---

## ⚙️ Requisitos

- Node.js (LTS)
- Expo CLI
- Java JDK 17
- Android Studio
- Android SDK + ADB

---

## ▶️ Execução do Projeto

```bash
npm install
npx expo start
```

Para Android:

```bash
npx expo run:android
```

---

## 🧑‍🎓 Autor

**Davy de Souza Felix Pereira**

---

## 🏫 Instituição

INFNET

---

## 📄 Considerações Finais

Este projeto permitiu a aplicação prática dos conceitos estudados em sala de aula, integrando desenvolvimento mobile, APIs externas, estado global e recursos nativos do dispositivo.
