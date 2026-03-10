(function (App) {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setDocumentTitle(title) {
    document.title = title ? `${title} — ПрофМаршрут` : 'ПрофМаршрут — профориентационные игры';
  }

  function applyProjectorMode(enabled) {
    document.body.classList.toggle('projector-mode', Boolean(enabled));
  }

  function renderLoading(root) {
    root.innerHTML = `
      <section class="loading-screen">
        <div class="loading-screen__card card">
          <p class="eyebrow">ПрофМаршрут</p>
          <h1>Загружаем игры и материалы…</h1>
          <p class="hero__description">Подготавливаем профориентационный сценарий для занятия.</p>
        </div>
      </section>
    `;
  }

  function renderEmptyState(title, text) {
    return `
      <section class="empty-card card">
        <p class="eyebrow">ПрофМаршрут</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="hero__description">${escapeHtml(text)}</p>
        <div class="inline-actions">
          <button type="button" class="button" data-route="/">На главную</button>
          <button type="button" class="button button--secondary" data-route="/teacher">Режим учителя</button>
        </div>
      </section>
    `;
  }

  function renderCategorySummary(professions) {
    const counts = professions.reduce(function (acc, profession) {
      acc[profession.category] = (acc[profession.category] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts)
      .sort()
      .map(function (category) {
        return `<li><strong>${escapeHtml(category)}</strong><span class="muted">${counts[category]} профессий</span></li>`;
      })
      .join('');
  }

  function renderHome(app) {
    const games = app.getGameMetaList();
    const datasets = app.datasets;
    const totalGameCards = datasets.questions.length + datasets.myths.length + datasets.skillsMatching.length;
    const cards = games.map(function (game) {
      return App.gameCard.render(game.meta);
    }).join('');

    return `
      <section class="hero">
        <article class="hero__main">
          <p class="eyebrow">Профориентационное веб-приложение</p>
          <h1 class="hero__title">ПрофМаршрут</h1>
          <p class="hero__description">
            Игровые короткие модули для профориентационных занятий со школьниками 13–17 лет. Приложение удобно для телефона, ноутбука педагога и проектора.
          </p>
          <div class="hero__actions">
            <button type="button" class="button" data-route="/game/guess-profession">Начать с игры</button>
            <button type="button" class="button button--secondary" data-action="app:open-lesson-plan">Сценарий занятия</button>
            <button type="button" class="button button--ghost" data-route="/teacher">Открыть режим учителя</button>
          </div>
          <ul class="hero__stats">
            <li>
              <strong>${datasets.professions.length}</strong>
              <span>профессии в базе</span>
            </li>
            <li>
              <strong>${totalGameCards}</strong>
              <span>карточек и игровых заданий</span>
            </li>
            <li>
              <strong>5</strong>
              <span>полноценных игровых модулей</span>
            </li>
            <li>
              <strong>13–17</strong>
              <span>возрастная рамка занятий</span>
            </li>
          </ul>
        </article>

        <aside class="hero__side">
          <div class="hero__aside-image">
            <img src="assets/images/hero-pattern.svg" alt="Схематичная иллюстрация с маршрутами и карточками игры" />
          </div>
          <ul class="quick-facts">
            <li>
              <strong>Для реального занятия</strong>
              <span class="muted">Без лишних декоративных эффектов и с быстрым входом в игру.</span>
            </li>
            <li>
              <strong>С опорой на обсуждение</strong>
              <span class="muted">После каждого раунда есть повод поговорить о навыках, интересах и маршрутах.</span>
            </li>
            <li>
              <strong>Удобно педагогу</strong>
              <span class="muted">Таймер, счёт команд, крупные элементы, быстрый запуск игр.</span>
            </li>
          </ul>
        </aside>
      </section>

      <section class="section">
        <div class="section-heading">
          <div>
            <h2 class="section-heading__title">Игры для урока или классного часа</h2>
            <p class="section-heading__text">Каждый модуль рассчитан на короткий раунд и обсуждение в классе.</p>
          </div>
        </div>
        <div class="games-grid">${cards}</div>
      </section>

      <section class="section-grid">
        <article class="info-card">
          <h3 class="info-card__title">Как использовать на занятии</h3>
          <p class="info-card__text">Удобный базовый ритм: короткий разогрев → 1–2 игры → обсуждение → выводы класса.</p>
          <div class="lesson-rhythm">
            <div class="lesson-rhythm__item">
              <span class="lesson-rhythm__time">5–7 минут</span>
              <strong>Разминка</strong>
              <span class="muted">Генератор профессий или профессии будущего.</span>
            </div>
            <div class="lesson-rhythm__item">
              <span class="lesson-rhythm__time">15–20 минут</span>
              <strong>Основной игровой блок</strong>
              <span class="muted">Карточки, мифы, навыки — в команде или фронтально.</span>
            </div>
            <div class="lesson-rhythm__item">
              <span class="lesson-rhythm__time">8–10 минут</span>
              <strong>Разбор и рефлексия</strong>
              <span class="muted">Какие роли удивили, какие навыки повторяются, что захотелось изучить дальше.</span>
            </div>
          </div>
        </article>

        <article class="info-card">
          <h3 class="info-card__title">Категории профессий</h3>
          <p class="info-card__text">В базе собраны знакомые и менее очевидные роли — от цифровых и технических до гуманитарных, социальных и научных.</p>
          <ul class="category-list">${renderCategorySummary(datasets.professions)}</ul>
        </article>
      </section>
    `;
  }

  function renderGameLayout(app, options) {
    const timer = App.timer.render(App.teacherMode.getTimerState(app), { compact: true });
    const scoreboard = App.scoreboard.render(app.state.teacher, { compact: true });

    return `
      <section class="game-layout">
        <div class="game-toolbar">
          <div class="game-toolbar__top">
            <a class="back-link" href="#/">← Назад к играм</a>
            <span class="progress-chip">${escapeHtml(options.progress)}</span>
          </div>

          <aside class="teacher-quickbar">
            <div class="teacher-quickbar__row">
              <div class="teacher-quickbar__meta">
                <p class="teacher-quickbar__title">Пульт учителя</p>
                <p class="teacher-quickbar__text">Быстрый доступ к таймеру, очкам команд и управлению раундом.</p>
              </div>
              <div class="inline-actions">
                <button type="button" class="button button--secondary" data-action="game:next">Следующее задание</button>
                <button type="button" class="button button--ghost" data-action="game:reset">Начать заново</button>
                <button type="button" class="button button--ghost" data-route="/teacher">Режим учителя</button>
              </div>
            </div>
            <div class="projector-grid">
              ${timer}
              ${scoreboard}
            </div>
          </aside>
        </div>

        <article class="game-stage">
          <div class="game-stage__header">
            <p class="eyebrow">${escapeHtml(options.meta.duration)} • ${escapeHtml(options.meta.format)}</p>
            <h1 class="game-stage__title">${escapeHtml(options.meta.title)}</h1>
            <p class="game-stage__description">${escapeHtml(options.meta.description)}</p>
            <div class="tag-row">${(options.meta.tags || []).map(function (tag) {
              return `<span class="tag">${escapeHtml(tag)}</span>`;
            }).join('')}</div>
          </div>
          <div class="game-stage__content">${options.body}</div>
        </article>
      </section>
    `;
  }

  function renderRoute(root, route, app) {
    applyProjectorMode(app.state.teacher.projectorMode);

    if (route.kind === 'home') {
      setDocumentTitle('ПрофМаршрут');
      root.innerHTML = renderHome(app);
      return;
    }

    if (route.kind === 'teacher') {
      setDocumentTitle('Режим учителя');
      root.innerHTML = App.teacherMode.render(app);
      return;
    }

    if (route.kind === 'game' && App.games[route.gameId]) {
      setDocumentTitle(App.games[route.gameId].meta.title);
      root.innerHTML = App.games[route.gameId].render(app);
      return;
    }

    setDocumentTitle('Страница не найдена');
    root.innerHTML = renderEmptyState('Страница не найдена', 'Похоже, такого раздела нет. Вернитесь на главную и выберите игровой модуль заново.');
  }

  App.ui = {
    applyProjectorMode,
    escapeHtml,
    renderLoading,
    renderEmptyState,
    renderGameLayout,
    renderRoute,
  };
})(window.CareerGuide = window.CareerGuide || {});
