(function (App) {
  const id = 'skill-match';
  const meta = {
    id,
    order: 3,
    title: 'Профессия по навыкам',
    description: 'Класс видит набор навыков, предлагает профессию, а затем получает ответ и объяснение связи.',
    duration: '1–2 минуты на карточку',
    format: 'Обсуждение в парах или в командах',
    tags: ['навыки', 'профессии', 'рефлексия'],
    teacherTip: 'Попросите сначала назвать не одну профессию, а две возможные версии, а затем сравнить их по аргументам.',
    discussionIdeas: [
      'Какие школьные занятия развивают эти навыки?',
      'Можно ли с таким набором навыков попасть в несколько профессий?',
      'Какой навык здесь базовый, а какой можно развить позже?'
    ]
  };

  function createState(app) {
    return {
      order: app.shuffle(app.datasets.skillsMatching.map(function (item) { return item.id; })),
      index: 0,
      revealed: false,
    };
  }

  function ensureState(app) {
    const state = app.getGameState(id, function () {
      return createState(app);
    });

    if (!state.order || !state.order.length) {
      const next = createState(app);
      app.updateGameState(id, next, { render: false });
      return next;
    }

    return state;
  }

  function getCard(app, state) {
    const cardId = state.order[state.index] || state.order[0];
    return app.datasets.skillsMatching.find(function (item) {
      return item.id === cardId;
    }) || app.datasets.skillsMatching[0];
  }

  function render(app) {
    const state = ensureState(app);
    const card = getCard(app, state);
    const profession = app.getProfession(card.profession_id);

    const body = `
      <div class="future-layout">
        <section class="choice-panel">
          <div>
            <p class="eyebrow">Набор навыков</p>
            <h2 class="choice-panel__title">Какую профессию вы бы предположили?</h2>
            <p class="choice-panel__text">Сначала попробуйте устно назвать 1–2 версии, а потом откройте ответ.</p>
          </div>
          <div class="skill-chip-list">
            ${card.skills.map(function (skill) {
              return `<span class="skill-chip">${App.ui.escapeHtml(skill)}</span>`;
            }).join('')}
          </div>
          <div class="helper-panel">
            <strong>Дополнительная подсказка:</strong>
            <p class="result-card__text">${App.ui.escapeHtml(card.extra_hint)}</p>
          </div>
          <div class="action-row">
            <button type="button" class="button" data-action="game:reveal">Показать ответ</button>
            <button type="button" class="button button--secondary" data-action="game:next">Следующая карточка</button>
          </div>
        </section>

        ${state.revealed ? `
          <article class="result-card status-card--success">
            <p class="eyebrow">Подходящая версия</p>
            <h2 class="result-card__title">${App.ui.escapeHtml(card.answer)}</h2>
            <p class="result-card__text">${App.ui.escapeHtml(card.explanation)}</p>
            <div class="tag-row">
              <span class="badge badge--success">${App.ui.escapeHtml(profession ? profession.category : 'Профессия')}</span>
              <span class="tag">${App.ui.escapeHtml(profession ? profession.description : '')}</span>
            </div>
            <div class="helper-panel">
              <strong>Для обсуждения:</strong>
              <p class="result-card__text">${App.ui.escapeHtml(card.discussion_prompt)}</p>
            </div>
          </article>
        ` : `
          <article class="status-card">
            <h2 class="status-card__title">Сформулируйте аргументы</h2>
            <p class="status-card__text">Попросите учеников объяснить, почему они выбрали именно эту профессию, а не просто назвать ответ.</p>
          </article>
        `}
      </div>
    `;

    return App.ui.renderGameLayout(app, {
      gameId: id,
      meta,
      progress: `Карточка ${state.index + 1} из ${state.order.length}`,
      body,
    });
  }

  function reveal(app) {
    const state = ensureState(app);
    app.updateGameState(id, Object.assign({}, state, { revealed: true }));
  }

  function next(app) {
    const state = ensureState(app);
    const nextIndex = (state.index + 1) % state.order.length;
    app.updateGameState(id, Object.assign({}, state, { index: nextIndex, revealed: false }));
  }

  function reset(app) {
    app.updateGameState(id, createState(app));
  }

  function handleAction(action, app) {
    if (action === 'reveal') {
      reveal(app);
      return;
    }

    if (action === 'next') {
      next(app);
      return;
    }

    if (action === 'reset') {
      reset(app);
    }
  }

  App.games = App.games || {};
  App.games[id] = {
    meta,
    render,
    next,
    reset,
    handleAction,
  };
})(window.CareerGuide = window.CareerGuide || {});
