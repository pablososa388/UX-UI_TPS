/**
 * js/app.js
 * Punto de entrada principal: inicialización, carga de datos, suscripción de eventos y navegación.
 */

import {
  solicitud,
  irAPaso,
  actualizarEquipo,
  actualizarTitular,
  actualizarPago,
  seleccionarProducto,
  fijarPoliza,
  finalizarEdicionSiAplica,
  reiniciarSolicitud,
  registrarRender,
  recuperarDeStorage,
} from './estado.js';

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
  validarPaso,
} from './validaciones.js';

import { limpiarNumero } from './cotizador.js';
import { simularPago, generarPoliza } from './pago.js';
import { render, setPlanesCache } from './render.js';
import {
  enmascararTarjeta,
  enmascararVencimiento,
  enmascararDNI,
  enmascararCelular,
  formatearInputMoneda,
} from './masks.js';
import { mostrarToast } from './toast.js';
import { inicializarTema } from './theme.js';

// Conectamos el motor de render con el estado
registrarRender(render);

/**
 * Carga el archivo planes.json según el producto seleccionado
 */
async function cargarPlanes(producto = 'celular') {
  const ruta = producto === 'bicicleta' ? 'data/planes-bicicleta.json' : 'data/planes.json';
  try {
    const res = await fetch(ruta);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    setPlanesCache(data);
  } catch (err) {
    console.warn(`No se pudo cargar ${ruta}, usando fallback directo`, err);
    // Fallback estándar en caso de ejecución con file:// sin servidor local
    setPlanesCache([
      {
        id: 'basico',
        nombre: 'Básico',
        tasaAnual: 0.04,
        coberturas: ['Robo con violencia'],
      },
      {
        id: 'plus',
        nombre: 'Plus',
        tasaAnual: 0.06,
        recomendado: true,
        coberturas: ['Robo con violencia', 'Rotura de pantalla'],
      },
      {
        id: 'premium',
        nombre: 'Premium',
        tasaAnual: 0.09,
        coberturas: ['Robo con violencia', 'Rotura total', 'Hurto / pérdida'],
      },
    ]);
  }
}

/**
 * Muestra u oculta el estado de error en un campo del DOM
 */
function setCampoError(inputEl, errorMensaje) {
  if (!inputEl) return;
  const fieldGroup = inputEl.closest('.field') || inputEl.closest('.chips-group');
  const errorEl = fieldGroup ? fieldGroup.querySelector('.field-error') : null;

  if (errorMensaje) {
    if (fieldGroup) fieldGroup.setAttribute('data-invalid', '');
    inputEl.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.textContent = errorMensaje;
    }
  } else {
    if (fieldGroup) fieldGroup.removeAttribute('data-invalid');
    inputEl.setAttribute('aria-invalid', 'false');
    if (errorEl) {
      errorEl.textContent = '';
    }
  }
}

/**
 * Inicialización al cargar el DOM
 */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Inicializar tema oscuro/claro
  inicializarTema();

  // 2. Restaurar estado de localStorage si existía (Punto 12 Bonus)
  const teniaSesionPrevia = recuperarDeStorage();

  // 3. Cargar datos de planes
  await cargarPlanes(solicitud.producto);

  // 4. Suscribir todos los eventos de la aplicación
  suscribirEventosInicio();
  suscribirEventosPaso1();
  suscribirEventosPaso2();
  suscribirEventosPaso3();
  suscribirEventosPaso4();
  suscribirEventosExitoYError();
  suscribirModalTerminos();

  // 5. Renderizar vista inicial
  render();

  if (teniaSesionPrevia) {
    mostrarToast('Se restauró tu cotización previa en curso.', 'info', 3000);
  }
});

/**
 * Eventos Pantalla 0: Inicio / Catálogo
 */
function suscribirEventosInicio() {
  const cardCelular = document.getElementById('card-producto-celular');
  const cardBicicleta = document.getElementById('card-producto-bicicleta');
  const ctaHero = document.getElementById('btn-hero-cta');

  if (cardCelular) {
    cardCelular.addEventListener('click', async () => {
      await cargarPlanes('celular');
      seleccionarProducto('celular');
    });
  }

  // Bonus Punto 12: Habilitar otro producto (Bicicleta)
  if (cardBicicleta) {
    cardBicicleta.addEventListener('click', async () => {
      await cargarPlanes('bicicleta');
      seleccionarProducto('bicicleta');
    });
  }

  if (ctaHero) {
    ctaHero.addEventListener('click', async () => {
      await cargarPlanes('celular');
      seleccionarProducto('celular');
    });
  }
}

/**
 * Eventos Pantalla 1: Cotizar
 */
function suscribirEventosPaso1() {
  const selectMarca = document.getElementById('input-marca');
  const inputModelo = document.getElementById('input-modelo');
  const inputValor = document.getElementById('input-valor');
  const radiosAntiguedad = document.querySelectorAll('input[name="antiguedad"]');
  const btnVerPlanes = document.getElementById('btn-ver-planes');
  const btnVolverPaso1 = document.getElementById('btn-volver-paso-1');

  // Función para reevaluar la validez de todo el paso 1 y activar/desactivar botón
  const actualizarBotonPaso1 = () => {
    const errores = validarPaso(1, solicitud);
    const esValido = Object.keys(errores).length === 0;
    btnVerPlanes.disabled = !esValido;
  };

  // Marca
  selectMarca.addEventListener('change', () => {
    actualizarEquipo({ marca: selectMarca.value });
    setCampoError(selectMarca, validarMarca(selectMarca.value));
    actualizarBotonPaso1();
  });
  selectMarca.addEventListener('blur', () => {
    setCampoError(selectMarca, validarMarca(selectMarca.value));
    actualizarBotonPaso1();
  });

  // Modelo
  inputModelo.addEventListener('input', () => {
    actualizarEquipo({ modelo: inputModelo.value });
    actualizarBotonPaso1();
  });
  inputModelo.addEventListener('blur', () => {
    setCampoError(inputModelo, validarModelo(inputModelo.value));
    actualizarBotonPaso1();
  });

  // Valor del equipo (con máscara y formateo monetario)
  inputValor.addEventListener('input', () => {
    const num = limpiarNumero(inputValor.value);
    actualizarEquipo({ valor: num });
    if (inputValor.value) {
      inputValor.value = formatearInputMoneda(num);
    }
    actualizarBotonPaso1();
  });
  inputValor.addEventListener('blur', () => {
    setCampoError(inputValor, validarValorEquipo(solicitud.equipo.valor));
    actualizarBotonPaso1();
  });

  // Antigüedad (Radio chips)
  radiosAntiguedad.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        actualizarEquipo({ antiguedad: radio.value });
        const chipsGroup = document.getElementById('group-antiguedad');
        if (chipsGroup) chipsGroup.removeAttribute('data-invalid');
        actualizarBotonPaso1();
      }
    });
  });

  // Volver al Inicio
  if (btnVolverPaso1) {
    btnVolverPaso1.addEventListener('click', () => {
      irAPaso(0);
    });
  }

  // Click en "Ver planes"
  btnVerPlanes.addEventListener('click', (e) => {
    e.preventDefault();
    const errores = validarPaso(1, solicitud);

    if (Object.keys(errores).length > 0) {
      if (errores.marca) setCampoError(selectMarca, errores.marca);
      if (errores.modelo) setCampoError(inputModelo, errores.modelo);
      if (errores.valor) setCampoError(inputValor, errores.valor);
      if (errores.antiguedad) {
        const chipsGroup = document.getElementById('group-antiguedad');
        if (chipsGroup) chipsGroup.setAttribute('data-invalid', '');
      }
      return;
    }

    if (!finalizarEdicionSiAplica()) {
      irAPaso(2);
    }
  });
}

/**
 * Eventos Pantalla 2: Elegir Plan
 */
function suscribirEventosPaso2() {
  const btnContinuarPaso2 = document.getElementById('btn-continuar-paso-2');
  const btnVolverPaso2 = document.getElementById('btn-volver-paso-2');

  if (btnVolverPaso2) {
    btnVolverPaso2.addEventListener('click', () => {
      irAPaso(1);
    });
  }

  if (btnContinuarPaso2) {
    btnContinuarPaso2.addEventListener('click', () => {
      if (!solicitud.plan) {
        mostrarToast('Por favor seleccioná un plan', 'error');
        return;
      }
      if (!finalizarEdicionSiAplica()) {
        irAPaso(3);
      }
    });
  }
}

/**
 * Eventos Pantalla 3: Datos Personales
 */
function suscribirEventosPaso3() {
  const nombre = document.getElementById('input-nombre');
  const apellido = document.getElementById('input-apellido');
  const dni = document.getElementById('input-dni');
  const nacimiento = document.getElementById('input-nacimiento');
  const email = document.getElementById('input-email');
  const celular = document.getElementById('input-celular');
  const terminos = document.getElementById('input-terminos');
  const btnContinuarPaso3 = document.getElementById('btn-continuar-paso-3');
  const btnVolverPaso3 = document.getElementById('btn-volver-paso-3');

  const actualizarBotonPaso3 = () => {
    const errores = validarPaso(3, solicitud);
    const esValido = Object.keys(errores).length === 0;
    btnContinuarPaso3.disabled = !esValido;
  };

  // Nombre
  nombre.addEventListener('input', () => {
    actualizarTitular({ nombre: nombre.value });
    actualizarBotonPaso3();
  });
  nombre.addEventListener('blur', () => {
    setCampoError(nombre, validarNombre(nombre.value));
    actualizarBotonPaso3();
  });

  // Apellido
  apellido.addEventListener('input', () => {
    actualizarTitular({ apellido: apellido.value });
    actualizarBotonPaso3();
  });
  apellido.addEventListener('blur', () => {
    setCampoError(apellido, validarApellido(apellido.value));
    actualizarBotonPaso3();
  });

  // DNI
  dni.addEventListener('input', () => {
    dni.value = enmascararDNI(dni.value);
    actualizarTitular({ dni: dni.value });
    actualizarBotonPaso3();
  });
  dni.addEventListener('blur', () => {
    setCampoError(dni, validarDNI(dni.value));
    actualizarBotonPaso3();
  });

  // Nacimiento
  nacimiento.addEventListener('change', () => {
    actualizarTitular({ nacimiento: nacimiento.value });
    setCampoError(nacimiento, validarFechaNacimiento(nacimiento.value));
    actualizarBotonPaso3();
  });
  nacimiento.addEventListener('blur', () => {
    setCampoError(nacimiento, validarFechaNacimiento(nacimiento.value));
    actualizarBotonPaso3();
  });

  // Email
  email.addEventListener('input', () => {
    actualizarTitular({ email: email.value });
    actualizarBotonPaso3();
  });
  email.addEventListener('blur', () => {
    setCampoError(email, validarEmail(email.value));
    actualizarBotonPaso3();
  });

  // Celular con máscara
  celular.addEventListener('input', () => {
    celular.value = enmascararCelular(celular.value);
    actualizarTitular({ celular: celular.value });
    actualizarBotonPaso3();
  });
  celular.addEventListener('blur', () => {
    setCampoError(celular, validarCelular(celular.value));
    actualizarBotonPaso3();
  });

  // Términos y condiciones
  terminos.addEventListener('change', () => {
    actualizarTitular({ terminos: terminos.checked });
    setCampoError(terminos, validarTerminos(terminos.checked));
    actualizarBotonPaso3();
  });

  // Volver
  if (btnVolverPaso3) {
    btnVolverPaso3.addEventListener('click', () => {
      irAPaso(2);
    });
  }

  // Continuar al pago
  btnContinuarPaso3.addEventListener('click', (e) => {
    e.preventDefault();
    const errores = validarPaso(3, solicitud);
    if (Object.keys(errores).length > 0) {
      if (errores.nombre) setCampoError(nombre, errores.nombre);
      if (errores.apellido) setCampoError(apellido, errores.apellido);
      if (errores.dni) setCampoError(dni, errores.dni);
      if (errores.nacimiento) setCampoError(nacimiento, errores.nacimiento);
      if (errores.email) setCampoError(email, errores.email);
      if (errores.celular) setCampoError(celular, errores.celular);
      if (errores.terminos) setCampoError(terminos, errores.terminos);

      const primerInvalido = document.querySelector('#seccion-paso-3 [aria-invalid="true"]');
      if (primerInvalido) primerInvalido.focus();
      return;
    }

    if (!finalizarEdicionSiAplica()) {
      irAPaso(4);
    }
  });
}

/**
 * Eventos Pantalla 4: Pago
 */
function suscribirEventosPaso4() {
  const titular = document.getElementById('input-pago-titular');
  const tarjeta = document.getElementById('input-pago-tarjeta');
  const vencimiento = document.getElementById('input-pago-vencimiento');
  const cvv = document.getElementById('input-pago-cvv');
  const radiosMetodo = document.querySelectorAll('input[name="pago-metodo"]');
  const btnPagar = document.getElementById('btn-pagar-solicitud');
  const btnVolverPaso4 = document.getElementById('btn-volver-paso-4');

  radiosMetodo.forEach((r) => {
    r.addEventListener('change', () => {
      if (r.checked) actualizarPago({ metodo: r.value });
    });
  });

  // Titular
  titular.addEventListener('input', () => {
    actualizarPago({ titular: titular.value });
  });
  titular.addEventListener('blur', () => {
    setCampoError(titular, validarTitularTarjeta(titular.value));
  });

  // Tarjeta con máscara
  tarjeta.addEventListener('input', () => {
    tarjeta.value = enmascararTarjeta(tarjeta.value);
    actualizarPago({ tarjeta: tarjeta.value });
  });
  tarjeta.addEventListener('blur', () => {
    setCampoError(tarjeta, validarTarjeta(tarjeta.value));
  });

  // Vencimiento con máscara MM/AA
  vencimiento.addEventListener('input', () => {
    vencimiento.value = enmascararVencimiento(vencimiento.value);
    actualizarPago({ vencimiento: vencimiento.value });
  });
  vencimiento.addEventListener('blur', () => {
    setCampoError(vencimiento, validarVencimiento(vencimiento.value));
  });

  // CVV
  cvv.addEventListener('input', () => {
    cvv.value = cvv.value.replace(/\D/g, '').slice(0, 4);
    actualizarPago({ cvv: cvv.value });
  });
  cvv.addEventListener('blur', () => {
    setCampoError(cvv, validarCVV(cvv.value));
  });

  // Volver
  if (btnVolverPaso4) {
    btnVolverPaso4.addEventListener('click', () => {
      irAPaso(3);
    });
  }

  // Pagar y Contratar
  btnPagar.addEventListener('click', async (e) => {
    e.preventDefault();

    const errores = validarPaso(4, solicitud);
    if (Object.keys(errores).length > 0) {
      if (errores.titular) setCampoError(titular, errores.titular);
      if (errores.tarjeta) setCampoError(tarjeta, errores.tarjeta);
      if (errores.vencimiento) setCampoError(vencimiento, errores.vencimiento);
      if (errores.cvv) setCampoError(cvv, errores.cvv);

      const primerInvalido = document.querySelector('#seccion-paso-4 [aria-invalid="true"]');
      if (primerInvalido) primerInvalido.focus();
      return;
    }

    // Estado "Procesando..." durante 1.5s evitando doble click
    btnPagar.disabled = true;
    const textoOriginal = btnPagar.innerHTML;
    btnPagar.innerHTML = `
      <div class="spinner"></div>
      <span>Procesando pago...</span>
    `;

    try {
      const respuesta = await simularPago(solicitud.pago.tarjeta);

      if (respuesta.ok) {
        const poliza = generarPoliza();
        fijarPoliza(poliza);
        mostrarToast('¡Pago aprobado! Póliza emitida exitosamente.', 'success');
        irAPaso(5); // Éxito
      } else {
        mostrarToast('Tarjeta rechazada por la entidad bancaria.', 'error');
        irAPaso(6); // Error de pago
      }
    } catch (err) {
      console.error(err);
      mostrarToast('Ocurrió un error inesperado al procesar.', 'error');
      irAPaso(6);
    } finally {
      btnPagar.disabled = false;
      btnPagar.innerHTML = textoOriginal;
    }
  });
}

/**
 * Eventos Pantallas 06 (Éxito) y 07 (Error de pago)
 */
function suscribirEventosExitoYError() {
  const btnInicioExito = document.getElementById('btn-volver-inicio-exito');
  const btnReintentar = document.getElementById('btn-reintentar-pago');
  const btnCambiarMedio = document.getElementById('btn-cambiar-medio-pago');

  if (btnInicioExito) {
    btnInicioExito.addEventListener('click', () => {
      reiniciarSolicitud();
    });
  }

  if (btnReintentar) {
    btnReintentar.addEventListener('click', () => {
      irAPaso(4);
    });
  }

  if (btnCambiarMedio) {
    btnCambiarMedio.addEventListener('click', () => {
      irAPaso(4);
      const inputTarjeta = document.getElementById('input-pago-tarjeta');
      if (inputTarjeta) {
        inputTarjeta.focus();
        inputTarjeta.select();
      }
    });
  }
}

/**
 * Modal accesible de Términos y Condiciones
 */
function suscribirModalTerminos() {
  const linkModal = document.getElementById('link-ver-terminos');
  const dialogModal = document.getElementById('modal-terminos');
  const btnCerrarModal = document.getElementById('btn-cerrar-modal');

  if (linkModal && dialogModal) {
    linkModal.addEventListener('click', (e) => {
      e.preventDefault();
      dialogModal.showModal();
    });
  }

  if (btnCerrarModal && dialogModal) {
    btnCerrarModal.addEventListener('click', () => {
      dialogModal.close();
    });
  }

  if (dialogModal) {
    dialogModal.addEventListener('click', (e) => {
      if (e.target === dialogModal) {
        dialogModal.close();
      }
    });
  }
}

