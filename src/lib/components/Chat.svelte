<script lang="ts">
  import Message from './Message.svelte';
  import type { Message as MessageType, User, GroupSettings, PhoneTheme } from '$lib/stores';

  let { messages = [], users = [], currentUserId, selectedUserIds = [], wallpaper = null, groupSettings = { name: 'Meu Grupo', avatar: null }, phoneTheme = { frameColor1: '#667eea', frameColor2: '#764ba2', screenBgColor: '#f0f4f8', frameGradientAngle: 135 } }: { messages?: MessageType[]; users?: User[]; currentUserId: string; selectedUserIds?: string[]; wallpaper?: string | null; groupSettings?: GroupSettings; phoneTheme?: PhoneTheme } = $props();

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

</script>

<style>
  .frame {
    width: 360px; /* smartphone aspect */
    height: 720px;
    border-radius: 36px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 14px 40px rgba(24,39,77,0.18), inset 0 0 0 1px rgba(255,255,255,0.6);
    border: 1px solid rgba(0,0,0,0.06);
    position: relative;
    overflow: hidden;
  }
  .frame::before { content: ''; position:absolute; top:8px; left:50%; transform:translateX(-50%); width:90px; height:6px; background: rgba(0,0,0,0.06); border-radius:8px; }
  .frame-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 0;
  }
  .screen {
    flex: 1;
    overflow-y: auto;
    scrollbar-gutter: stable; /* preserva espaço para a scrollbar e evita shift no export */
    padding: 16px 10px;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 16px;
    box-shadow: inset 0 2px 6px rgba(24,39,77,0.03);
  }
  .header { display:flex; align-items:center; gap:8px; padding:10px 14px; font-weight:600; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.08) 100%); backdrop-filter: blur(8px); margin: -14px -14px 0 -14px; margin-bottom: 0; border-radius: 36px 36px 0 0; }
  .status { display:flex; align-items:center; gap:8px; color:#fff; font-size:13px; text-shadow: 0 1px 3px rgba(0,0,0,0.3); }
  .title { flex:1; text-align:center; font-weight:700; color:#fff; text-shadow: 0 1px 3px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; gap:8px; }
  .title .head-avatar { width:34px; height:34px; border-radius:50%; object-fit:cover; box-shadow:0 6px 14px rgba(19,40,77,0.08); }
  .empty { flex: 1; display:flex; align-items:center; justify-content:center; color:#bbb; }

  /* Ajustes para o exterior do telefone */
  .phone-wrap { display:flex; align-items:center; justify-content:center; padding:24px; }

  /* esconder elementos ao exportar (algumas vezes precisamos esconder mais elementos) */
  /* Quando exportamos, escondemos elementos de UI que nao devem aparecer na imagem
     Usar visibility + opacity preserva o espaço evitando o "shift" horizontal.
  */
  :global(#phone-frame[data-exporting='true'] .no-export) {
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
</style>

<div class="phone-wrap">
  <div id="phone-frame" class="frame">
    <div class="frame-background" style="background: linear-gradient({phoneTheme?.frameGradientAngle ?? 135}deg, {phoneTheme?.frameColor1 ?? '#667eea'} 0%, {phoneTheme?.frameColor2 ?? '#764ba2'} 100%);"></div>
    <div style="position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%;">
      <div class="header">
        <div class="status">9:41 <span style="opacity:0.7"> ⚡︎ ▂▂▂ </span></div>
        <div class="title">{#if groupSettings?.avatar}<img class="head-avatar" src={groupSettings.avatar} alt="group" />{/if}{groupSettings?.name ?? 'Chat'}</div>
        <div class="status">🔍 <span style="opacity:0.7"> ▢</span></div>
      </div>
      <div class="screen" style="background-color: {phoneTheme?.screenBgColor ?? '#f0f4f8'}; background: {wallpaper ? `url(${wallpaper}) center/cover` : `{phoneTheme?.screenBgColor ?? '#f0f4f8'}`};">
        {#if messages.filter(m => selectedUserIds.includes(m.userId)).length === 0}
          <div class="empty">Sem mensagens — adicione novas</div>
        {/if}
        {#each messages.filter(m => selectedUserIds.includes(m.userId)) as message (message.id)}
          {@const user = users.find(u => u.id === message.userId)}
          <Message
            {message}
            isCurrentUser={message.userId === currentUserId}
            userColor={user?.color ?? '#ddd'}
            userName={user?.name ?? 'Unknown'}
            avatar={user?.avatar ?? null}
            on:remove={(e) => dispatch('remove', e.detail)}
            on:edit={(e) => dispatch('edit', e.detail)}
          />
        {/each}
      </div>
      <div style="display:flex;align-items:center;justify-content:center; padding-top:8px;">
        <div class="home-bar no-export" style="width:64px;height:6px;border-radius:10px;background:rgba(0,0,0,0.07);"></div>
      </div>
    </div>
  </div>
</div>