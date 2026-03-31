// ─── Conexão ──────────────────────────────────────────────────────────────────

export const MQTT_CONFIG = {
    host:     import.meta.env.VITE_MQTT_HOST     || '147.93.176.117',
    port:     import.meta.env.VITE_MQTT_PORT     || '8083',
    protocol: import.meta.env.VITE_MQTT_PROTOCOL || 'ws',   // 'ws' ou 'wss'
    path:     import.meta.env.VITE_MQTT_PATH     || '/mqtt',
} as const;

export const MQTT_BROKER_URL =
    `${MQTT_CONFIG.protocol}://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}${MQTT_CONFIG.path}`;

// ─── Tópicos ──────────────────────────────────────────────────────────────────

/**
 * Monta o tópico MQTT para um sensor+capability.
 *
 * Formato atual:  plant_monitor/{sensorId}/{capability}
 * Formato futuro: plant_monitor/{deviceId}/{sensorId}/{capability}
 *
 * Para adicionar o deviceId no futuro, basta descomentar o parâmetro
 * e ajustar o template abaixo — nenhum outro arquivo precisa mudar.
 */
export function buildTopic(
    sensorId: number,
    capability: string,
    // deviceId?: number,  // ← descomentar quando o backend suportar
): string {
    return `plant_monitor/${sensorId}/${capability}`;
    // return `plant_monitor/${deviceId}/${sensorId}/${capability}`;
}
