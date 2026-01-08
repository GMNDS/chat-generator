/**
 * Tratamento centralizado de erros
 */

export type ErrorContext = {
  action?: string;
  component?: string;
  data?: unknown;
};

export class AppError extends Error {
  constructor(
    message: string,
    public context?: ErrorContext,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Registra um erro de forma consistente
 */
export function handleError(error: unknown, context?: ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error('[AppError]', {
    message: errorMessage,
    context,
    stack: errorStack,
    timestamp: new Date().toISOString(),
  });

  // Aqui você pode adicionar integração com serviços de monitoramento
  // como Sentry, LogRocket, etc.
}

/**
 * Cria um erro tipado com contexto
 */
export function createError(
  message: string,
  context?: ErrorContext,
  originalError?: Error
): AppError {
  return new AppError(message, context, originalError);
}

/**
 * Wrapper para funções assíncronas que captura erros automaticamente
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context);
    return null;
  }
}

/**
 * Wrapper para funções síncronas que captura erros automaticamente
 */
export function withErrorHandlingSync<T>(
  fn: () => T,
  context?: ErrorContext
): T | null {
  try {
    return fn();
  } catch (error) {
    handleError(error, context);
    return null;
  }
}

