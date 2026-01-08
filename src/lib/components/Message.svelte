<script lang="ts">
  import type { Message as MessageType } from '$lib/stores';
  import { darken } from '../utils/colorUtils';
  import { isEmojiOnly } from '../utils/validation';

  let { 
    message, 
    isCurrentUser, 
    userColor, 
    userName, 
    avatar = null 
  }: {
    message: MessageType;
    isCurrentUser: boolean;
    userColor: string;
    userName: string;
    avatar?: string | null;
  } = $props();

</script>

<style>
  .message-row {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    margin: 0.6rem 0;
    position: relative;
  }
  .left { justify-content: flex-start; }
  .right { justify-content: flex-end; }
  .bubble {
    max-width: 80%;
    padding: 0.7rem 0.9rem;
    border-radius: 18px;
    line-height: 1.4;
    position: relative;
    box-shadow: 0 4px 12px rgba(14, 35, 77, 0.06);
    font-size: 0.9rem;
    display: inline-block;
    width: auto;
  }
  .bubble.left { border-bottom-left-radius: 6px; }
  .bubble.right { border-bottom-right-radius: 6px; }
  
  /* Balões com imagem usam padding menor */
  .bubble.has-image {
    padding: 0.2rem;
    overflow: hidden;
  }
  
  /* Texto normal com tamanho padrão */
  .bubble-text {
    word-wrap: break-word;
    overflow-wrap: break-word;
    display: block;
  }
  
  /* Apenas mensagens com 1-3 emojis ficam grandes (estilo WhatsApp) */
  .bubble-text.emoji-only {
    font-size: 3rem;
    line-height: 1.2;
  }
  
  /* Imagens dentro das bolhas - 100% da largura do balão */
  .bubble img {
    width: 100%;
    height: auto;
    max-height: 400px;
    display: block;
    object-fit: contain;
    border-radius: inherit;
  }
  
  /* Garantir proporções corretas na exportação */
  :global(#phone-frame[data-exporting='true']) .bubble {
    max-width: 80% !important;
    transform: none !important;
  }
  
  :global(#phone-frame[data-exporting='true']) .bubble img {
    width: 100% !important;
  }

  /* normalizar tipografia em px durante export para fidelidade visual */
  :global(#phone-frame[data-exporting='true']) .bubble-text:not(.emoji-only) {
    font-size: 14px !important;
    line-height: 20px !important;
    margin-top: 0 !important;
  }
  .avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid white; box-shadow: 0 4px 8px rgba(19,40,77,0.08); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
  .message-row.left .avatar { border-color: rgba(9,32,82,0.06); }
  .message-row.right .avatar { border-color: #fff; }
  .bubble-wrap { display:flex; align-items:flex-start; gap:0.4rem; position:relative; }
  .message-row.right .bubble-wrap { justify-content:flex-end; }
  /* Em export, deixar ações invisíveis mas manter espaço salvo (evitar shift de layout) */
  /* (ações removidas) */

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
        <div class="bubble left has-image" style="background: {userColor}; color: white;">
          <div class="tail-left" style="border-right-color: {userColor};"></div>
          <img src={message.image} alt="" />
        </div>
      {:else}
        <div class="bubble left" style="background: {userColor}; color: white;">
          <div class="tail-left" style="border-right-color: {userColor};"></div>
          <span class="bubble-text {isEmojiOnly(message.text) ? 'emoji-only' : ''}">{message.text}</span>
        </div>
      {/if}
    </div>
  {:else}
    <div class="bubble-wrap">
      {#if message.type === 'image' && message.image}
        <div class="bubble right has-image" style="background: linear-gradient(180deg, {userColor}, {darken(userColor, 50)}); color: white;">
          <div class="tail-right" style="border-left-color: {userColor};"></div>
          <img src={message.image} alt="" />
        </div>
      {:else}
        <div class="bubble right" style="background: linear-gradient(180deg, {userColor}, {darken(userColor, 50)}); color: white;">
          <div class="tail-right" style="border-left-color: {userColor};"></div>
          <span class="bubble-text {isEmojiOnly(message.text) ? 'emoji-only' : ''}">{message.text}</span>
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
