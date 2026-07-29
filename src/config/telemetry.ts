// ─── Configuração de Telemetria ───────────────────────────────────────────────
//
// Hierarquia obrigatória:
//   WINDOW_POINTS >= EXPANDED_POINTS >= COMPACT_POINTS
//
// Se WINDOW_POINTS < EXPANDED_POINTS, o modal vai pedir mais pontos
// do que o hook acumulou — os dados mais antigos serão perdidos.

function envInt(key: string, fallback: number): number {
    const raw = import.meta.env[key];
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? fallback : parsed;
}

export const TELEMETRY_CONFIG = {
    /**
     * Tamanho total da janela acumulada pelo useTelemetry.
     * Teto de todos os pontos disponíveis para UI.
     * @env VITE_TELEMETRY_WINDOW_POINTS
     * @default 520
     */
    windowPoints: envInt('VITE_TELEMETRY_WINDOW_POINTS', 520),

    /**
     * Pontos exibidos no card compacto do SensorCard.
     * @env VITE_TELEMETRY_COMPACT_POINTS
     * @default 60
     */
    compactPoints: envInt('VITE_TELEMETRY_COMPACT_POINTS', 60),

    /**
     * Intervalo (ms) entre cada ponto liberado da fila de saída.
     * Fórmula ideal: intervalo_batch_ms / tamanho_batch
     * Ex: broker envia 10 pts a cada 2s → 2000 / 10 = 200ms
     * @env VITE_TELEMETRY_DRAIN_INTERVAL_MS
     * @default 200
     */
    drainIntervalMs: envInt('VITE_TELEMETRY_DRAIN_INTERVAL_MS', 200),

    /**
     * Tamanho máximo da fila de entrada por tipo antes de descartar os mais antigos.
     * @env VITE_TELEMETRY_MAX_QUEUE_SIZE
     * @default 50
     */
    maxQueueSize: envInt('VITE_TELEMETRY_MAX_QUEUE_SIZE', 50),

    targetPoints:    Number(import.meta.env.VITE_TELEMETRY_TARGET_POINTS    ?? 800),

} as const;

