<script lang="ts">
  import { messages, users, selectedUserIds, addMessage, editMessage, removeMessage, addImageMessage } from '../stores';
  import type { Message, User } from '../types';

  // Estado local
  let text = $state('');
  let selectedUserId = $state('');
  let editingId = $state<string | null>(null);

  // Subscriptions
  let localMessages = $state<Message[]>([]);
  let localUsers = $state<User[]>([]);
  let localSelectedUserIds = $state<string[]>([]);

  const unsubM = messages.subscribe((m) => (localMessages = m));
  const unsubU = users.subscribe((u) => (localUsers = u));
  const unsubS = selectedUserIds.subscribe((s) => (localSelectedUserIds = s));

  // Adiciona ou atualiza uma mensagem
  function onAddOrUpdate() {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (editingId) {
      editMessage(editingId, trimmed);
      editingId = null;
    } else {
      if (selectedUserId) {
        addMessage(trimmed, selectedUserId);
      }
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

  function onEdit(message: Message) {
    editingId = message.id;
    text = message.text;
    selectedUserId = message.userId;
  }

  function onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    if (!selectedUserId) {
      alert('Por favor, selecione um usuário primeiro');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        addImageMessage(selectedUserId, reader.result as string);
        input.value = ''; // limpar input para permitir selecionar a mesma imagem novamente
      }
    };
    reader.onerror = () => {
      alert('Erro ao ler o arquivo de imagem');
    };
    reader.readAsDataURL(file);
  }

  // Usuários disponíveis para seleção (apenas os selecionados)
  let availableUsers = $derived(localUsers.filter((u) => localSelectedUserIds.includes(u.id)));
  
  // Inicializar selectedUserId quando houver usuários disponíveis
  $effect(() => {
    if (availableUsers.length > 0 && !selectedUserId) {
      selectedUserId = availableUsers[0].id;
    }
  });
</script>

<div class="message-form">
  <textarea
    class="message-textarea"
    id="text"
    bind:value={text}
    placeholder="Digite a mensagem..."
    onkeydown={(e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onAddOrUpdate();
      }
    }}
  ></textarea>
  <div class="form-row">
    <div class="form-field">
      <label for="user-select">De</label>
      <select id="user-select" bind:value={selectedUserId} disabled={availableUsers.length === 0}>
        {#each availableUsers as user}
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
    <input
      type="file"
      accept="image/*"
      onchange={onImageSelected}
      style="flex: 1; padding: 0.625rem 1rem; border: 1px solid #cbd5e0; border-radius: 8px; cursor: pointer;"
      title={selectedUserId ? "Adicionar foto ao chat" : "Selecione um usuário primeiro"}
      disabled={!selectedUserId || availableUsers.length === 0}
    />
    {#if !selectedUserId && availableUsers.length > 0}
      <span style="font-size: 0.875rem; color: #e53e3e; margin-left: 0.5rem;">Selecione um usuário</span>
    {/if}
  </div>
</div>

<!-- Lista de Mensagens compacta -->
<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
  <div class="messages-header">
    📝 Mensagens ({localMessages.filter((m) => localSelectedUserIds.includes(m.userId)).length})
  </div>
  {#if localMessages.filter((m) => localSelectedUserIds.includes(m.userId)).length === 0}
    <div style="text-align: center; color: #a0aec0; padding: 1rem; font-size: 0.9rem;">
      Nenhuma mensagem adicionada
    </div>
  {:else}
    <div style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 15rem; overflow-y: auto;">
      {#each localMessages.filter((m) => localSelectedUserIds.includes(m.userId)) as m}
        {@const user = localUsers.find((u) => u.id === m.userId)}
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

<style>
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

  .form-field select:disabled {
    background-color: #f7fafc;
    cursor: not-allowed;
  }

  .btn-primary {
    padding: 0.75rem 1.5rem;
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
</style>

