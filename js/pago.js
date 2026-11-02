/**
 * js/pago.js
 * Simulación de pago y generación de número de póliza según Sección 5.3
 */

const STORAGE_POLIZA_KEY = 'cubri_seguros_contador_poliza';

/**
 * Genera el siguiente número de póliza correlativo con formato POL-AAAA-NNNNNN
 * @returns {string} Ej: "POL-2026-000123"
 */
export function generarPoliza() {
  const anio = new Date().getFullYear();
  let contador = 1;

  try {
    const guardado = localStorage.getItem(STORAGE_POLIZA_KEY);
    if (guardado) {
      contador = parseInt(guardado, 10) + 1;
    }
  } catch (e) {
    contador = Math.floor(Math.random() * 900000) + 100000;
  }

  try {
    localStorage.setItem(STORAGE_POLIZA_KEY, String(contador));
  } catch (e) {
    // fallback seguro si cookies/storage están bloqueados
  }

  return `POL-${anio}-${String(contador).padStart(6, '0')}`;
}

/**
 * Simula el procesamiento del pago con tarjeta
 * 4111 1111 1111 1111 -> Aprobado
 * 4000 0000 0000 0002 -> Rechazado
 * Cualquier otro número válido -> Aprobado
 * 
 * @param {string} numero Número de tarjeta con o sin espacios
 * @returns {Promise<{ ok: boolean, motivo?: string }>}
 */
export function simularPago(numero) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const limpio = String(numero || '').replace(/\s/g, '');
      resolve(limpio === '4000000000000002'
        ? { ok: false, motivo: 'Tarjeta rechazada por la entidad emisora' }
        : { ok: true });
    }, 1500);
  });
}

