/**
 * js/masks.js
 * Máscaras para inputs: tarjeta, fecha de vencimiento y formato de moneda
 * Requisito Bonus del Punto 12
 */

/**
 * Aplica máscara de tarjeta de crédito (grupos de 4 dígitos separados por espacio)
 * @param {string} valor 
 * @returns {string} Ej: "4111 1111 1111 1111"
 */
export function enmascararTarjeta(valor) {
  const digitos = String(valor || '').replace(/\D/g, '').slice(0, 16);
  const grupos = digitos.match(/.{1,4}/g);
  return grupos ? grupos.join(' ') : digitos;
}

/**
 * Aplica máscara de vencimiento MM/AA con barra automática
 * @param {string} valor 
 * @returns {string} Ej: "12/28"
 */
export function enmascararVencimiento(valor) {
  const digitos = String(valor || '').replace(/\D/g, '').slice(0, 4);
  if (digitos.length >= 3) {
    return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  }
  return digitos;
}

/**
 * Aplica máscara para DNI (hasta 8 números)
 * @param {string} valor 
 * @returns {string}
 */
export function enmascararDNI(valor) {
  return String(valor || '').replace(/\D/g, '').slice(0, 8);
}

/**
 * Aplica máscara para teléfono celular
 * @param {string} valor 
 * @returns {string}
 */
export function enmascararCelular(valor) {
  const digitos = String(valor || '').replace(/\D/g, '').slice(0, 10);
  if (digitos.length > 6) {
    return `${digitos.slice(0, 2)} ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  } else if (digitos.length > 2) {
    return `${digitos.slice(0, 2)} ${digitos.slice(2)}`;
  }
  return digitos;
}

/**
 * Formatea valor en moneda mientras se escribe para mostrar puntos de miles
 * @param {string|number} valor 
 * @returns {string} Ej: "$ 600.000"
 */
export function formatearInputMoneda(valor) {
  const digitos = String(valor || '').replace(/\D/g, '');
  if (!digitos) return '';
  const num = Number(digitos);
  return '$ ' + num.toLocaleString('es-AR');
}

