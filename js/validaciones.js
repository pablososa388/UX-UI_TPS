/**
 * js/validaciones.js
 * Funciones puras de validación según la Sección 5.2 de las consignas.
 * Cada función recibe un valor y devuelve un string con el mensaje de error o null si es válido.
 */

import { limpiarNumero } from './cotizador.js';

export function validarMarca(valor) {
  if (!valor || String(valor).trim() === '') {
    return 'Elegí una marca';
  }
  return null;
}

export function validarModelo(valor) {
  const str = String(valor || '').trim();
  if (str.length < 2 || str.length > 40) {
    return 'Ingresá el modelo del equipo';
  }
  return null;
}

export function validarValorEquipo(valor) {
  const num = limpiarNumero(valor);
  if (isNaN(num) || num < 100000 || num > 2500000) {
    return 'El valor debe estar entre $100.000 y $2.500.000';
  }
  return null;
}

export function validarAntiguedad(valor) {
  const opcionesValidas = ['menos_1', '1_a_2', 'mas_2'];
  if (!valor || !opcionesValidas.includes(valor)) {
    return 'Indicá la antigüedad';
  }
  return null;
}

export function validarNombre(valor) {
  const str = String(valor || '').trim();
  if (str.length < 2) {
    return 'Ingresá tu nombre / apellido';
  }
  return null;
}

export function validarApellido(valor) {
  const str = String(valor || '').trim();
  if (str.length < 2) {
    return 'Ingresá tu nombre / apellido';
  }
  return null;
}

export function validarDNI(valor) {
  const str = String(valor || '').trim().replace(/\D/g, '');
  const regex = /^\d{7,8}$/;
  if (!regex.test(str)) {
    return 'El DNI debe tener 7 u 8 números';
  }
  return null;
}

export function validarFechaNacimiento(valor) {
  if (!valor) {
    return 'Tenés que ser mayor de edad';
  }
  const fechaNac = new Date(valor);
  if (isNaN(fechaNac.getTime())) {
    return 'Tenés que ser mayor de edad';
  }

  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNac = fechaNac.getMonth();

  if (mesActual < mesNac || (mesActual === mesNac && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }

  if (edad < 18 || edad > 120) {
    return 'Tenés que ser mayor de edad';
  }
  return null;
}

export function validarEmail(valor) {
  const str = String(valor || '').trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(str)) {
    return 'Ingresá un email válido';
  }
  return null;
}

export function validarCelular(valor) {
  // 10 dígitos sin 0 ni 15 (se ignoran espacios y guiones) Ej.: 11 5555-1234
  const digitos = String(valor || '').replace(/\D/g, '');
  if (digitos.length !== 10) {
    return 'Ej.: 11 5555-1234';
  }
  if (digitos.startsWith('0') || digitos.startsWith('15')) {
    return 'Ej.: 11 5555-1234';
  }
  return null;
}

export function validarTerminos(valor) {
  if (!valor) {
    return 'Tenés que aceptar los términos';
  }
  return null;
}

export function validarTarjeta(valor) {
  // 16 dígitos (se ignoran espacios)
  const digitos = String(valor || '').replace(/\s/g, '');
  const regex = /^\d{16}$/;
  if (!regex.test(digitos)) {
    return 'Número de tarjeta inválido';
  }
  return null;
}

export function validarVencimiento(valor) {
  // MM/AA, mes 01–12 y fecha futura
  const str = String(valor || '').trim();
  const match = str.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) {
    return 'Vencimiento inválido';
  }

  const mes = parseInt(match[1], 10);
  const anio = parseInt('20' + match[2], 10);

  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();

  if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
    return 'Vencimiento inválido';
  }

  return null;
}

export function validarCVV(valor) {
  // 3 dígitos
  const str = String(valor || '').trim();
  const regex = /^\d{3}$/;
  if (!regex.test(str)) {
    return 'CVV inválido';
  }
  return null;
}

export function validarTitularTarjeta(valor) {
  const str = String(valor || '').trim();
  if (str.length < 2) {
    return 'Ingresá el nombre del titular';
  }
  return null;
}

/**
 * Valida un paso completo y devuelve un objeto de errores { [campo]: errorString }
 */
export function validarPaso(n, estado) {
  const errores = {};

  if (n === 1) {
    const errorMarca = validarMarca(estado.equipo.marca);
    if (errorMarca) errores.marca = errorMarca;

    const errorModelo = validarModelo(estado.equipo.modelo);
    if (errorModelo) errores.modelo = errorModelo;

    const errorValor = validarValorEquipo(estado.equipo.valor);
    if (errorValor) errores.valor = errorValor;

    const errorAntiguedad = validarAntiguedad(estado.equipo.antiguedad);
    if (errorAntiguedad) errores.antiguedad = errorAntiguedad;
  } else if (n === 2) {
    if (!estado.plan) {
      errores.plan = 'Seleccioná un plan para continuar';
    }
  } else if (n === 3) {
    const errorNombre = validarNombre(estado.titular.nombre);
    if (errorNombre) errores.nombre = errorNombre;

    const errorApellido = validarApellido(estado.titular.apellido);
    if (errorApellido) errores.apellido = errorApellido;

    const errorDNI = validarDNI(estado.titular.dni);
    if (errorDNI) errores.dni = errorDNI;

    const errorFecha = validarFechaNacimiento(estado.titular.nacimiento);
    if (errorFecha) errores.nacimiento = errorFecha;

    const errorEmail = validarEmail(estado.titular.email);
    if (errorEmail) errores.email = errorEmail;

    const errorCelular = validarCelular(estado.titular.celular);
    if (errorCelular) errores.celular = errorCelular;

    const errorTerminos = validarTerminos(estado.titular.terminos);
    if (errorTerminos) errores.terminos = errorTerminos;
  } else if (n === 4) {
    const errorTarjeta = validarTarjeta(estado.pago.tarjeta);
    if (errorTarjeta) errores.tarjeta = errorTarjeta;

    const errorVencimiento = validarVencimiento(estado.pago.vencimiento);
    if (errorVencimiento) errores.vencimiento = errorVencimiento;

    const errorCVV = validarCVV(estado.pago.cvv);
    if (errorCVV) errores.cvv = errorCVV;

    const errorTitular = validarTitularTarjeta(estado.pago.titular);
    if (errorTitular) errores.titular = errorTitular;
  }

  return errores;
}

