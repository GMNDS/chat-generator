# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## ChatGenerator (implementação de exemplo)

O projeto inclui uma implementação de um gerador de conversa estilo celular em `src/lib`:

- `src/lib/App.svelte` — layout principal e controlador
- `src/lib/components/Chat.svelte` — componente que desenha a moldura do telefone e lista de mensagens
- `src/lib/components/Message.svelte` — um balão de mensagem
- `src/lib/components/AvatarUploader.svelte` — uploader de avatar com preview
- `src/lib/stores.ts` — store Svelte que gerencia avatars e mensagens com persistência em localStorage

Requisitos atendidos: upload e preview de avatar com URL.createObjectURL, edição/remoção/adição de mensagens, persistência local e exportação da conversa como PNG (html2canvas via CDN em `src/app.html`).

Para rodar em desenvolvimento:

```powershell
npm install
npm run dev
```

