(function (App) {
  const id = 'myth-or-truth';
  const meta = {
    id,
    order: 2,
    title: 'Правда или миф',
    description: 'Класс быстро отвечает «правда» или «миф», а затем обсуждает объяснение и вывод.',
    duration: '30–90 секунд на раунд',
    format: 'Фронтально, в парах или командами',
    tags: ['дебат', 'мифы', 'карьера'],
    teacherTip: 'После ответа дайте двум командам коротко защитить разные позиции, а уже потом открывайте объяснение.',
    discussionIdeas: [
      'Почему этот миф кажется правдоподобным?',
      'Какие реальные примеры его опровергают?',
      'Что из ответа можно применить к собственному выбору профиля и кружков?'
    ]
  };

  function createState(app) {
    return {
      order: app.shuffle(app.datasets.myths.map(function (item) { return item.id; })),
      index: 0,
      selected: '',
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
    const mythId = state.order[state.index] || state.order[0];
    return app.datasets.myths.find(function (item) {
      return item.id === mythId;
    }) || app.datasets.myths[0];
  }

  function buttonClass(state, answerKey, correctAnswer) {
    const classes = ['answer-button', answerKey === 'правда' ? 'answer-button--truth' : 'answer-button--myth'];

    if (state.selected === answerKey) {
      classes.push('answer-button--selected');
    }

    if (state.selected) {
      if (correctAnswer === answerKey) {
        classes.push('answer-button--correct');
      } else if (state.selected === answerKey) {
        classes.push('answer-button--wrong');
      }
    }

    return classes.join(' ');
  }

  function render(app) {
    const state = ensureState(app);
    const card = getCard(app, state);
    const answered = Boolean(state.selected);
    const correctLabel = card.answer === 'правда' ? 'Правда' : 'Миф';

    const body = `
      <div class="choice-layout">
        <section class="choice-panel">
          <div>
            <p class="eyebrow">Утверждение</p>
            <h2 class="choice-panel__title">${App.ui.escapeHtml(card.statement)}</h2>
          </div>
          <div class="choice-grid">
            <button type="button" class="${buttonClass(state, 'правда', card.answer)}" data-action="game:answer" data-value="правда" ${answered ? 'disabled' : ''}>Правда</button>
            <button type="button" class="${buttonClass(state, 'миф', card.answer)}" data-action="game:answer" data-value="миф" ${answered ? 'disabled' : ''}>Миф</button>
          </div>
          <div class="action-row">
            <button type="button" class="button button--secondary" data-action="game:next">Следующее утверждение</button>
          </div>
        </section>

        ${answered ? `
          <article class="result-card ${state.selected === card.answer ? 'status-card--success' : 'status-card--warning'}">
            <p class="eyebrow">Разбор</p>
            <h2 class="result-card__title">Верный ответ: ${correctLabel}</h2>
            <p class="result-card__text">${App.ui.escapeHtml(card.explanation)}</p>
            <div class="helper-panel">
              <strong>Для обсуждения:</strong>
              <p class="result-card__text">${App.ui.escapeHtml(card.discussion_prompt)}</p>
            </div>
          </article>
        ` : `
          <article class="status-card">
            <h2 class="status-card__title">Сначала позиция класса</h2>
            <p class="status-card__text">Попросите учеников поднять руку или выбрать сторону, а потом открывайте объяснение.</p>
          </article>
        `}
      </div>
    `;

    return App.ui.renderGameLayout(app, {
      gameId: id,
      meta,
      progress: `Утверждение ${state.index + 1} из ${state.order.length}`,
      body,
    });
  }

  function answer(app, value) {
    const state = ensureState(app);
    if (state.selected) {
      return;
    }

    app.updateGameState(id, Object.assign({}, state, { selected: value }));
  }

  function next(app) {
    const state = ensureState(app);
    const nextIndex = (state.index + 1) % state.order.length;
    app.updateGameState(id, Object.assign({}, state, { index: nextIndex, selected: '' }));
  }

  function reset(app) {
    app.updateGameState(id, createState(app));
  }

  function handleAction(action, app, trigger) {
    if (action === 'answer') {
      answer(app, trigger.getAttribute('data-value'));
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
