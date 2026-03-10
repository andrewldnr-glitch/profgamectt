(function (App) {
  const id = 'guess-profession';
  const meta = {
    id,
    order: 1,
    title: 'Угадай профессию',
    description: 'Класс получает 3–4 подсказки, предлагает версии, а затем открывает ответ и короткий факт.',
    duration: '1–2 минуты на карточку',
    format: 'Фронтально или командами',
    tags: ['подсказки', 'обсуждение', 'профессии'],
    teacherTip: 'Сначала попросите команды назвать 2–3 версии и аргументы, а уже потом открывайте ответ.',
    discussionIdeas: [
      'Какие навыки были слышны в подсказках?',
      'Где школьник может попробовать похожие задачи уже сейчас?',
      'Какая подсказка оказалась самой сильной и почему?'
    ]
  };

  function createState(app) {
    return {
      order: app.shuffle(app.datasets.questions.map(function (item) { return item.id; })),
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
    return app.datasets.questions.find(function (item) {
      return item.id === cardId;
    }) || app.datasets.questions[0];
  }

  function render(app) {
    const state = ensureState(app);
    const card = getCard(app, state);
    const profession = app.getProfession(card.profession_id);

    const resultMarkup = state.revealed
      ? `
        <article class="result-card status-card--success">
          <p class="eyebrow">Ответ</p>
          <h2 class="result-card__title">${App.ui.escapeHtml(card.answer)}</h2>
          <p class="result-card__text">${App.ui.escapeHtml(profession ? profession.description : '')}</p>
          <div class="tag-row">
            <span class="badge badge--success">${App.ui.escapeHtml(profession ? profession.category : 'Профессия')}</span>
            <span class="tag">Факт: ${App.ui.escapeHtml(card.fact || (profession && profession.fun_fact) || '')}</span>
          </div>
          <div class="helper-panel">
            <strong>Для обсуждения:</strong>
            <p class="result-card__text">${App.ui.escapeHtml(card.discussion_prompt)}</p>
          </div>
        </article>
      `
      : `
        <article class="status-card status-card--warning">
          <h2 class="status-card__title">Сначала версии класса</h2>
          <p class="status-card__text">Предложите ученикам назвать 2–3 гипотезы и объяснить, на какую подсказку они опираются.</p>
        </article>
      `;

    const body = `
      <div class="choice-layout">
        <section class="choice-panel">
          <div>
            <p class="eyebrow">Подсказки</p>
            <h2 class="choice-panel__title">Кто это может быть?</h2>
          </div>
          <ol class="clue-list">
            ${card.hints.map(function (hint) {
              return `<li>${App.ui.escapeHtml(hint)}</li>`;
            }).join('')}
          </ol>
          <div class="action-row">
            <button type="button" class="button" data-action="game:reveal">Показать ответ</button>
            <button type="button" class="button button--secondary" data-action="game:next">Следующая карточка</button>
          </div>
        </section>
        ${resultMarkup}
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
    reveal,
    next,
    reset,
    handleAction,
  };
})(window.CareerGuide = window.CareerGuide || {});
