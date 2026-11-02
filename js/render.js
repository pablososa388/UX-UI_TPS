/**
 * js/render.js
 * Coordinador de vistas y renderizado reactivo a partir del estado.
 * Se encarga de mostrar/ocultar secciones con [hidden] y sincronizar la interfaz.
 */

import { solicitud, irAPaso, iniciarEdicion, actualizarPlan } from './estado.js';
import { calcularCuota, formatearMoneda, FACTORES_ANTIGUEDAD } from './cotizador.js';
import { formatearInputMoneda } from './masks.js';

// Cache de planes cargados
let planesActuales = [];

export function setPlanesCache(planes) {
  planesActuales = planes;
}

export function getPlanesCache() {
  return planesActuales;
}

const TEXTOS_ANTIGUEDAD = {
  menos_1: 'Menos de 1 año',
  '1_a_2': '1 a 2 años',
  mas_2: 'Más de 2 años',
};

const TITULOS_PASOS = {
  1: 'Cotización',
  2: 'Elección de plan',
  3: 'Datos personales',
  4: 'Confirmación y pago',
};

/**
 * Función principal de render.
 * Actualiza qué sección está visible y refresca los componentes activos.
 */
export function render() {
  // 1. Mostrar/ocultar pantallas mediante el atributo hidden según la sección 6.3
  const secciones = document.querySelectorAll('[data-paso]');
  secciones.forEach((s) => {
    const pasoSeccion = Number(s.dataset.paso);
    s.hidden = pasoSeccion !== solicitud.paso;
  });

  // 2. Control de visibilidad del contenedor de checkout y steppers
  const contenedorStepper = document.getElementById('checkout-stepper-container');
  const asideResumen = document.getElementById('checkout-summary-aside');
  const bannerModoEdicion = document.getElementById('banner-modo-edicion');

  const enCheckout = solicitud.paso >= 1 && solicitud.paso <= 4;

  if (contenedorStepper) {
    contenedorStepper.hidden = !enCheckout;
  }
  if (asideResumen) {
    asideResumen.hidden = !enCheckout;
  }

  // Banner informativo si está editando un paso previo desde el resumen
  if (bannerModoEdicion) {
    bannerModoEdicion.hidden = !solicitud.retornoEdicion;
  }

  // 3. Renderizar componentes específicos según el estado
  if (enCheckout) {
    renderStepper();
    renderResumen();
  }

  if (solicitud.paso === 1) {
    poblarPasoCotizar();
  } else if (solicitud.paso === 2) {
    renderPlanes();
  } else if (solicitud.paso === 3) {
    poblarPasoTitular();
  } else if (solicitud.paso === 4) {
    poblarPasoPago();
  } else if (solicitud.paso === 5) {
    renderPantallaExito();
  } else if (solicitud.paso === 6) {
    renderPantallaError();
  }

  // Scroll suave al inicio del contenido principal para mejor UX
  if (solicitud.paso > 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Renderiza el Stepper de 4 pasos (Desktop y Mobile)
 */
export function renderStepper() {
  const pasoActual = solicitud.paso;

  // Desktop Stepper
  for (let i = 1; i <= 4; i++) {
    const item = document.getElementById(`step-item-${i}`);
    const connector = document.getElementById(`step-connector-${i}`);

    if (item) {
      item.classList.remove('is-complete', 'is-active', 'is-pending');
      const circle = item.querySelector('.step-circle');

      if (i < pasoActual) {
        item.classList.add('is-complete');
        if (circle) {
          circle.innerHTML = `
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          `;
        }
      } else if (i === pasoActual) {
        item.classList.add('is-active');
        if (circle) circle.textContent = String(i);
      } else {
        item.classList.add('is-pending');
        if (circle) circle.textContent = String(i);
      }
    }

    if (connector) {
      if (i < pasoActual) {
        connector.classList.add('is-active');
      } else {
        connector.classList.remove('is-active');
      }
    }
  }

  // Mobile Stepper
  const mobileTitle = document.getElementById('mobile-stepper-title');
  const mobileCount = document.getElementById('mobile-stepper-count');
  const mobileBar = document.getElementById('mobile-stepper-bar');

  if (mobileTitle && TITULOS_PASOS[pasoActual]) {
    mobileTitle.textContent = TITULOS_PASOS[pasoActual];
  }
  if (mobileCount) {
    mobileCount.textContent = `Paso ${pasoActual} de 4`;
  }
  if (mobileBar) {
    mobileBar.style.width = `${(pasoActual / 4) * 100}%`;
  }
}

/**
 * Renderiza el Resumen (Desktop y Mobile).
 * Cumple la Regla de Oro: se genera una sola vez desde el estado.
 */
export function renderResumen() {
  const badgeProducto = document.getElementById('resumen-badge-producto');
  const valorEquipo = document.getElementById('resumen-equipo-valor');
  const detalleEquipo = document.getElementById('resumen-equipo-detalle');
  const nombrePlan = document.getElementById('resumen-plan-nombre');
  const cuotaPlan = document.getElementById('resumen-plan-cuota');
  const nombreTitular = document.getElementById('resumen-titular-nombre');
  const emailTitular = document.getElementById('resumen-titular-email');
  const totalMonto = document.getElementById('resumen-total-monto');

  const btnEditEquipo = document.getElementById('btn-edit-resumen-equipo');
  const btnEditPlan = document.getElementById('btn-edit-resumen-plan');
  const btnEditTitular = document.getElementById('btn-edit-resumen-titular');

  // Tipo de producto
  if (badgeProducto) {
    badgeProducto.textContent = solicitud.producto === 'bicicleta' ? 'Seguro Bicicleta' : 'Seguro Celular';
  }

  // Equipo
  if (valorEquipo) {
    if (solicitud.equipo.marca && solicitud.equipo.modelo) {
      valorEquipo.textContent = `${solicitud.equipo.marca} ${solicitud.equipo.modelo}`;
    } else {
      valorEquipo.textContent = 'Equipo sin definir';
    }
  }

  if (detalleEquipo) {
    const partes = [];
    if (solicitud.equipo.valor) {
      partes.push(`Val: ${formatearMoneda(solicitud.equipo.valor)}`);
    }
    if (solicitud.equipo.antiguedad && TEXTOS_ANTIGUEDAD[solicitud.equipo.antiguedad]) {
      partes.push(TEXTOS_ANTIGUEDAD[solicitud.equipo.antiguedad]);
    }
    detalleEquipo.textContent = partes.length > 0 ? partes.join(' • ') : 'Completá el paso 1';
  }

  // Plan y cuota
  const planObj = planesActuales.find((p) => p.id === solicitud.plan) || planesActuales[0];
  let cuotaCalculada = 0;
  if (planObj && solicitud.equipo.valor && solicitud.equipo.antiguedad) {
    cuotaCalculada = calcularCuota(solicitud.equipo.valor, planObj.tasaAnual, solicitud.equipo.antiguedad);
  }

  if (nombrePlan) {
    nombrePlan.textContent = planObj ? `Plan ${planObj.nombre}` : 'Plan Plus';
  }
  if (cuotaPlan) {
    cuotaPlan.textContent = cuotaCalculada > 0 ? `${formatearMoneda(cuotaCalculada)} / mes` : '$ 0 / mes';
  }

  // Titular
  const tieneTitular = solicitud.titular.nombre && solicitud.titular.apellido;
  if (nombreTitular) {
    nombreTitular.textContent = tieneTitular
      ? `${solicitud.titular.nombre} ${solicitud.titular.apellido}`
      : 'Pendiente de carga';
  }
  if (emailTitular) {
    emailTitular.textContent = solicitud.titular.email || 'Paso 3';
  }

  // Total
  if (totalMonto) {
    totalMonto.textContent = formatearMoneda(cuotaCalculada);
  }

  // Botones de edición rápida (Punto 12 Bonus)
  if (btnEditEquipo) {
    btnEditEquipo.hidden = solicitud.paso <= 1;
    btnEditEquipo.onclick = () => iniciarEdicion(1);
  }
  if (btnEditPlan) {
    btnEditPlan.hidden = solicitud.paso <= 2;
    btnEditPlan.onclick = () => iniciarEdicion(2);
  }
  if (btnEditTitular) {
    btnEditTitular.hidden = solicitud.paso <= 3;
    btnEditTitular.onclick = () => iniciarEdicion(3);
  }
}

/**
 * Renderiza las tarjetas de plan en el Paso 2
 */
export function renderPlanes() {
  const contenedor = document.getElementById('planes-container');
  if (!contenedor || planesActuales.length === 0) return;

  contenedor.innerHTML = '';

  planesActuales.forEach((plan) => {
    const cuota = calcularCuota(
      solicitud.equipo.valor,
      plan.tasaAnual,
      solicitud.equipo.antiguedad
    );

    const isChecked = solicitud.plan === plan.id;

    const wrapper = document.createElement('label');
    wrapper.className = 'plan-card-wrapper';
    wrapper.setAttribute('for', `plan-radio-${plan.id}`);

    const badgeHtml = plan.recomendado
      ? `<span class="badge plan-badge-recommended" data-variant="primary">Recomendado</span>`
      : '';

    const coberturasHtml = plan.coberturas
      .map(
        (cob) => `
        <li class="plan-feature-item">
          <svg class="plan-feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>${cob}</span>
        </li>
      `
      )
      .join('');

    wrapper.innerHTML = `
      <input type="radio" 
             name="plan" 
             id="plan-radio-${plan.id}" 
             value="${plan.id}" 
             class="plan-radio"
             ${isChecked ? 'checked' : ''}>
      <div class="plan-card-inner">
        ${badgeHtml}
        <div class="plan-header">
          <h3 class="plan-name">${plan.nombre}</h3>
          <p class="plan-rate">Tasa anual: ${(plan.tasaAnual * 100).toFixed(0)}%</p>
        </div>
        <div class="plan-price-wrapper">
          <span class="plan-price">${formatearMoneda(cuota)}</span>
          <span class="plan-frequency">/ mes</span>
        </div>
        <ul class="plan-features-list">
          ${coberturasHtml}
        </ul>
      </div>
    `;

    const radioInput = wrapper.querySelector('input[type="radio"]');
    radioInput.addEventListener('change', () => {
      actualizarPlan(plan.id);
    });

    contenedor.appendChild(wrapper);
  });
}

/**
 * Rellena los campos del Paso 1 (Cotizar) desde el estado
 */
export function poblarPasoCotizar() {
  const selectMarca = document.getElementById('input-marca');
  const inputModelo = document.getElementById('input-modelo');
  const inputValor = document.getElementById('input-valor');
  const radiosAntiguedad = document.querySelectorAll('input[name="antiguedad"]');
  const tituloPaso1 = document.getElementById('cotizar-titulo-producto');

  if (tituloPaso1) {
    tituloPaso1.textContent = solicitud.producto === 'bicicleta'
      ? 'Cotizá el seguro de tu Bicicleta'
      : 'Cotizá el seguro de tu Celular';
  }

  // Adaptar opciones de marca según el producto
  actualizarOpcionesMarca(selectMarca);

  if (selectMarca && solicitud.equipo.marca) {
    selectMarca.value = solicitud.equipo.marca;
  }
  if (inputModelo && solicitud.equipo.modelo) {
    inputModelo.value = solicitud.equipo.modelo;
  }
  if (inputValor && solicitud.equipo.valor) {
    inputValor.value = formatearInputMoneda(solicitud.equipo.valor);
  }
  if (radiosAntiguedad) {
    radiosAntiguedad.forEach((r) => {
      r.checked = r.value === solicitud.equipo.antiguedad;
    });
  }
}

/**
 * Actualiza las opciones del select de marcas según el producto seleccionado
 */
function actualizarOpcionesMarca(select) {
  if (!select) return;
  const esBici = solicitud.producto === 'bicicleta';

  const marcasCelular = [
    { val: 'Samsung', label: 'Samsung' },
    { val: 'Apple', label: 'Apple' },
    { val: 'Motorola', label: 'Motorola' },
    { val: 'Xiaomi', label: 'Xiaomi' },
    { val: 'Google', label: 'Google' },
  ];

  const marcasBici = [
    { val: 'Trek', label: 'Trek' },
    { val: 'Specialized', label: 'Specialized' },
    { val: 'Giant', label: 'Giant' },
    { val: 'Venzo', label: 'Venzo' },
    { val: 'Raleigh', label: 'Raleigh' },
  ];

  const marcas = esBici ? marcasBici : marcasCelular;
  const valorActual = select.value;

  select.innerHTML = '<option value="">Seleccioná una marca</option>';
  marcas.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m.val;
    opt.textContent = m.label;
    select.appendChild(opt);
  });

  if (valorActual) {
    select.value = valorActual;
  }
}

/**
 * Rellena los campos del Paso 3 (Titular) desde el estado
 */
export function poblarPasoTitular() {
  const nombre = document.getElementById('input-nombre');
  const apellido = document.getElementById('input-apellido');
  const dni = document.getElementById('input-dni');
  const nacimiento = document.getElementById('input-nacimiento');
  const email = document.getElementById('input-email');
  const celular = document.getElementById('input-celular');
  const terminos = document.getElementById('input-terminos');

  if (nombre) nombre.value = solicitud.titular.nombre || '';
  if (apellido) apellido.value = solicitud.titular.apellido || '';
  if (dni) dni.value = solicitud.titular.dni || '';
  if (nacimiento) nacimiento.value = solicitud.titular.nacimiento || '';
  if (email) email.value = solicitud.titular.email || '';
  if (celular) celular.value = solicitud.titular.celular || '';
  if (terminos) terminos.checked = Boolean(solicitud.titular.terminos);
}

/**
 * Rellena los campos del Paso 4 (Pago) desde el estado
 */
export function poblarPasoPago() {
  const titularPago = document.getElementById('input-pago-titular');
  const tarjeta = document.getElementById('input-pago-tarjeta');
  const vencimiento = document.getElementById('input-pago-vencimiento');
  const cvv = document.getElementById('input-pago-cvv');
  const radiosMetodo = document.querySelectorAll('input[name="pago-metodo"]');

  if (radiosMetodo) {
    radiosMetodo.forEach((r) => {
      r.checked = r.value === solicitud.pago.metodo;
    });
  }

  // Si el titular de la tarjeta está vacío, sugerir el nombre del titular del seguro
  if (titularPago) {
    if (!solicitud.pago.titular && solicitud.titular.nombre && solicitud.titular.apellido) {
      solicitud.pago.titular = `${solicitud.titular.nombre} ${solicitud.titular.apellido}`;
    }
    titularPago.value = solicitud.pago.titular || '';
  }

  if (tarjeta) tarjeta.value = solicitud.pago.tarjeta || '';
  if (vencimiento) vencimiento.value = solicitud.pago.vencimiento || '';
  if (cvv) cvv.value = solicitud.pago.cvv || '';
}

/**
 * Renderiza la pantalla 06: Éxito
 */
export function renderPantallaExito() {
  const polizaEl = document.getElementById('exito-poliza-numero');
  const titularEl = document.getElementById('exito-titular-nombre');
  const emailEl = document.getElementById('exito-titular-email');
  const productoEl = document.getElementById('exito-producto-equipo');
  const planEl = document.getElementById('exito-plan-detalle');
  const fechaEl = document.getElementById('exito-fecha-emision');

  if (polizaEl) polizaEl.textContent = solicitud.poliza || 'POL-2026-000001';
  if (titularEl) titularEl.textContent = `${solicitud.titular.nombre} ${solicitud.titular.apellido}`;
  if (emailEl) emailEl.textContent = solicitud.titular.email;
  if (productoEl) {
    productoEl.textContent = `${solicitud.producto === 'bicicleta' ? 'Bicicleta' : 'Celular'}: ${solicitud.equipo.marca} ${solicitud.equipo.modelo}`;
  }

  const planObj = planesActuales.find((p) => p.id === solicitud.plan);
  const cuota = planObj ? calcularCuota(solicitud.equipo.valor, planObj.tasaAnual, solicitud.equipo.antiguedad) : 0;
  if (planEl) {
    planEl.textContent = `${planObj ? planObj.nombre : 'Plus'} (${formatearMoneda(cuota)} / mes)`;
  }
  if (fechaEl) {
    fechaEl.textContent = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}

/**
 * Renderiza la pantalla 07: Error de pago
 */
export function renderPantallaError() {
  const motivoEl = document.getElementById('error-pago-motivo');
  if (motivoEl) {
    motivoEl.textContent = 'Tarjeta rechazada por la entidad emisora (código de simulación: 4000 0000 0000 0002).';
  }
}

