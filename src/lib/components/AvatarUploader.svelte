<script lang="ts">
  let { userId, userName, current = null }: { userId: string; userName: string; current?: string | null } = $props();

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  let previewUrl = $state<string | null>(null);

  // Atualiza o preview sempre que current muda
  $effect(() => {
    previewUrl = current;
  });

  // Quando um arquivo é selecionado: gerar preview com ObjectURL -converter para DataURL e emite evento para salvar
  function onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    // Preview imediato com ObjectURL
    const objectUrl = URL.createObjectURL(file);
    previewUrl = objectUrl;

    // Ler como Data URL para persistir
    const reader = new FileReader();
    reader.onload = () => {
      // Envia o dataUrl para o pai para salvar
      dispatch('set', { userId, dataUrl: reader.result as string });
      // Revoke o object URL quando não for mais necessário
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    };
    reader.readAsDataURL(file);
  }

  function clearAvatar() {
    previewUrl = null;
    dispatch('set', { userId, dataUrl: null });
  }
</script>

<style>
  .uploader {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: linear-gradient(180deg,#eef6ff,#ffffff);
    padding: 6px 8px;
    border-radius: 10px;
    box-shadow: 0 6px 18px rgba(19,40,77,0.04);
  }
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  }
  .btn { cursor: pointer; background: #1976d2; color: white; border: none; border-radius: 6px; padding: 6px 10px; font-size: 13px; }
  .btn.secondary { background: transparent; color: #1976d2; border: 1px solid rgba(25,118,210,0.12); }
  input[type=file] { display:none; }
</style>

<div class="uploader">
  {#if previewUrl}
    <img class="avatar" src={previewUrl} alt="avatar" />
  {:else}
    <div style="width:48px;height:48px;border-radius:50%;background:#ddd;display:flex;align-items:center;justify-content:center;">{userName.charAt(0).toUpperCase()}</div>
  {/if}
  <div>
    <input id="file-{userId}" type="file" accept="image/*" onchange={onFile} aria-label={`Avatar ${userName}`} />
    <label for="file-{userId}" class="btn">Alterar</label>
    <button class="btn secondary" onclick={clearAvatar} type="button">Remover</button>
  </div>
</div>
