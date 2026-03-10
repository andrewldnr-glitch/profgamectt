(function (App) {
  const id = 'career-wheel';
  const meta = {
    id,
    order: 4,
    title: 'Генератор профессий',
    description: 'Случайно выбирает профессию для быстрого знакомства, обсуждения и выбора следующей темы.',
    duration: '30–60 секунд на запуск',
    format: 'Фронтально с проектором',
    tags: ['случайный выбор', 'обсуждение', 'проектор'],
    teacherTip: 'Используйте модуль как разогрев или как переход между более длинными играми.',
    discussionIdeas: [
      'Какие навыки из этой профессии уже можно попробовать в школе?',
      'Что в этой роли кажется самым неожиданным?',
      'Какой следующий модуль логично связать с выпавшей профессией?'
    ]
  };

  let spinInterval = null;
  let spinTimeout = null;

  function stopSpin() {
    if (spinInterval) {
      window.clearInterval(spinInterval);
      spinInterval = null;
    }

    if (spinTimeout) {
      window.clearTimeout(spinTimeout);
      spinTimeout = null;
    }
  }

  function createState() {
    return {
      category: 'all',
      currentProfessionId: '',
      previewName: 'Запустите генератор',
      history: [],
      isSpinning: false,
    };
  }

  function ensureState(app) {
    return app.getGameState(id, createState);
  }

  function getCategories(app) {
    return Array.from(new Set(app.datasets.professions.map(function (profession) {
      return profession.category;
    }))).sort();
  }

  function getPool(app, state) {
    if (state.category === 'all') {
      return app.datasets.professions;
    }

    return app.datasets.professions.filter(function (profession) {
      return profession.category === state.category;
    });
  }

  function render(app) {
    const state = ensureState(app);
    const categories = getCategories(app);
    const pool = getPool(app, state);
    const selectedProfession = state.currentProfessionId
      ? app.getProfession(state.currentProfessionId)
      : null;

    const body = `
      <div class="future-layout">
        <section class="roulette-panel">
          <div>
            <p class="eyebrow">Случайный выбор</p>
            <h2 class="choice-panel__title">На какой профессии остановимся сейчас?</h2>
          </div>
          <div class="filters">
            <button type="button" class="filter-chip ${state.category === 'all' ? 'filter-chip--active' : ''}" data-action="game:set-category" data-category="all">Все категории</button>
            ${categories.map(function (category) {
              return `<button type="button" class="filter-chip ${state.category === category ? 'filter-chip--active' : ''}" data-action="game:set-category" data-category="${App.ui.escapeHtml(category)}">${App.ui.escapeHtml(category)}</button>`;
            }).join('')}
          </div>
          <div class="roulette-display ${state.isSpinning ? 'roulette-display--spinning' : ''}">
            <p class="roulette-display__eyebrow">${state.category === 'all' ? 'Любая категория' : App.ui.escapeHtml(state.category)}</p>
            <h2 class="roulette-display__title">${App.ui.escapeHtml(state.previewName)}</h2>
          </div>
          <div class="action-row">
            <button type="button" class="button" data-action="game:spin">Запустить генератор</button>
            <button type="button" class="button button--ghost" data-action="game:reset">Сбросить выбор</button>
          </div>
          <p class="helper-text">Сейчас в пуле: ${pool.length} профессий.</p>
        </section>

        ${selectedProfession ? `
          <article class="result-card status-card--success">
            <p class="eyebrow">Выпало</p>
            <h2 class="result-card__title">${App.ui.escapeHtml(selectedProfession.name)}</h2>
            <p class="result-card__text">${App.ui.escapeHtml(selectedProfession.description)}</p>
            <div class="tag-row">
              <span class="badge badge--success">${App.ui.escapeHtml(selectedProfession.category)}</span>
              ${selectedProfession.skills.slice(0, 3).map(function (skill) {
                return `<span class="tag">${App.ui.escapeHtml(skill)}</span>`;
              }).join('')}
            </div>
            <div class="helper-panel">
              <strong>Для обсуждения:</strong>
              <p class="result-card__text">Какой навык из этой профессии можно начать развивать уже на школьном проекте или кружке?</p>
            </div>
          </article>
        ` : `
          <article class="status-card">
            <h2 class="status-card__title">Подходит для разогрева</h2>
            <p class="status-card__text">Спросите у класса, кто уже слышал об этой профессии, а кто впервые столкнулся с ней сейчас.</p>
          </article>
        `}
      </div>

      ${state.history.length ? `
        <section class="status-card">
          <h2 class="status-card__title">Последние выпадения</h2>
          <ul class="history-list">
            ${state.history.map(function (professionId) {
              const profession = app.getProfession(professionId);
              return `<li><strong>${App.ui.escapeHtml(profession ? profession.name : professionId)}</strong><span class="muted">${App.ui.escapeHtml(profession ? profession.category : '')}</span></li>`;
            }).join('')}
          </ul>
        </section>
      ` : ''}
    `;

    return App.ui.renderGameLayout(app, {
      gameId: id,
      meta,
      progress: 'Случайный выбор профессии',
      body,
    });
  }

  function spin(app) {
    const state = ensureState(app);
    const pool = getPool(app, state);

    if (!pool.length || state.isSpinning) {
      return;
    }

    stopSpin();
    app.updateGameState(id, Object.assign({}, state, { isSpinning: true, previewName: app.randomItem(pool).name }), {
      render: true,
      persist: false,
    });

    spinInterval = window.setInterval(function () {
      const latest = ensureState(app);
      const sample = app.randomItem(pool);
      app.updateGameState(id, Object.assign({}, latest, { isSpinning: true, previewName: sample.name }), {
        render: true,
        persist: false,
      });
    }, 90);

    spinTimeout = window.setTimeout(function () {
      stopSpin();
      const latest = ensureState(app);
      const finalChoice = app.randomItem(pool);
      const nextHistory = [finalChoice.id]
        .concat((latest.history || []).filter(function (professionId) {
          return professionId !== finalChoice.id;
        }))
        .slice(0, 6);

      app.updateGameState(id, Object.assign({}, latest, {
        currentProfessionId: finalChoice.id,
        previewName: finalChoice.name,
        history: nextHistory,
        isSpinning: false,
      }));
    }, 1200);
  }

  function setCategory(app, category) {
    stopSpin();
    const state = ensureState(app);
    app.updateGameState(id, Object.assign({}, state, {
      category: category,
      currentProfessionId: '',
      previewName: 'Запустите генератор',
      isSpinning: false,
    }));
  }

  function reset(app) {
    stopSpin();
    app.updateGameState(id, createState());
  }

  function next(app) {
    spin(app);
  }

  function handleAction(action, app, trigger) {
    if (action === 'spin') {
      spin(app);
      return;
    }

    if (action === 'set-category') {
      setCategory(app, trigger.getAttribute('data-category') || 'all');
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

  window.addEventListener('hashchange', stopSpin);

  App.games = App.games || {};
  App.games[id] = {
    meta,
    render,
    next,
    reset,
    handleAction,
  };
})(window.CareerGuide = window.CareerGuide || {});
