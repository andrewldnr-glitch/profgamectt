(function (App) {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderCompact(teacherState) {
    const items = teacherState.teamNames
      .map(function (name, index) {
        return `
          <div class="scoreboard__item">
            <div class="scoreboard__item-top">
              <span class="score-pill__label">${escapeHtml(name)}</span>
              <strong class="score-pill__value">${teacherState.teamScores[index] || 0}</strong>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <section class="scoreboard scoreboard--compact">
        <div class="scoreboard__list">${items}</div>
      </section>
    `;
  }

  function renderFull(teacherState) {
    const items = teacherState.teamNames
      .map(function (name, index) {
        const score = teacherState.teamScores[index] || 0;
        return `
          <div class="scoreboard__item">
            <div class="scoreboard__item-top">
              <input class="input-field" type="text" value="${escapeHtml(name)}" data-teacher-field="team-name" data-team-index="${index}" aria-label="Название команды ${index + 1}" />
              <strong class="scoreboard__value">${score}</strong>
            </div>
            <div class="scoreboard__controls">
              <button type="button" class="icon-button" data-action="teacher:score-decrease" data-team-index="${index}" aria-label="Убавить балл">−</button>
              <button type="button" class="button button--secondary" data-action="teacher:score-increase" data-team-index="${index}">+1 балл</button>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <section class="scoreboard">
        <div>
          <p class="eyebrow">Счёт команд</p>
          <h3 class="choice-panel__title">Текущие результаты</h3>
        </div>
        <div class="scoreboard__list">${items}</div>
      </section>
    `;
  }

  function render(teacherState, options) {
    if (options && options.compact) {
      return renderCompact(teacherState);
    }

    return renderFull(teacherState);
  }

  App.scoreboard = {
    render,
  };
})(window.CareerGuide = window.CareerGuide || {});
