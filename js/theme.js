/**
 * js/theme.js
 * Manejador de modo oscuro / claro con variables CSS y persistencia
 * Requisito Bonus del Punto 12
 */

const THEME_KEY = 'cubri_seguros_theme';

/**
 * Inicializa el tema leyendo preferencia guardada o preferencia del sistema
 */
export function inicializarTema() {
  const guardado = localStorage.getItem(THEME_KEY);
  const prefiereOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const temaFinal = guardado || (prefiereOscuro ? 'dark' : 'light');
  aplicarTema(temaFinal);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', alternarTema);
  }
}

/**
 * Aplica el tema agregando o quitando la clase .dark al <html>
 * @param {'dark'|'light'} tema 
 */
export function aplicarTema(tema) {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle-btn');

  if (tema === 'dark') {
    root.classList.add('dark');
    localStorage.setItem(THEME_KEY, 'dark');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', 'Cambiar a modo claro');
      toggleBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      `;
    }
  } else {
    root.classList.remove('dark');
    localStorage.setItem(THEME_KEY, 'light');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', 'Cambiar a modo oscuro');
      toggleBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      `;
    }
  }
}

/**
 * Alterna entre modo claro y oscuro
 */
export function alternarTema() {
  const esOscuro = document.documentElement.classList.contains('dark');
  aplicarTema(esOscuro ? 'light' : 'dark');
}

