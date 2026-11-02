/**
 * js/toast.js
 * Sistema de notificaciones toast liviano (estilo Basecoat UI)
 * Requisito Bonus del Punto 12
 */

let toastContainer = null;

function asegurarContenedor() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      toastContainer.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

/**
 * Muestra una notificación flotante (Toast)
 * @param {string} mensaje - Texto principal del toast
 * @param {'success'|'error'|'info'} variante - Estilo visual
 * @param {number} duracion - Tiempo en milisegundos (por defecto 4000ms)
 */
export function mostrarToast(mensaje, variante = 'success', duracion = 4000) {
  const container = asegurarContenedor();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('data-variant', variante);
  toast.setAttribute('role', 'status');

  const iconoSvg = variante === 'success'
    ? `<svg class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
    : variante === 'error'
      ? `<svg class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`
      : `<svg class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

  toast.innerHTML = `
    <div class="toast-body">
      ${iconoSvg}
      <span>${mensaje}</span>
    </div>
    <button type="button" class="toast-close-btn" aria-label="Cerrar notificación">
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  `;

  const cerrar = () => {
    toast.classList.add('is-leaving');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 200);
  };

  toast.querySelector('.toast-close-btn').addEventListener('click', cerrar);

  container.appendChild(toast);

  if (duracion > 0) {
    setTimeout(cerrar, duracion);
  }
}

