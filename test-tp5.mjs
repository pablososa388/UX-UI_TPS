import {
  validarMarca,
  validarModelo,
  validarValorEquipo,
  validarAntiguedad,
  validarNombre,
  validarApellido,
  validarDNI,
  validarFechaNacimiento,
  validarEmail,
  validarCelular,
  validarTerminos,
  validarTarjeta,
  validarVencimiento,
  validarCVV,
  validarTitularTarjeta,
} from './js/validaciones.js';

import { calcularCuota, formatearMoneda, limpiarNumero } from './js/cotizador.js';
import { simularPago, generarPoliza } from './js/pago.js';
import { enmascararTarjeta, enmascararVencimiento } from './js/masks.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL: ${message}`);
  }
}

// 1. Validaciones
assert(validarMarca('') === 'Elegí una marca', 'Marca vacía debe fallar');
assert(validarMarca('Samsung') === null, 'Marca válida debe pasar');

assert(validarModelo('A') === 'Ingresá el modelo del equipo', 'Modelo corto debe fallar');
assert(validarModelo('Galaxy A55') === null, 'Modelo válido debe pasar');

assert(validarValorEquipo(50000) === 'El valor debe estar entre $100.000 y $2.500.000', 'Valor menor debe fallar');
assert(validarValorEquipo(3000000) === 'El valor debe estar entre $100.000 y $2.500.000', 'Valor mayor debe fallar');
assert(validarValorEquipo(600000) === null, 'Valor 600.000 debe pasar');
assert(validarValorEquipo('$ 600.000') === null, 'Valor formateado debe pasar');

assert(validarAntiguedad('') === 'Indicá la antigüedad', 'Antigüedad vacía debe fallar');
assert(validarAntiguedad('menos_1') === null, 'Antigüedad menos_1 debe pasar');
assert(validarAntiguedad('1_a_2') === null, 'Antigüedad 1_a_2 debe pasar');
assert(validarAntiguedad('mas_2') === null, 'Antigüedad mas_2 debe pasar');

assert(validarNombre('J') === 'Ingresá tu nombre / apellido', 'Nombre corto debe fallar');
assert(validarNombre('Juan') === null, 'Nombre válido debe pasar');
assert(validarApellido('P') === 'Ingresá tu nombre / apellido', 'Apellido corto debe fallar');
assert(validarApellido('Pérez') === null, 'Apellido válido debe pasar');

assert(validarDNI('12345') === 'El DNI debe tener 7 u 8 números', 'DNI corto debe fallar');
assert(validarDNI('123456789') === 'El DNI debe tener 7 u 8 números', 'DNI largo debe fallar');
assert(validarDNI('35123456') === null, 'DNI 8 dígitos debe pasar');
assert(validarDNI('7123456') === null, 'DNI 7 dígitos debe pasar');

assert(validarFechaNacimiento('2015-05-10') === 'Tenés que ser mayor de edad', 'Menor de edad debe fallar');
assert(validarFechaNacimiento('1995-05-10') === null, 'Mayor de 18 debe pasar');

assert(validarEmail('invalido') === 'Ingresá un email válido', 'Email inválido debe fallar');
assert(validarEmail('juan.perez@') === 'Ingresá un email válido', 'Email incompleto debe fallar');
assert(validarEmail('juan.perez@dominio.com') === null, 'Email correcto debe pasar');

assert(validarCelular('01155551234') === 'Ej.: 11 5555-1234', 'Celular que empieza con 0 debe fallar');
assert(validarCelular('1555551234') === 'Ej.: 11 5555-1234', 'Celular que empieza con 15 debe fallar');
assert(validarCelular('115555123') === 'Ej.: 11 5555-1234', 'Celular menos de 10 dígitos debe fallar');
assert(validarCelular('11 5555-1234') === null, 'Celular 11 5555-1234 debe pasar');

assert(validarTerminos(false) === 'Tenés que aceptar los términos', 'Términos false debe fallar');
assert(validarTerminos(true) === null, 'Términos true debe pasar');

assert(validarTarjeta('1234') === 'Número de tarjeta inválido', 'Tarjeta corta debe fallar');
assert(validarTarjeta('4111 1111 1111 1111') === null, 'Tarjeta 16 dígitos con espacios debe pasar');

assert(validarVencimiento('13/26') === 'Vencimiento inválido', 'Mes 13 debe fallar');
assert(validarVencimiento('05/20') === 'Vencimiento inválido', 'Año pasado debe fallar');
assert(validarVencimiento('12/28') === null, 'Vencimiento futuro debe pasar');

assert(validarCVV('12') === 'CVV inválido', 'CVV 2 dígitos debe fallar');
assert(validarCVV('12345') === 'CVV inválido', 'CVV 5 dígitos debe fallar');
assert(validarCVV('123') === null, 'CVV 3 dígitos debe pasar');

assert(validarTitularTarjeta('') === 'Ingresá el nombre del titular', 'Titular tarjeta vacío debe fallar');
assert(validarTitularTarjeta('JUAN PEREZ') === null, 'Titular tarjeta válido debe pasar');

// 2. Casos de prueba de cuotas de la Sección 5.1
assert(calcularCuota(600000, 0.04, 'menos_1') === 2000, 'Caso 1 Básico: 2000');
assert(calcularCuota(600000, 0.06, 'menos_1') === 3000, 'Caso 1 Plus: 3000');
assert(calcularCuota(600000, 0.09, 'menos_1') === 4500, 'Caso 1 Premium: 4500');

assert(calcularCuota(600000, 0.04, '1_a_2') === 2200, 'Caso 2 Básico: 2200');
assert(calcularCuota(600000, 0.06, '1_a_2') === 3300, 'Caso 2 Plus: 3300');
assert(calcularCuota(600000, 0.09, '1_a_2') === 4950, 'Caso 2 Premium: 4950');

assert(calcularCuota(1200000, 0.04, 'mas_2') === 5000, 'Caso 3 Básico: 5000');
assert(calcularCuota(1200000, 0.06, 'mas_2') === 7500, 'Caso 3 Plus: 7500');
assert(calcularCuota(1200000, 0.09, 'mas_2') === 11250, 'Caso 3 Premium: 11250');

// 3. Simulación de pago y póliza
const poliza = generarPoliza();
assert(/^POL-\d{4}-\d{6}$/.test(poliza), `Formato de póliza POL-AAAA-NNNNNN: ${poliza}`);

// 4. Máscaras
assert(enmascararTarjeta('4111111111111111') === '4111 1111 1111 1111', 'Máscara tarjeta 4 en 4');
assert(enmascararVencimiento('1228') === '12/28', 'Máscara vencimiento MM/AA');

console.log(`Pruebas completadas: ${passed} pasadas, ${failed} falladas.`);

// Async check for payment simulation
const resAprobado = await simularPago('4111 1111 1111 1111');
assert(resAprobado.ok === true, '4111... debe aprobar');

const resRechazado = await simularPago('4000 0000 0000 0002');
assert(resRechazado.ok === false, '4000 0000 0000 0002 debe rechazar');

console.log(`Pruebas asíncronas completadas: ${passed} pasadas, ${failed} falladas.`);
if (failed > 0) process.exit(1);

