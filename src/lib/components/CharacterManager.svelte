<script lang="ts">
  import { users, selectedUserIds, addUser, setUserAvatar, updateUserName, setUserColor, removeUser, setSelectedUserIds } from '../stores';
  import type { User } from '../types';
  import AvatarUploader from './AvatarUploader.svelte';

  // Estado local
  let editingUserId = $state<string | null>(null);
  let editingUserName = $state('');
  let editingUserColor = $state<string | null>(null);
  let editingUserColorValue = $state('');
  let newUserName = $state('');
  let newUserColor = $state('#ff0000');

  // Subscriptions
  let localUsers = $state<User[]>([]);
  let localSelectedUserIds = $state<string[]>([]);

  const unsubU = users.subscribe((u) => (localUsers = u));
  const unsubS = selectedUserIds.subscribe((s) => (localSelectedUserIds = s));

  // Callback do AvatarUploader para salvar no store
  function onAvatarSet(payload: { userId: string; dataUrl: string | null }) {
    const { userId, dataUrl } = payload;
    setUserAvatar(userId, dataUrl ?? null);
  }

  function addNewUser() {
    if (newUserName.trim()) {
      addUser(newUserName.trim(), newUserColor);
      newUserName = '';
    }
  }

  function toggleSelected(id: string) {
    const newIds = localSelectedUserIds.includes(id)
      ? localSelectedUserIds.filter((i) => i !== id)
      : [...localSelectedUserIds, id];
    setSelectedUserIds(newIds);
  }

  function startEditUserName(user: User) {
    editingUserId = user.id;
    editingUserName = user.name;
  }

  function handleUserNameKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      saveUserName(editingUserId!);
    } else if (event.key === 'Escape') {
      cancelEditUserName();
    }
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
</script>

<div class="users-container">
  {#each localUsers as user}
    <div class="user-row">
      <input
        type="checkbox"
        class="user-checkbox"
        checked={localSelectedUserIds.includes(user.id)}
        onchange={() => toggleSelected(user.id)}
      />
      {#if user.avatar}
        <img src={user.avatar} alt={user.name} style="width: 2.5rem; height: 2.5rem; border-radius: 50%; object-fit: cover;" />
      {:else}
        <div class="user-avatar-display" style="background-color: {user.color};">
          {user.name.charAt(0).toUpperCase()}
        </div>
      {/if}
      <div class="user-info">
        {#if editingUserId === user.id}
          <input
            type="text"
            bind:value={editingUserName}
            onkeydown={handleUserNameKeydown}
            class="input-field"
            style="padding: 0.25rem 0.5rem;"
          />
        {:else}
          <button
            type="button"
            class="user-name"
            onclick={() => startEditUserName(user)}
            style="cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: background-color 0.2s; background: none; border: none; text-align: left;"
            title="Clique para editar"
          >
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
          <AvatarUploader userId={user.id} userName={user.name} current={user.avatar} onSet={onAvatarSet} />
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

<style>
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

  .add-user-form {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    background: #edf2f7;
    border-radius: 12px;
    border: 1px dashed #cbd5e0;
  }

  .flex-1 {
    flex: 1;
  }
</style>

