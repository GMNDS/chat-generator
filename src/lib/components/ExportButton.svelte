<script lang="ts">
  import { exportElementAsImage } from '../services/exportService';

  let { onSuccess = undefined, onError = undefined }: {
    onSuccess?: (detail: { message: string }) => void;
    onError?: (detail: { message: string }) => void;
  } = $props();

  /**
   * Exporta a conversa como imagem PNG usando html2canvas
   */
  async function exportImage() {
    const success = await exportElementAsImage('phone-frame', 'chat-export.png', {
      scale: 2,
      backgroundColor: null,
    });

    if (success) {
      onSuccess?.({ message: 'Imagem exportada com sucesso' });
    } else {
      onError?.({ message: 'Erro ao exportar imagem' });
    }
  }
</script>

<button class="btn-primary-lg" onclick={exportImage}>📸 Exportar PNG</button>

<style>
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
</style>

