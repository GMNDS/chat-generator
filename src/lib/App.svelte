<script lang="ts">
  import Chat from './components/Chat.svelte';
  import CharacterManager from './components/CharacterManager.svelte';
  import MessageEditor from './components/MessageEditor.svelte';
  import SettingsPanel from './components/SettingsPanel.svelte';
  import ExportButton from './components/ExportButton.svelte';
  import { users, messages, currentUserId, selectedUserIds, wallpaper, groupSettings, phoneTheme, clearState } from './stores';

  // Estado local para subscriptions
  let localUsers = $state<Array<{ id: string; name: string; color: string; avatar?: string | null }>>([]);
  let localMessages = $state<Array<{ id: string; text: string; userId: string; createdAt: number; type?: 'text' | 'image'; image?: string | null }>>([]);
  let localCurrentUserId = $state('');
  let localSelectedUserIds = $state<string[]>([]);
  let localWallpaper = $state<string | null>(null);
  let localGroupSettings = $state<{ name: string; avatar?: string | null }>({ name: 'Gossip Girl', avatar: null });
  let localPhoneTheme = $state<{ frameColor1: string; frameColor2: string; screenBgColor: string; screenBgImage?: string | null; frameGradientAngle: number }>({
    frameColor1: '#667eea',
    frameColor2: '#764ba2',
    screenBgColor: '#f0f4f8',
    screenBgImage: null,
    frameGradientAngle: 135,
  });

  let activeTab = $state('personagens'); // 'personagens', 'config', 'mensagens'

  // Subscriptions
  const unsubU = users.subscribe((u) => (localUsers = u));
  const unsubM = messages.subscribe((m) => (localMessages = m));
  const unsubC = currentUserId.subscribe((c) => (localCurrentUserId = c));
  const unsubS = selectedUserIds.subscribe((s) => (localSelectedUserIds = s));
  const unsubW = wallpaper.subscribe((w) => (localWallpaper = w));
  const unsubG = groupSettings.subscribe((g) => (localGroupSettings = g));
  const unsubT = phoneTheme.subscribe((t) => (localPhoneTheme = t));

  function onClearAll() {
    if (confirm('Limpar mensagens, usuários e configurações?')) {
      clearState();
    }
  }

  function handleExportError(detail: { message: string }) {
    alert(detail.message || 'Erro ao exportar imagem');
  }
</script>

<svelte:head>
  <title>Gossip Girl</title>
</svelte:head>

<style>
  .app {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(180deg, #eaf4ff 0%, #eef8ff 100%);
    min-height: 100vh;
  }
  @media (min-width: 1024px) {
    .app {
      grid-template-columns: 1fr 420px;
    }
  }

  .controls {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .header h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a202c;
    margin: 0;
  }

  .header span {
    font-size: 0.875rem;
    color: #718096;
  }


  .btn-group {
    display: flex;
    gap: 0.75rem;
  }


  .btn-secondary-lg {
    padding: 0.75rem 1.5rem;
    background: #e2e8f0;
    color: #4a5568;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-secondary-lg:hover {
    background: #cbd5e0;
  }


  .tabs-container {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #e2e8f0;
  }

  .tab-button {
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    color: #718096;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;
    margin-bottom: -2px;
  }

  .tab-button.active {
    color: #3182ce;
    border-bottom-color: #3182ce;
  }

  .tab-button:hover {
    color: #2c5aa0;
  }

  .tab-content {
    display: none;
  }

  .tab-content.active {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }


</style>

<div class="app">
  <div>
    <div class="controls">
      <div class="header">
        <h2>Gossip Girl</h2>
        <span>Crie e exporte conversas</span>
      </div>

      <!-- Abas -->
      <div class="tabs-container">
        <button class="tab-button {activeTab === 'personagens' ? 'active' : ''}" onclick={() => activeTab = 'personagens'}>👥 Personagens</button>
        <button class="tab-button {activeTab === 'config' ? 'active' : ''}" onclick={() => activeTab = 'config'}>⚙️ Configuração</button>
        <button class="tab-button {activeTab === 'mensagens' ? 'active' : ''}" onclick={() => activeTab = 'mensagens'}>💬 Mensagens</button>
      </div>

      <!-- Aba 1: Personagens -->
      <div class="tab-content {activeTab === 'personagens' ? 'active' : ''}">
        <CharacterManager />
      </div>

      <!-- Aba 2: Configuração -->
      <div class="tab-content {activeTab === 'config' ? 'active' : ''}">
        <SettingsPanel />
      </div>

      <!-- Aba 3: Mensagens -->
      <div class="tab-content {activeTab === 'mensagens' ? 'active' : ''}">
        <MessageEditor />
        <div class="btn-group" style="margin-top: 1rem;">
          <ExportButton onError={handleExportError} />
          <button class="btn-secondary-lg" onclick={onClearAll}>🗑️ Limpar Tudo</button>
        </div>
      </div>
    </div>
  </div>

  <div>
    <Chat messages={localMessages} users={localUsers} currentUserId={localCurrentUserId} selectedUserIds={localSelectedUserIds} wallpaper={localWallpaper} groupSettings={localGroupSettings} phoneTheme={localPhoneTheme} />
  </div>
</div>