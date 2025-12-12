/**
 * Retry Client pour OpenAI
 *
 * Gère les erreurs transitoires avec backoff exponentiel.
 * Ne retry que sur les erreurs qui ont du sens (429, 5xx, timeouts).
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 30000,
};

/**
 * Erreurs pour lesquelles on doit retry
 */
function isRetryableError(error: unknown): boolean {
  // Erreur OpenAI avec status code
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;

    // 429 = Rate Limit → retry
    if (status === 429) return true;

    // 5xx = Server Error → retry
    if (status >= 500 && status < 600) return true;

    // 4xx autres (400 Bad Request, 401 Unauthorized, 403 Forbidden) → ne pas retry
    if (status >= 400 && status < 500) return false;
  }

  // Erreur de timeout ou réseau
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('econnrefused') ||
      message.includes('socket hang up') ||
      message.includes('network')
    ) {
      return true;
    }
  }

  // Par défaut, ne pas retry
  return false;
}

/**
 * Extrait un message d'erreur lisible
 */
function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
    if ('status' in error) {
      return `HTTP ${(error as { status: number }).status}`;
    }
  }
  return String(error);
}

/**
 * Délai avec Promise
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exécute une fonction async avec retry automatique sur erreurs transitoires.
 *
 * @param fn - Fonction async à exécuter
 * @param options - Options de retry (optionnel)
 * @param context - Contexte pour les logs (optionnel)
 * @returns Le résultat de la fonction
 * @throws L'erreur finale si tous les retries échouent
 *
 * @example
 * const result = await withRetry(
 *   () => openai.chat.completions.create({ ... }),
 *   { maxAttempts: 3 },
 *   'clinical-engine'
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
  context?: string
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const contextPrefix = context ? `[${context}]` : '[Retry]';

  let lastError: unknown;
  let currentDelay = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Vérifier si on doit retry
      if (!isRetryableError(error)) {
        console.error(`${contextPrefix} ❌ Erreur non-retryable (attempt ${attempt}): ${getErrorMessage(error)}`);
        throw error;
      }

      // Si c'était la dernière tentative, on throw
      if (attempt === opts.maxAttempts) {
        console.error(`${contextPrefix} ❌ Échec après ${opts.maxAttempts} tentatives: ${getErrorMessage(error)}`);
        throw error;
      }

      // Log du retry
      console.warn(
        `${contextPrefix} ⚠️ Tentative ${attempt}/${opts.maxAttempts} échouée: ${getErrorMessage(error)}. ` +
        `Retry dans ${currentDelay}ms...`
      );

      // Attendre avant le prochain essai
      await delay(currentDelay);

      // Augmenter le délai pour le prochain retry (backoff exponentiel)
      currentDelay = Math.min(currentDelay * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  // Ne devrait jamais arriver, mais TypeScript veut un return
  throw lastError;
}

/**
 * Version préconfigurée pour OpenAI
 */
export async function withOpenAIRetry<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  return withRetry(fn, {
    maxAttempts: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
    maxDelayMs: 30000,
  }, context);
}
