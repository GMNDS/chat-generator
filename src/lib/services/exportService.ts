/**
 * Serviço de exportação de imagens
 */
import { handleError, createError } from '../utils/errorHandler';
import { toPng } from 'html-to-image';

export type ExportOptions = {
  scale?: number;
  backgroundColor?: string | null;
  useCORS?: boolean;
  scrollY?: number;
  windowWidth?: number;
  windowHeight?: number;
  width?: number;
  height?: number;
};

async function waitForFonts(): Promise<void> {
  if (document && (document as any).fonts && typeof (document as any).fonts.ready === 'object') {
    try {
      await (document as any).fonts.ready;
    } catch {
      // ignore font readiness failures
    }
  }
}

async function waitForImages(root: HTMLElement, timeoutMs = 3000): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img')) as Element[];
  const promises = imgs.map((el) => {
    const img = el as any;
    if (img.complete) return Promise.resolve();
    if (typeof img.decode === 'function') {
      return img.decode().catch(() => void 0);
    }
    return new Promise<void>((resolve) => {
      const onDone = () => {
        try {
          img.removeEventListener('load', onDone);
          img.removeEventListener('error', onDone);
        } catch {}
        resolve();
      };
      try {
        img.addEventListener('load', onDone);
        img.addEventListener('error', onDone);
      } catch {
        resolve();
      }
    });
  });
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  await Promise.race([Promise.all(promises).then(() => void 0), timeout]);
}


function applyExportingState(root: HTMLElement) {
  root.setAttribute('data-exporting', 'true');
}

function cleanupExportingState(root: HTMLElement) {
  root.removeAttribute('data-exporting');
}

export const ExportController = {
  async start(target: HTMLElement): Promise<void> {
    applyExportingState(target);
    // allow DOM to settle
    await Promise.resolve();
    await waitForFonts();
    await waitForImages(target);
  },
  async capture(target: HTMLElement, options: ExportOptions = {}): Promise<HTMLCanvasElement> {
    const {
      scale = 2,
      backgroundColor = null,
      useCORS = true,
      width,
      height,
    } = options;

    // Criar sandbox offscreen e clonar o alvo para capturar fielmente
    const rect = target.getBoundingClientRect();
    const w = width ?? Math.ceil(rect.width);
    const h = height ?? Math.ceil(rect.height);

    const sandbox = document.createElement('div');
    sandbox.style.position = 'fixed';
    sandbox.style.left = '-10000px';
    sandbox.style.top = '0';
    sandbox.style.width = `${w}px`;
    sandbox.style.height = `${h}px`;
    sandbox.style.zIndex = '-1';
    sandbox.style.pointerEvents = 'none';
    sandbox.style.overflow = 'visible';

    const clone = target.cloneNode(true) as HTMLElement;
    clone.id = 'phone-frame-export';
    clone.style.width = `${w}px`;
    clone.style.height = `${h}px`;
    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);

    await waitForFonts();
    await waitForImages(clone);

    const dataUrl = await toPng(clone, {
      cacheBust: true,
      pixelRatio: scale,
      canvasWidth: w,
      canvasHeight: h,
      backgroundColor: backgroundColor === null ? undefined : backgroundColor,
      includeQueryParams: true,
      skipFonts: false,
      // cross-origin
      // html-to-image respeita CORS se o servidor permitir; assumimos imagens locais ou CORS habilitado
    });

    // Criar canvas a partir de dataURL para manter API
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
      image.src = dataUrl;
      if (useCORS) image.crossOrigin = 'anonymous';
    });
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw createError('Canvas 2D context não disponível');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Limpar sandbox
    sandbox.remove();
    return canvas;
  },
  finalize(target: HTMLElement): void {
    cleanupExportingState(target);
  },
  async save(canvas: HTMLCanvasElement, filename = 'chat-export.png'): Promise<void> {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  },
};

/**
 * Exporta um elemento HTML como imagem PNG
 */
export async function exportElementAsImage(
  elementId: string,
  filename: string = 'chat-export.png',
  options: ExportOptions = {}
): Promise<boolean> {
  const el = document.getElementById(elementId);
  if (!el) {
    handleError(createError(`Elemento com ID "${elementId}" não encontrado`), {
      action: 'exportElementAsImage',
      data: { elementId, filename },
    });
    return false;
  }

  try {
    await ExportController.start(el);
    const canvas = await ExportController.capture(el, options);
    await ExportController.save(canvas, filename);
    return true;
  } catch (error) {
    handleError(error, {
      action: 'exportElementAsImage',
      data: { elementId, filename, options },
    });
    return false;
  } finally {
    ExportController.finalize(el);
  }
}

