/**
 * js/cotizador.js
 * Lógica pura de cálculo de cuotas y formateo monetario
 */

export const FACTORES_ANTIGUEDAD = {
  menos_1: 1.00, // Menos de 1 año
  '1_a_2': 1.10, // 1 a 2 años
  mas_2: 1.25,   // Más de 2 años
};

/**
 * Calcula la cuota mensual según la fórmula oficial:
 * cuota = Math.round(valor * tasaAnual / 12 * factorAntiguedad)
 * 
 * @param {number} valor - Valor asegurado del equipo
 * @param {number} tasaAnual - Tasa anual del plan (ej: 0.04, 0.06, 0.09)
 * @param {string} antiguedad - Clave de antigüedad ('menos_1', '1_a_2', 'mas_2')
 * @returns {number} Cuota mensual redondeada
 */
export function calcularCuota(valor, tasaAnual, antiguedad) {
  const factor = FACTORES_ANTIGUEDAD[antiguedad] || 1.00;
  if (!valor || valor <= 0 || !tasaAnual) {
    return 0;
  }
  return Math.round((valor * tasaAnual / 12) * factor);
}

/**
 * Formateador oficial de moneda argentina (es-AR)
 */
const formateadorMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

/**
 * Formatea un número como pesos argentinos
 * @param {number} monto 
 * @returns {string} Ej: "$ 3.000"
 */
export function formatearMoneda(monto) {
  return formateadorMoneda.format(monto || 0);
}

/**
 * Limpia un string numérico/monetario eliminando símbolos y espacios
 * @param {string|number} valor 
 * @returns {number}
 */
export function limpiarNumero(valor) {
  if (typeof valor === 'number') return valor;
  const soloDigitos = String(valor || '').replace(/\D/g, '');
  return soloDigitos ? Number(soloDigitos) : 0;
}

