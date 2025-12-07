<script lang="ts">
  import { onMount } from 'svelte';
  import Chat from './components/Chat.svelte';
  import AvatarUploader from './components/AvatarUploader.svelte';
  import { users, messages, currentUserId, selectedUserIds, wallpaper, groupSettings, phoneTheme, addMessage, addImageMessage, removeMessage, editMessage, addUser, setUserAvatar, updateUserName, setUserColor, removeUser, setWallpaper, setGroupName, setGroupAvatar, setPhoneTheme, clearState } from './stores';
  import type { Message as MessageType, User } from './stores';

  // Local state para o formulário
  let text = '';
  let selectedUserId = '';
  let editingId: string | null = null;
  let localUsers: User[] = [];
  let localMessages: MessageType[] = [];
  let localCurrentUserId = '';
  let localSelectedUserIds: string[] = [];
  let localWallpaper: string | null = null;
  let localGroupSettings: { name: string; avatar?: string | null } = { name: 'Meu Grupo', avatar: null };
  let localPhoneTheme: { frameColor1: string; frameColor2: string; screenBgColor: string; screenBgImage?: string | null; frameGradientAngle: number } = { frameColor1: '#667eea', frameColor2: '#764ba2', screenBgColor: '#f0f4f8', screenBgImage: null, frameGradientAngle: 135 };
  let activeTab = 'personagens'; // 'personagens', 'config', 'mensagens'
  let editingUserId: string | null = null;
  let editingUserName: string = '';
  let editingGroupName = '';
  let isEditingGroupName = false;
  let editingUserColor: string | null = null;
  let editingUserColorValue = '';

  // Subscriptions
  const unsubU = users.subscribe((u) => (localUsers = u));
  const unsubM = messages.subscribe((m) => (localMessages = m));
  const unsubC = currentUserId.subscribe((c) => (localCurrentUserId = c));
  const unsubS = selectedUserIds.subscribe((s) => (localSelectedUserIds = s));
  const unsubW = wallpaper.subscribe((w) => (localWallpaper = w));
  const unsubG = groupSettings.subscribe((g) => (localGroupSettings = g));
  const unsubT = phoneTheme.subscribe((t) => (localPhoneTheme = t));

  onMount(() => {
    selectedUserId = localCurrentUserId;
  });

  // Recebe evento do AvatarUploader e salva no store
  function onAvatarSet(event: CustomEvent) {
    const { userId, dataUrl } = event.detail;
    setUserAvatar(userId, dataUrl ?? null);
  }

  // Adiciona ou atualiza uma mensagem
  function onAddOrUpdate() {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (editingId) {
      editMessage(editingId, trimmed);
      editingId = null;
    } else {
      addMessage(trimmed, selectedUserId);
    }
    text = '';
  }

  // Remove mensagem por id
  function onRemove(id: string) {
    removeMessage(id);
    if (editingId === id) {
      editingId = null;
      text = '';
    }
  }

  function onEdit(message: MessageType) {
    editingId = message.id;
    text = message.text;
    selectedUserId = message.userId;
  }

  // Exporta a conversa como imagem PNG
  async function exportImage() {
    const el = document.getElementById('phone-frame');
    if (!el) return;
    const html2canvas = (window as any).html2canvas;
    if (!html2canvas) {
      alert('html2canvas não encontrado. Certifique-se de incluir o CDN em app.html.');
      return;
    }
    try {
      el.setAttribute('data-exporting', 'true');
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chat-export.png';
      a.click();
    } catch (e) {
      console.error(e);
      alert('Erro ao exportar imagem');
    }
    finally {
      el.removeAttribute('data-exporting');
    }
  }

  function onClearAll() {
    if (confirm('Limpar mensagens, usuários e configurações?')) {
      clearState();
    }
  }

  let newUserName = '';
  let newUserColor = '#ff0000';

  function addNewUser() {
    if (newUserName.trim()) {
      addUser(newUserName, newUserColor);
      newUserName = '';
    }
  }

  function toggleSelected(id: string) {
    selectedUserIds.update(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  }

  function startEditUserName(user: User) {
    editingUserId = user.id;
    editingUserName = user.name;
  }

  function saveUserName(userId: string) {
    if (editingUserName.trim()) {
      updateUserName(userId, editingUserName.trim());
    }
    editingUserId = null;
    editingUserName = '';
  }

  function cancelEditUserName() {
    editingUserId = null;
    editingUserName = '';
  }

  function startEditUserColor(userId: string, color: string) {
    editingUserColor = userId;
    editingUserColorValue = color;
  }

  function saveUserColor(userId: string) {
    if (editingUserColorValue.trim()) {
      setUserColor(userId, editingUserColorValue.trim());
    }
    editingUserColor = null;
    editingUserColorValue = '';
  }

  function cancelEditUserColor() {
    editingUserColor = null;
    editingUserColorValue = '';
  }

  function deleteUser(userId: string) {
    if (confirm('Tem certeza que deseja excluir este personagem? Todas as mensagens dele serão removidas.')) {
      removeUser(userId);
      if (editingUserId === userId) {
        editingUserId = null;
        editingUserName = '';
      }
    }
  }

  function onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && selectedUserId) {
      const reader = new FileReader();
      reader.onload = () => {
        addImageMessage(selectedUserId, reader.result as string);
        input.value = ''; // limpar input para permitir selecionar a mesma imagem novamente
      };
      reader.readAsDataURL(file);
    }
  }

  function startEditGroupName() {
    isEditingGroupName = true;
    editingGroupName = localGroupSettings?.name ?? 'Meu Grupo';
  }

  function saveGroupName() {
    if (editingGroupName.trim()) {
      setGroupName(editingGroupName.trim());
    }
    isEditingGroupName = false;
    editingGroupName = '';
  }

  function cancelEditGroupName() {
    isEditingGroupName = false;
    editingGroupName = '';
  }

  function onGroupAvatarSet(event: CustomEvent) {
    const { dataUrl } = event.detail;
    setGroupAvatar(dataUrl ?? null);
  }

  function onPhoneFrameColor1Change(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    setPhoneTheme({ frameColor1: color });
  }

  function onPhoneFrameColor2Change(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    setPhoneTheme({ frameColor2: color });
  }

  function onPhoneScreenBgChange(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    setPhoneTheme({ screenBgColor: color });
  }

  function onPhoneGradientAngleChange(event: Event) {
    const angle = parseInt((event.target as HTMLInputElement).value);
    setPhoneTheme({ frameGradientAngle: angle });
  }

  function onWallpaperSet(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setWallpaper(reader.result as string);
      reader.readAsDataURL(file);
    }
  }
</script>

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

  .users-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .user-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
  }

  .user-row:hover {
    background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .user-checkbox {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
    accent-color: #3182ce;
  }

  .user-avatar-display {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .user-name {
    font-weight: 600;
    font-size: 0.95rem;
    color: #2d3748;
  }

  .user-name:hover {
    background-color: rgba(49, 130, 206, 0.1);
    border-radius: 4px;
  }

  .user-actions {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
  }

  .btn-primary {
    padding: 0.625rem 1rem;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-primary:hover {
    background: #2c5aa0;
  }

  .config-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .config-field label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4a5568;
  }

  .config-field input,
  .config-field select {
    padding: 0.625rem 1rem;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    font-size: 0.95rem;
  }

  .config-field input:focus,
  .config-field select:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }

  .message-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message-textarea {
    padding: 1rem;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    resize: vertical;
    min-height: 5rem;
  }

  .message-textarea:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }

  .form-row {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
  }

  .form-field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-field label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4a5568;
  }

  .form-field select {
    padding: 0.625rem 1rem;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    font-size: 0.95rem;
  }

  .form-field select:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }

  .btn-group {
    display: flex;
    gap: 0.75rem;
  }

  .btn-primary-lg {
    padding: 0.75rem 1.5rem;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    flex: 1;
  }

  .btn-primary-lg:hover {
    background: #2c5aa0;
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

  .messages-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  .message-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f7fafc;
    border-radius: 10px;
    border-left: 4px solid #3182ce;
    transition: all 0.2s ease;
  }

  .message-item:hover {
    background: #edf2f7;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .message-avatar {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    flex-shrink: 0;
  }

  .message-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .message-author {
    font-weight: 600;
    font-size: 0.875rem;
    color: #2d3748;
  }

  .message-text {
    font-size: 0.9rem;
    color: #4a5568;
  }

  .message-actions-btn {
    display: flex;
    gap: 0.25rem;
    margin-left: auto;
  }

  .icon-btn {
    width: 1.75rem;
    height: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .icon-btn:hover {
    background: #e2e8f0;
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

  .add-user-form {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    background: #edf2f7;
    border-radius: 12px;
    border: 1px dashed #cbd5e0;
  }

  .input-field {
    padding: 0.625rem 1rem;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  .input-field:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }

  .color-picker {
    width: 2.5rem;
    height: 2.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

</style>

<div class="app">
  <div>
    <div class="controls">
      <div class="header">
        <h2>🎛️ Controle</h2>
        <span>Editor de Chat</span>
      </div>

      <!-- Abas -->
      <div class="tabs-container">
        <button class="tab-button {activeTab === 'personagens' ? 'active' : ''}" onclick={() => activeTab = 'personagens'}>👥 Personagens</button>
        <button class="tab-button {activeTab === 'config' ? 'active' : ''}" onclick={() => activeTab = 'config'}>⚙️ Configuração</button>
        <button class="tab-button {activeTab === 'mensagens' ? 'active' : ''}" onclick={() => activeTab = 'mensagens'}>💬 Mensagens</button>
      </div>

      <!-- Aba 1: Personagens -->
      <div class="tab-content {activeTab === 'personagens' ? 'active' : ''}">
        <div class="users-container">
          {#each localUsers as user}
            <div class="user-row">
              <input type="checkbox" class="user-checkbox" checked={localSelectedUserIds.includes(user.id)} onchange={() => toggleSelected(user.id)} />
              {#if user.avatar}
                <img src={user.avatar} alt={user.name} style="width: 2.5rem; height: 2.5rem; border-radius: 50%; object-fit: cover;" />
              {:else}
                <div class="user-avatar-display" style="background-color: {user.color};">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              {/if}
              <div class="user-info">
                {#if editingUserId === user.id}
                  <input type="text" bind:value={editingUserName} class="input-field" style="padding: 0.25rem 0.5rem;" />
                {:else}
                  <button type="button" class="user-name" onclick={() => startEditUserName(user)} style="cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: background-color 0.2s; background: none; border: none; text-align: left;" title="Clique para editar">
                    {user.name}
                  </button>
                {/if}
              </div>
              <div class="user-actions">
                {#if editingUserId === user.id}
                  <button class="icon-btn" onclick={() => saveUserName(user.id)} title="Salvar">✅</button>
                  <button class="icon-btn" onclick={cancelEditUserName} title="Cancelar">❌</button>
                {:else if editingUserColor === user.id}
                  <input type="color" bind:value={editingUserColorValue} class="color-picker" />
                  <button class="icon-btn" onclick={() => saveUserColor(user.id)} title="Salvar cor">✅</button>
                  <button class="icon-btn" onclick={cancelEditUserColor} title="Cancelar">❌</button>
                {:else}
                  <button class="icon-btn" onclick={() => startEditUserColor(user.id, user.color)} title="Mudar cor">🎨</button>
                  <button class="icon-btn" onclick={() => deleteUser(user.id)} title="Excluir personagem">🗑️</button>
                  <AvatarUploader userId={user.id} userName={user.name} current={user.avatar} on:set={onAvatarSet} />
                {/if}
              </div>
            </div>
          {/each}
        </div>
        <div class="add-user-form">
          <input class="input-field flex-1" bind:value={newUserName} placeholder="Nome do usuário" />
          <input type="color" class="color-picker" bind:value={newUserColor} />
          <button class="btn-primary" onclick={addNewUser}>➕ Adicionar</button>
        </div>
      </div>

      <!-- Aba 2: Configuração -->
      <div class="tab-content {activeTab === 'config' ? 'active' : ''}">
        <div class="config-section">
          <h3 style="margin: 0 0 1rem 0; font-size: 0.95rem; color: #2d3748; font-weight: 600;">👥 Grupo</h3>
          
          <div class="config-field">
            <div style="font-weight: 500; color: #4a5568; margin-bottom: 0.5rem;">Nome do Grupo</div>
            {#if isEditingGroupName}
              <div style="display: flex; gap: 0.5rem;">
                <input type="text" bind:value={editingGroupName} class="input-field" style="flex: 1;" placeholder="Nome do grupo" />
                <button type="button" class="icon-btn" onclick={saveGroupName} title="Salvar">✅</button>
                <button type="button" class="icon-btn" onclick={cancelEditGroupName} title="Cancelar">❌</button>
              </div>
            {:else}
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <button type="button" class="input-field" onclick={startEditGroupName} style="flex: 1; text-align: left; cursor: pointer; background: white; border: 1px solid #cbd5e0; border-radius: 6px; padding: 0.75rem; color: #2d3748; font-size: 0.95rem;">
                  {localGroupSettings?.name ?? 'Meu Grupo'}
                </button>
                <span style="font-size: 0.85rem; color: #718096;">✏️</span>
              </div>
            {/if}
          </div>

          <div class="config-field">
            <div style="font-weight: 500; color: #4a5568; margin-bottom: 0.5rem;">Avatar do Grupo</div>
            <AvatarUploader userId="group" userName={localGroupSettings?.name ?? 'Meu Grupo'} current={localGroupSettings?.avatar} on:set={onGroupAvatarSet} />
            {#if localGroupSettings?.avatar}
              <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #4a5568;">✅ Avatar do grupo definido</div>
            {/if}
          </div>
        </div>

        <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e2e8f0;">

        <div class="config-section">
          <h3 style="margin: 0 0 1rem 0; font-size: 0.95rem; color: #2d3748; font-weight: 600;">👤 Usuário Principal</h3>

          <div class="config-field">
            <label for="current-user">Usuário Atual</label>
            <select id="current-user" bind:value={localCurrentUserId}>
              {#each localUsers as user}
                <option value={user.id}>{user.name}</option>
              {/each}
            </select>
          </div>
        </div>

        <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e2e8f0;">

        <div class="config-section">
          <h3 style="margin: 0 0 1rem 0; font-size: 0.95rem; color: #2d3748; font-weight: 600;">🎨 Aparência</h3>

          <div class="config-field">
            <label for="wallpaper">Wallpaper do Chat</label>
            <input id="wallpaper" type="file" accept="image/*" onchange={onWallpaperSet} />
            {#if localWallpaper}
              <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #4a5568;">✅ Wallpaper selecionado</div>
            {/if}
          </div>
        </div>

        <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e2e8f0;">

        <div class="config-section">
          <h3 style="margin: 0 0 1rem 0; font-size: 0.95rem; color: #2d3748; font-weight: 600;">🎨 Tema do Telefone</h3>

          <div class="config-field">
            <label for="frame-color-1">Cor do Frame 1</label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <input id="frame-color-1" type="color" value={localPhoneTheme?.frameColor1 ?? '#667eea'} onchange={onPhoneFrameColor1Change} style="width: 3rem; height: 2.5rem; border: none; border-radius: 6px; cursor: pointer;" />
              <span style="font-size: 0.85rem; color: #718096; font-family: monospace;">{localPhoneTheme?.frameColor1 ?? '#667eea'}</span>
            </div>
          </div>

          <div class="config-field">
            <label for="frame-color-2">Cor do Frame 2</label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <input id="frame-color-2" type="color" value={localPhoneTheme?.frameColor2 ?? '#764ba2'} onchange={onPhoneFrameColor2Change} style="width: 3rem; height: 2.5rem; border: none; border-radius: 6px; cursor: pointer;" />
              <span style="font-size: 0.85rem; color: #718096; font-family: monospace;">{localPhoneTheme?.frameColor2 ?? '#764ba2'}</span>
            </div>
          </div>

          <div class="config-field">
            <label for="gradient-angle">Ângulo do Gradiente</label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <input id="gradient-angle" type="range" min="0" max="360" value={localPhoneTheme?.frameGradientAngle ?? 135} onchange={onPhoneGradientAngleChange} style="flex: 1;" />
              <span style="font-size: 0.85rem; color: #718096; font-family: monospace; min-width: 3rem;">{localPhoneTheme?.frameGradientAngle ?? 135}°</span>
            </div>
          </div>

          <div class="config-field">
            <label for="screen-bg-color">Cor do Fundo da Tela</label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <input id="screen-bg-color" type="color" value={localPhoneTheme?.screenBgColor ?? '#f0f4f8'} onchange={onPhoneScreenBgChange} style="width: 3rem; height: 2.5rem; border: none; border-radius: 6px; cursor: pointer;" />
              <span style="font-size: 0.85rem; color: #718096; font-family: monospace;">{localPhoneTheme?.screenBgColor ?? '#f0f4f8'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Aba 3: Mensagens -->
      <div class="tab-content {activeTab === 'mensagens' ? 'active' : ''}">
        <div class="message-form">
          <textarea class="message-textarea" id="text" bind:value={text} placeholder="Digite a mensagem..."></textarea>
          <div class="form-row">
            <div class="form-field">
              <label for="user-select">De</label>
              <select id="user-select" bind:value={selectedUserId}>
                {#each localUsers.filter(u => localSelectedUserIds.includes(u.id)) as user}
                  <option value={user.id}>{user.name}</option>
                {/each}
              </select>
            </div>
            <button class="btn-primary" onclick={onAddOrUpdate}>
              {editingId ? '✏️ Atualizar' : '➕ Adicionar'}
            </button>
            {#if editingId}
              <button class="btn-secondary-lg" onclick={() => { editingId = null; text = ''; }}>❌ Cancelar</button>
            {/if}
          </div>
          <div class="form-row">
            <input type="file" accept="image/*" onchange={onImageSelected} style="flex: 1; padding: 0.625rem 1rem; border: 1px solid #cbd5e0; border-radius: 8px; cursor: pointer;" title="Adicionar foto ao chat" />
          </div>
          <div class="btn-group">
            <button class="btn-primary-lg" onclick={exportImage}>📸 Exportar PNG</button>
            <button class="btn-secondary-lg" onclick={onClearAll}>🗑️ Limpar Tudo</button>
          </div>
        </div>

        <!-- Lista de Mensagens compacta -->
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
          <div class="messages-header">
            📝 Mensagens ({localMessages.filter(m => localSelectedUserIds.includes(m.userId)).length})
          </div>
          {#if localMessages.filter(m => localSelectedUserIds.includes(m.userId)).length === 0}
            <div style="text-align: center; color: #a0aec0; padding: 1rem; font-size: 0.9rem;">
              Nenhuma mensagem adicionada
            </div>
          {:else}
            <div style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 15rem; overflow-y: auto;">
              {#each localMessages.filter(m => localSelectedUserIds.includes(m.userId)) as m}
                {@const user = localUsers.find(u => u.id === m.userId)}
                <div class="message-item" style="border-left-color: {user?.color || '#ddd'}">
                  {#if user?.avatar}
                    <img src={user.avatar} alt={user.name} class="message-avatar" />
                  {:else}
                    <div class="message-avatar" style="background-color: {user?.color || '#cbd5e0'};">
                      {user?.name.charAt(0).toUpperCase() || '?'}
                    </div>
                  {/if}
                  <div class="message-content">
                    <div class="message-author">{user?.name || 'Desconhecido'}</div>
                    <div class="message-text">{m.text}</div>
                  </div>
                  <div class="message-actions-btn">
                    <button class="icon-btn" onclick={() => onEdit(m)} title="Editar">✏️</button>
                    <button class="icon-btn" onclick={() => onRemove(m.id)} title="Remover">🗑️</button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div>
    <Chat messages={localMessages} users={localUsers} currentUserId={localCurrentUserId} selectedUserIds={localSelectedUserIds} wallpaper={localWallpaper} groupSettings={localGroupSettings} phoneTheme={localPhoneTheme} on:remove={(e) => onRemove(e.detail)} on:edit={(e) => onEdit(e.detail)} />
  </div>
</div>