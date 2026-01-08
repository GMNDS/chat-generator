<script lang="ts">
  import { users, currentUserId, wallpaper, groupSettings, phoneTheme, setCurrentUserId, setWallpaper, setGroupName, setGroupAvatar, setPhoneTheme } from '../stores';
  import AvatarUploader from './AvatarUploader.svelte';

  // Estado local
  let isEditingGroupName = $state(false);
  let editingGroupName = $state('');
  let localUsers = $state<Array<{ id: string; name: string; color: string; avatar?: string | null }>>([]);
  let localCurrentUserId = $state('');
  let localWallpaper = $state<string | null>(null);
  let localGroupSettings = $state<{ name: string; avatar?: string | null }>({ name: 'Meu Grupo', avatar: null });
  let localPhoneTheme = $state<{ frameColor1: string; frameColor2: string; screenBgColor: string; screenBgImage?: string | null; frameGradientAngle: number; displayTime?: string }>({
    frameColor1: '#667eea',
    frameColor2: '#764ba2',
    screenBgColor: '#f0f4f8',
    screenBgImage: null,
    frameGradientAngle: 135,
    displayTime: '9:41',
  });

  // Subscriptions
  const unsubU = users.subscribe((u) => (localUsers = u));
  const unsubC = currentUserId.subscribe((c) => (localCurrentUserId = c));
  const unsubW = wallpaper.subscribe((w) => (localWallpaper = w));
  const unsubG = groupSettings.subscribe((g) => (localGroupSettings = g));
  const unsubT = phoneTheme.subscribe((t) => (localPhoneTheme = t));

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

  function onDisplayTimeChange(event: Event) {
    const time = (event.target as HTMLInputElement).value;
    setPhoneTheme({ displayTime: time });
  }

</script>

<div class="config-section">
  <h3 style="margin: 0 0 1rem 0; font-size: 0.95rem; color: #2d3748; font-weight: 600;">👥 Grupo</h3>

  <div class="config-field">
    <div style="font-weight: 500; color: #4a5568; margin-bottom: 0.5rem;">Nome do Grupo</div>
    {#if isEditingGroupName}
      <div style="display: flex; gap: 0.5rem;">
        <input
          type="text"
          bind:value={editingGroupName}
          class="input-field"
          style="flex: 1;"
          placeholder="Nome do grupo"
        />
        <button type="button" class="icon-btn" onclick={saveGroupName} title="Salvar">✅</button>
        <button type="button" class="icon-btn" onclick={cancelEditGroupName} title="Cancelar">❌</button>
      </div>
    {:else}
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <button
          type="button"
          class="input-field"
          onclick={startEditGroupName}
          style="flex: 1; text-align: left; cursor: pointer; background: white; border: 1px solid #cbd5e0; border-radius: 6px; padding: 0.75rem; color: #2d3748; font-size: 0.95rem;"
        >
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

<hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e2e8f0;" />

<div class="config-section">
  <h3 style="margin: 0 0 1rem 0; font-size: 0.95rem; color: #2d3748; font-weight: 600;">👤 Usuário Principal</h3>

  <div class="config-field">
    <label for="current-user">Usuário Atual</label>
    <select id="current-user" bind:value={localCurrentUserId} onchange={() => setCurrentUserId(localCurrentUserId)}>
      {#each localUsers as user}
        <option value={user.id}>{user.name}</option>
      {/each}
    </select>
  </div>
</div>

<hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e2e8f0;" />

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

<hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e2e8f0;" />

<div class="config-section">
  <h3 style="margin: 0 0 1rem 0; font-size: 0.95rem; color: #2d3748; font-weight: 600;">🎨 Tema do Telefone</h3>

  <div class="config-field">
    <label for="frame-color-1">Cor do Frame 1</label>
    <div style="display: flex; gap: 0.5rem; align-items: center;">
      <input
        id="frame-color-1"
        type="color"
        value={localPhoneTheme?.frameColor1 ?? '#667eea'}
        onchange={onPhoneFrameColor1Change}
        style="width: 3rem; height: 2.5rem; border: none; border-radius: 6px; cursor: pointer;"
      />
      <span style="font-size: 0.85rem; color: #718096; font-family: monospace;">{localPhoneTheme?.frameColor1 ?? '#667eea'}</span>
    </div>
  </div>

  <div class="config-field">
    <label for="frame-color-2">Cor do Frame 2</label>
    <div style="display: flex; gap: 0.5rem; align-items: center;">
      <input
        id="frame-color-2"
        type="color"
        value={localPhoneTheme?.frameColor2 ?? '#764ba2'}
        onchange={onPhoneFrameColor2Change}
        style="width: 3rem; height: 2.5rem; border: none; border-radius: 6px; cursor: pointer;"
      />
      <span style="font-size: 0.85rem; color: #718096; font-family: monospace;">{localPhoneTheme?.frameColor2 ?? '#764ba2'}</span>
    </div>
  </div>

  <div class="config-field">
    <label for="gradient-angle">Ângulo do Gradiente</label>
    <div style="display: flex; gap: 0.5rem; align-items: center;">
      <input
        id="gradient-angle"
        type="range"
        min="0"
        max="360"
        value={localPhoneTheme?.frameGradientAngle ?? 135}
        onchange={onPhoneGradientAngleChange}
        style="flex: 1;"
      />
      <span style="font-size: 0.85rem; color: #718096; font-family: monospace; min-width: 3rem;">{localPhoneTheme?.frameGradientAngle ?? 135}°</span>
    </div>
  </div>

  <div class="config-field">
    <label for="screen-bg-color">Cor do Fundo da Tela</label>
    <div style="display: flex; gap: 0.5rem; align-items: center;">
      <input
        id="screen-bg-color"
        type="color"
        value={localPhoneTheme?.screenBgColor ?? '#f0f4f8'}
        onchange={onPhoneScreenBgChange}
        style="width: 3rem; height: 2.5rem; border: none; border-radius: 6px; cursor: pointer;"
      />
      <span style="font-size: 0.85rem; color: #718096; font-family: monospace;">{localPhoneTheme?.screenBgColor ?? '#f0f4f8'}</span>
    </div>
  </div>

  <div class="config-field">
    <label for="display-time">Hora Exibida</label>
    <div style="display: flex; gap: 0.5rem; align-items: center;">
      <input
        id="display-time"
        type="time"
        value={localPhoneTheme?.displayTime ?? '9:41'}
        onchange={onDisplayTimeChange}
        style="padding: 0.625rem 1rem; border: 1px solid #cbd5e0; border-radius: 8px; font-size: 0.95rem;"
      />
      <span style="font-size: 0.85rem; color: #718096; font-family: monospace;">{localPhoneTheme?.displayTime ?? '9:41'}</span>
    </div>
    <div style="font-size: 0.75rem; color: #a0aec0; margin-top: 0.25rem;">Hora exibida no topo do telefone</div>
  </div>
</div>

<style>
  .config-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
</style>

