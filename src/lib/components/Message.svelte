<script lang="ts">
  import type { Message as MessageType } from '$lib/stores';

  let { message, isCurrentUser, userColor, userName, avatar = null }: { message: MessageType; isCurrentUser: boolean; userColor: string; userName: string; avatar?: string | null } = $props();

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // Dispara evento para pedir remoção da mensagem
  function remove() {
    dispatch('remove', message.id);
  }
  // Dispara evento para começar edição da mensagem
  function startEdit() {
    dispatch('edit', message);
  }

  function darken(color: string, amount: number) {
    const num = parseInt(color.slice(1), 16);
    const r = Math.max((num >> 16) - amount, 0);
    const g = Math.max((num >> 8 & 0xff) - amount, 0);
    const b = Math.max((num & 0xff) - amount, 0);
    return `rgb(${r},${g},${b})`;
  }
</script>

<style>
  .message-row {
    display: flex;
    gap: 0.75rem;
    align-items: flex-end;
    margin: 0.6rem 0;
    position: relative;
  }
  .left { justify-content: flex-start; }
  .right { justify-content: flex-end; }
  .bubble {
    max-width: 72%;
    padding: 0.7rem 0.9rem;
    border-radius: 18px;
    line-height: 1.25;
    position: relative;
    box-shadow: 0 4px 12px rgba(14, 35, 77, 0.06);
  }
  .bubble.left { border-bottom-left-radius: 6px; }
  .bubble.right { border-bottom-right-radius: 6px; }
  .avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid white; box-shadow: 0 4px 8px rgba(19,40,77,0.08); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
  .message-row.left .avatar { border-color: rgba(9,32,82,0.06); }
  .message-row.right .avatar { border-color: #fff; }
  .bubble-wrap { display:flex; align-items:center; gap:0.4rem; position:relative; }
  .actions { display:flex; gap:0.25rem; margin-left:0.5rem; opacity:0; transform: translateY(2px); transition: opacity 150ms ease, transform 150ms ease; min-width: 88px; justify-content: flex-end; }
  .actions button { background: white; border-radius:8px; padding:6px; border: none; box-shadow: 0 4px 8px rgba(19,40,77,0.06); }
  .message-row:hover .actions { opacity:1; transform: translateY(0); }
  /* Em export, deixar ações invisíveis mas manter espaço salvo (evitar shift de layout) */
  :global(#phone-frame[data-exporting='true']) .actions { opacity:0 !important; visibility:hidden !important; }

  /* Cauda do balão */
  .tail-left { position: absolute; left: -8px; top: 10px; width: 0; height: 0; border: 8px solid transparent; }
  .tail-right { position: absolute; right: -8px; top: 10px; width: 0; height: 0; border: 8px solid transparent; }
  /* tratar corretamente overflow horizontal para evitar cut-off na cauda */
</style>

<div class="message-row {isCurrentUser ? 'right' : 'left'}">
  {#if !isCurrentUser}
    {#if avatar}
      <img class="avatar" src={avatar} alt="avatar" />
    {:else}
      <div class="avatar" style="background: {userColor};">{userName.charAt(0).toUpperCase()}</div>
    {/if}
    <div class="bubble-wrap">
      {#if message.type === 'image' && message.image}
        <div class="bubble left" style="background: {userColor}; color: white; padding: 3px;">
          <div class="tail-left" style="border-right-color: {userColor};"></div>
          <img src={message.image} alt="" style="border-radius: 14px; width: 160px; height: auto; max-height: 200px; display: block; object-fit: cover;" />
        </div>
      {:else}
        <div class="bubble left" style="background: {userColor}; color: white;">
          <div class="tail-left" style="border-right-color: {userColor};"></div>
          {message.text}
        </div>
      {/if}
      <div class="actions no-export">
        <button onclick={startEdit} title="Editar">✏️</button>
        <button onclick={remove} title="Remover">🗑️</button>
      </div>
    </div>
  {:else}
    <div class="bubble-wrap">
      <div class="actions no-export">
        <button onclick={startEdit} title="Editar">✏️</button>
        <button onclick={remove} title="Remover">🗑️</button>
      </div>
      {#if message.type === 'image' && message.image}
        <div class="bubble right" style="background: linear-gradient(180deg, {userColor}, {darken(userColor, 50)}); color: white; padding: 3px;">
          <div class="tail-right" style="border-left-color: {userColor};"></div>
          <img src={message.image} alt="" style="border-radius: 14px; width: 160px; height: auto; max-height: 200px; display: block; object-fit: cover;" />
        </div>
      {:else}
        <div class="bubble right" style="background: linear-gradient(180deg, {userColor}, {darken(userColor, 50)}); color: white;">
          <div class="tail-right" style="border-left-color: {userColor};"></div>
          {message.text}
        </div>
      {/if}
    </div>
    {#if avatar}
      <img class="avatar" src={avatar} alt="avatar" />
    {:else}
      <div class="avatar" style="background: {userColor};">{userName.charAt(0).toUpperCase()}</div>
    {/if}
  {/if}
</div>
