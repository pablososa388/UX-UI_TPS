/**
 * js/estado.js
 * Objeto único de estado de la aplicación y funciones para modificarlo.
 * Sigue la regla fundamental: "Toda la información del flujo vive en un solo objeto".
 * Incluye persistencia en localStorage (Punto 12 Bonus).
 */

const STORAGE_STATE_KEY = 'cubri_seguros_solicitud_estado';

export const ESTADO_INICIAL = {
  paso: 0, // 0 = inicio, 1..4 = checkout, 5 = éxito, 6 = error
  producto: 'celular', // 'celular' | 'bicicleta' (Punto 12 Bonus)
  equipo: {
    marca: '',
    modelo: '',
    valor: 0,
    antiguedad: '', // 'menos_1' | '1_a_2' | 'mas_2'
  },
  plan: 'plus', // Preseleccionado según especificación
  titular: {
    nombre: '',
    apellido: '',
    dni: '',
    nacimiento: '',
    email: '',
    celular: '',
    terminos: false,
  },
  pago: {
    metodo: 'credito',
    tarjeta: '',
    vencimiento: '',
    cvv: '',
    titular: '',
  },
  poliza: null,
  retornoEdicion: null, // Si viene de un link 'Editar' desde el resumen (Bonus)
};

// Objeto mutable exportado que representa el estado en ejecución
export let solicitud = JSON.parse(JSON.stringify(ESTADO_INICIAL));

// Callback registrado para notificar al módulo de render
let listenerRender = null;

export function registrarRender(fn) {
  listenerRender = fn;
}

/**
 * Notifica al renderizador y guarda en localStorage
 */
export function notificarCambio() {
  persistirEnStorage();
  if (typeof listenerRender === 'function') {
    listenerRender();
  }
}

/**
 * Cambia el paso activo del flujo y dispara render()
 * @param {number} n - Número de paso
 */
export function irAPaso(n) {
  solicitud.paso = n;
  notificarCambio();
}

/**
 * Actualiza parcialmente los datos del equipo
 * @param {Partial<typeof solicitud.equipo>} datos 
 */
export function actualizarEquipo(datos) {
  solicitud.equipo = { ...solicitud.equipo, ...datos };
  persistirEnStorage();
}

/**
 * Actualiza el plan seleccionado
 * @param {string} planId 
 */
export function actualizarPlan(planId) {
  solicitud.plan = planId;
  notificarCambio();
}

/**
 * Actualiza el producto actual (Bonus)
 * @param {'celular'|'bicicleta'} producto 
 */
export function seleccionarProducto(producto) {
  solicitud.producto = producto;
  // Si cambia de producto, reiniciamos el equipo para evitar marcas inconsistentes
  solicitud.equipo = { marca: '', modelo: '', valor: 0, antiguedad: '' };
  solicitud.paso = 1;
  notificarCambio();
}

/**
 * Actualiza los datos del titular
 * @param {Partial<typeof solicitud.titular>} datos 
 */
export function actualizarTitular(datos) {
  solicitud.titular = { ...solicitud.titular, ...datos };
  persistirEnStorage();
}

/**
 * Actualiza los datos del pago
 * @param {Partial<typeof solicitud.pago>} datos 
 */
export function actualizarPago(datos) {
  solicitud.pago = { ...solicitud.pago, ...datos };
  persistirEnStorage();
}

/**
 * Asigna el número de póliza generado tras éxito
 * @param {string} poliza 
 */
export function fijarPoliza(poliza) {
  solicitud.poliza = poliza;
  persistirEnStorage();
}

/**
 * Activa modo edición rápida desde el resumen
 * @param {number} pasoDestino 
 */
export function iniciarEdicion(pasoDestino) {
  solicitud.retornoEdicion = solicitud.paso; // Guardamos de qué paso venía (ej: 4)
  solicitud.paso = pasoDestino;
  notificarCambio();
}

/**
 * Si estaba en modo edición rápida, regresa al paso de origen
 */
export function finalizarEdicionSiAplica() {
  if (solicitud.retornoEdicion) {
    const destino = solicitud.retornoEdicion;
    solicitud.retornoEdicion = null;
    irAPaso(destino);
    return true;
  }
  return false;
}

/**
 * Guarda el estado actual en localStorage (Bonus 12: Persistencia)
 */
export function persistirEnStorage() {
  try {
    localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(solicitud));
  } catch (e) {
    console.warn('No se pudo guardar el estado en localStorage', e);
  }
}

/**
 * Recupera el estado de localStorage si existe
 */
export function recuperarDeStorage() {
  try {
    const guardado = localStorage.getItem(STORAGE_STATE_KEY);
    if (guardado) {
      const parsed = JSON.parse(guardado);
      // Solo restauramos si no estaba en pantalla de éxito final
      if (parsed && typeof parsed.paso === 'number' && parsed.paso !== 5) {
        Object.assign(solicitud, parsed);
        return true;
      }
    }
  } catch (e) {
    console.warn('Error al recuperar de localStorage', e);
  }
  return false;
}

/**
 * Reinicia la solicitud por completo y limpia localStorage
 */
export function reiniciarSolicitud() {
  const nuevo = JSON.parse(JSON.stringify(ESTADO_INICIAL));
  for (const k in solicitud) {
    delete solicitud[k];
  }
  Object.assign(solicitud, nuevo);
  try {
    localStorage.removeItem(STORAGE_STATE_KEY);
  } catch (e) {}
  irAPaso(0);
}

