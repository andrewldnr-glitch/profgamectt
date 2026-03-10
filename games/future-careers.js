(function (App) {
  const id = 'future-careers';
  const meta = {
    id,
    order: 5,
    title: 'Профессии будущего',
    description: 'Комбинирует технологии, сферы и роли, чтобы получить новую профессию для дискуссии в группе.',
    duration: '1–2 минуты на генерацию',
    format: 'Командное обсуждение или весь класс',
    tags: ['будущее', 'технологии', 'групповая работа'],
    teacherTip: 'После генерации попросите команды придумать, какие школьные предметы и кружки могли бы готовить к этой роли.',
    discussionIdeas: [
      'Какие навыки для этой роли уже актуальны сейчас?',
      'Какие риски или этические вопросы могут возникнуть?',
      'Где такая профессия была бы особенно полезна в городе или школе?'
    ]
  };

  function createState() {
    return {
      lastCombo: null,
      history: [],
    };
  }

  function ensureState(app) {
    return app.getGameState(id, createState);
  }

  function fillTemplate(template, values) {
    return template.replace(/\{(.*?)\}/g, function (_, key) {
      return values[key] || '';
    });
  }

  function capitalize(text) {
    if (!text) {
      return '';
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function buildCombo(app) {
    const data = app.datasets.futureGenerator;
    const technology = app.randomItem(data.technologies);
    const domain = app.randomItem(data.domains);
    const role = app.randomItem(data.roles);
    const title = capitalize(fillTemplate(app.randomItem(data.title_templates), {
      role: role.name,
      techDescriptor: technology.descriptor,
      techName: technology.name,
      domainGenitive: domain.genitive,
    }));
    const description = fillTemplate(app.randomItem(data.description_templates), {
      techName: technology.name,
      domainName: domain.name,
      challenge: domain.challenge,
      roleFocus: role.focus,
    });

    return {
      title,
      description,
      technology,
      domain,
      role,
      skillSet: app.randomItem(data.skill_sets),
      discussionPrompt: app.randomItem(data.discussion_prompts),
    };
  }

  function renderHistory(history) {
    if (!history.length) {
      return '';
    }

    return `
      <section class="status-card">
        <h2 class="status-card__title">Последние идеи</h2>
        <ul class="history-list">
          ${history.map(function (item) {
            return `<li><strong>${App.ui.escapeHtml(item.title)}</strong><span class="muted">${App.ui.escapeHtml(item.domain.name)} • ${App.ui.escapeHtml(item.technology.tag)}</span></li>`;
          }).join('')}
        </ul>
      </section>
    `;
  }

  function render(app) {
    const state = ensureState(app);
    const combo = state.lastCombo;

    const body = `
      <div class="future-layout">
        <section class="future-card">
          <div>
            <p class="eyebrow">Генератор роли</p>
            <h2 class="choice-panel__title">Соберите новую профессию будущего</h2>
            <p class="choice-panel__text">Модуль полезен для командного обсуждения: сначала сгенерируйте роль, затем обсудите, кому и зачем она понадобится.</p>
          </div>
          <div class="action-row">
            <button type="button" class="button" data-action="game:generate">Сгенерировать идею</button>
            <button type="button" class="button button--ghost" data-action="game:reset">Очистить историю</button>
          </div>
          <div class="helper-panel">
            <strong>Подсказка для обсуждения:</strong>
            <p class="result-card__text">Попросите класс не спорить, «существует» ли такая профессия уже сейчас, а подумать, почему она может стать востребованной.</p>
          </div>
        </section>

        ${combo ? `
          <article class="future-card status-card--success">
            <p class="eyebrow">Получилось</p>
            <h2 class="future-card__title">${App.ui.escapeHtml(combo.title)}</h2>
            <div class="tag-row">
              <span class="badge badge--success">${App.ui.escapeHtml(combo.domain.name)}</span>
              <span class="tag">${App.ui.escapeHtml(combo.technology.tag)}</span>
              <span class="tag">${App.ui.escapeHtml(combo.role.name)}</span>
            </div>
            <p class="result-card__text">${App.ui.escapeHtml(combo.description)}</p>
            <div class="helper-panel">
              <strong>Навыковый акцент:</strong>
              <p class="result-card__text">Здесь пригодится умение ${App.ui.escapeHtml(combo.skillSet)}.</p>
            </div>
            <div class="helper-panel">
              <strong>Для обсуждения:</strong>
              <p class="result-card__text">${App.ui.escapeHtml(combo.discussionPrompt)}</p>
            </div>
          </article>
        ` : `
          <article class="status-card">
            <h2 class="status-card__title">Пока без идеи</h2>
            <p class="status-card__text">Запустите генерацию и используйте результат как отправную точку для групповой дискуссии.</p>
          </article>
        `}
      </div>
      ${renderHistory(state.history)}
    `;

    return App.ui.renderGameLayout(app, {
      gameId: id,
      meta,
      progress: state.history.length ? `Идей сгенерировано: ${state.history.length}` : 'Генератор новых ролей',
      body,
    });
  }

  function generate(app) {
    const state = ensureState(app);
    const combo = buildCombo(app);
    const history = [combo].concat(state.history || []).slice(0, 6);
    app.updateGameState(id, {
      lastCombo: combo,
      history: history,
    });
  }

  function next(app) {
    generate(app);
  }

  function reset(app) {
    app.updateGameState(id, createState());
  }

  function handleAction(action, app) {
    if (action === 'generate' || action === 'next') {
      generate(app);
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
