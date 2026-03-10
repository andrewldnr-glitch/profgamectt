(function (App) {
  function format(seconds) {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
    const remain = String(safeSeconds % 60).padStart(2, '0');
    return `${minutes}:${remain}`;
  }

  function render(timerState, options) {
    const state = timerState || { remaining: 60, preset: 60, running: false };
    const compact = options && options.compact;

    if (compact) {
      return `
        <div class="status-card">
          <span class="small-label">Таймер</span>
          <strong class="timer-card__value" data-timer-display>${format(state.remaining)}</strong>
          <span class="small-label" data-timer-status>${state.running ? 'Таймер идёт' : 'Пауза'}</span>
        </div>
      `;
    }

    return `
      <section class="timer-card">
        <div>
          <p class="eyebrow">Таймер раунда</p>
          <h3 class="choice-panel__title">Темп занятия</h3>
        </div>
        <div class="timer-card__meta">
          <span class="timer-card__label" data-timer-status>${state.running ? 'Таймер идёт' : 'Пауза'}</span>
          <strong class="timer-card__value" data-timer-display>${format(state.remaining)}</strong>
          <span class="timer-card__label">Базовый раунд: ${format(state.preset)}</span>
        </div>
        <div class="timer-presets">
          <button type="button" class="chip-button ${state.preset === 30 ? 'chip-button--active' : ''}" data-action="teacher:timer-preset" data-seconds="30">30 сек</button>
          <button type="button" class="chip-button ${state.preset === 60 ? 'chip-button--active' : ''}" data-action="teacher:timer-preset" data-seconds="60">1 мин</button>
          <button type="button" class="chip-button ${state.preset === 90 ? 'chip-button--active' : ''}" data-action="teacher:timer-preset" data-seconds="90">1:30</button>
          <button type="button" class="chip-button ${state.preset === 120 ? 'chip-button--active' : ''}" data-action="teacher:timer-preset" data-seconds="120">2 мин</button>
        </div>
        <div class="inline-actions">
          <button type="button" class="button" data-action="teacher:timer-start">Старт</button>
          <button type="button" class="button button--secondary" data-action="teacher:timer-pause">Пауза</button>
          <button type="button" class="button button--ghost" data-action="teacher:timer-reset">Сброс</button>
        </div>
      </section>
    `;
  }

  App.timer = {
    format,
    render,
  };
})(window.CareerGuide = window.CareerGuide || {});
