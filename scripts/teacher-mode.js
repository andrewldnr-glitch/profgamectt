(function (App) {
  let timerInterval = null;

  function getTimerState(app) {
    const timer = app.state.teacher.timer || { preset: 60, remaining: 60, running: false, endsAt: null };
    let remaining = Number(timer.remaining) || Number(timer.preset) || 60;

    if (timer.running && timer.endsAt) {
      remaining = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
    }

    return {
      preset: Number(timer.preset) || 60,
      remaining,
      running: Boolean(timer.running && remaining > 0),
    };
  }

  function syncProjectorButtons(app) {
    const label = app.state.teacher.projectorMode ? 'Обычный режим' : 'Режим проектора';
    document.querySelectorAll('[data-projector-toggle-label]').forEach(function (element) {
      element.textContent = label;
    });
    App.ui.applyProjectorMode(app.state.teacher.projectorMode);
  }

  function syncTimerDisplays(app) {
    const timer = getTimerState(app);

    document.querySelectorAll('[data-timer-display]').forEach(function (element) {
      element.textContent = App.timer.format(timer.remaining);
    });

    document.querySelectorAll('[data-timer-status]').forEach(function (element) {
      element.textContent = timer.running ? 'Таймер идёт' : 'Пауза';
    });

    syncProjectorButtons(app);
  }

  function init(app) {
    if (timerInterval) {
      window.clearInterval(timerInterval);
    }

    timerInterval = window.setInterval(function () {
      const timer = getTimerState(app);
      if (app.state.teacher.timer.running && timer.remaining <= 0) {
        app.updateTeacher(function (teacher) {
          const next = App.storage.clone(teacher);
          next.timer.running = false;
          next.timer.remaining = 0;
          next.timer.endsAt = null;
          return next;
        }, { render: false });
      }
      syncTimerDisplays(app);
    }, 400);

    syncTimerDisplays(app);
  }

  function setTeamCount(app, count) {
    app.updateTeacher(function (teacher) {
      const next = App.storage.clone(teacher);
      const names = next.teamNames.slice(0, count);
      const scores = next.teamScores.slice(0, count);

      while (names.length < count) {
        names.push(`Команда ${names.length + 1}`);
      }

      while (scores.length < count) {
        scores.push(0);
      }

      next.teamNames = names;
      next.teamScores = scores;
      return next;
    });
  }

  function adjustScore(app, index, delta) {
    app.updateTeacher(function (teacher) {
      const next = App.storage.clone(teacher);
      const current = Number(next.teamScores[index]) || 0;
      next.teamScores[index] = Math.max(0, current + delta);
      return next;
    }, { render: true });
  }

  function resetScores(app) {
    app.updateTeacher(function (teacher) {
      const next = App.storage.clone(teacher);
      next.teamScores = next.teamScores.map(function () {
        return 0;
      });
      return next;
    });
  }

  function setTimerPreset(app, seconds) {
    const preset = Number(seconds) || 60;
    app.updateTeacher(function (teacher) {
      const next = App.storage.clone(teacher);
      next.timer.preset = preset;
      next.timer.remaining = preset;
      next.timer.running = false;
      next.timer.endsAt = null;
      return next;
    }, { render: true });
  }

  function startTimer(app) {
    const timer = getTimerState(app);
    app.updateTeacher(function (teacher) {
      const next = App.storage.clone(teacher);
      next.timer.running = true;
      next.timer.remaining = timer.remaining;
      next.timer.endsAt = Date.now() + timer.remaining * 1000;
      return next;
    }, { render: false });
    syncTimerDisplays(app);
  }

  function pauseTimer(app) {
    const timer = getTimerState(app);
    app.updateTeacher(function (teacher) {
      const next = App.storage.clone(teacher);
      next.timer.running = false;
      next.timer.remaining = timer.remaining;
      next.timer.endsAt = null;
      return next;
    }, { render: true });
  }

  function resetTimer(app) {
    const preset = getTimerState(app).preset;
    setTimerPreset(app, preset);
  }

  function parsePickerPool(text) {
    return String(text || '')
      .split(/[\n,;]/)
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function pickRandom(app) {
    app.updateTeacher(function (teacher) {
      const next = App.storage.clone(teacher);
      const pool = next.pickerMode === 'teams'
        ? next.teamNames.filter(Boolean)
        : parsePickerPool(next.pickerPool);

      if (!pool.length) {
        next.lastPick = next.pickerMode === 'teams'
          ? 'Добавьте хотя бы одну команду.'
          : 'Добавьте список имён или ролей.';
        return next;
      }

      next.lastPick = app.randomItem(pool);
      return next;
    });
  }

  function renderLauncherCards(app) {
    return app.getGameMetaList().map(function (game) {
      return `
        <article class="teacher-launcher__card">
          <p class="eyebrow">${App.ui.escapeHtml(game.meta.duration)}</p>
          <h3>${App.ui.escapeHtml(game.meta.title)}</h3>
          <p class="current-module__text">${App.ui.escapeHtml(game.meta.description)}</p>
          <button type="button" class="button" data-action="teacher:launch-game" data-game-id="${App.ui.escapeHtml(game.meta.id)}">Запустить модуль</button>
        </article>
      `;
    }).join('');
  }

  function render(app) {
    const teacher = app.state.teacher;
    const timer = App.timer.render(getTimerState(app));
    const scoreboard = App.scoreboard.render(teacher);
    const currentGame = App.games[app.state.currentGameId];
    const currentGameTitle = currentGame ? currentGame.meta.title : 'Пока открыт стартовый экран';

    return `
      <section class="teacher-page">
        <header class="teacher-page__header">
          <div>
            <p class="eyebrow">Пульт занятия</p>
            <h1 class="teacher-page__title">Режим учителя</h1>
            <p class="teacher-page__intro">Здесь собраны крупные элементы управления для урока: запуск игровых модулей, таймер, счёт команд, случайный выбор ученика или команды, а также режим проектора.</p>
          </div>
          <div class="inline-actions">
            <button type="button" class="button button--secondary" data-action="app:open-lesson-plan">Сценарий занятия</button>
            <button type="button" class="button button--ghost" data-action="teacher:toggle-projector" data-projector-toggle-label>${teacher.projectorMode ? 'Обычный режим' : 'Режим проектора'}</button>
          </div>
        </header>

        <section class="teacher-layout">
          <div class="teacher-layout__panel">
            <div>
              <p class="eyebrow">Запуск модулей</p>
              <h2>Открыть игру для класса</h2>
            </div>
            <div class="teacher-launcher">${renderLauncherCards(app)}</div>
          </div>

          <div class="teacher-layout__panel current-module">
            <div>
              <p class="eyebrow">Текущий модуль</p>
              <h2 class="current-module__title">${App.ui.escapeHtml(currentGameTitle)}</h2>
              <p class="current-module__text">Используйте эти кнопки, если ведёте занятие с проектора и хотите быстро двигаться по раундам.</p>
            </div>
            <div class="current-module__actions">
              <button type="button" class="button" data-action="teacher:next-current">Следующее задание</button>
              <button type="button" class="button button--secondary" data-action="teacher:reset-current">Перезапустить модуль</button>
              <button type="button" class="button button--ghost" data-route="/game/${App.ui.escapeHtml(app.state.currentGameId)}">Открыть модуль</button>
            </div>
            <div class="status-card status-card--warning">
              <h3 class="status-card__title">Подсказка для педагога</h3>
              <p class="status-card__text">Лучше держать раунд коротким: сначала гипотезы класса, затем быстрый ответ и короткий вопрос на обсуждение.</p>
            </div>
          </div>
        </section>

        <section class="teacher-layout">
          <div class="teacher-layout__panel">
            ${timer}
            <section class="picker-card">
              <div>
                <p class="eyebrow">Случайный выбор</p>
                <h3 class="choice-panel__title">Кто отвечает следующим?</h3>
                <p class="choice-panel__text">Можно выбирать отдельного ученика, роль в группе или команду.</p>
              </div>

              <div class="teacher-mode__tabs">
                <button type="button" class="chip-button ${teacher.pickerMode === 'students' ? 'chip-button--active' : ''}" data-action="teacher:set-picker-mode" data-mode="students">Ученики / роли</button>
                <button type="button" class="chip-button ${teacher.pickerMode === 'teams' ? 'chip-button--active' : ''}" data-action="teacher:set-picker-mode" data-mode="teams">Команды</button>
              </div>

              <label class="small-label" for="picker-pool">Список имён или ролей</label>
              <textarea id="picker-pool" class="textarea-field" data-teacher-field="picker-pool" placeholder="Например: Алина, Тимур, Софья, Арсений">${App.ui.escapeHtml(teacher.pickerPool)}</textarea>

              <div class="inline-actions">
                <button type="button" class="button" data-action="teacher:pick-random">Выбрать случайно</button>
              </div>

              <div class="picker-result">
                <span class="picker-result__label">Результат</span>
                <strong class="picker-result__value">${App.ui.escapeHtml(teacher.lastPick || '—')}</strong>
              </div>
            </section>
          </div>

          <div class="teacher-layout__panel">
            ${scoreboard}
            <div>
              <p class="small-label">Количество команд</p>
              <div class="team-count-switch">
                <button type="button" class="chip-button ${teacher.teamNames.length === 2 ? 'chip-button--active' : ''}" data-action="teacher:team-count" data-count="2">2 команды</button>
                <button type="button" class="chip-button ${teacher.teamNames.length === 3 ? 'chip-button--active' : ''}" data-action="teacher:team-count" data-count="3">3 команды</button>
                <button type="button" class="chip-button ${teacher.teamNames.length === 4 ? 'chip-button--active' : ''}" data-action="teacher:team-count" data-count="4">4 команды</button>
              </div>
            </div>
            <div class="inline-actions">
              <button type="button" class="button button--ghost" data-action="teacher:score-reset">Сбросить счёт</button>
            </div>
          </div>
        </section>

        <section class="teacher-layout">
          <div class="teacher-layout__panel lesson-card">
            <div>
              <p class="eyebrow">Ритм урока</p>
              <h2>Как держать внимание класса</h2>
            </div>
            <div class="lesson-rhythm">
              <div class="lesson-rhythm__item">
                <span class="lesson-rhythm__time">В начале</span>
                <strong>Короткий вход в тему</strong>
                <span class="muted">Запустите генератор профессий или одну карточку с подсказками как разминку.</span>
              </div>
              <div class="lesson-rhythm__item">
                <span class="lesson-rhythm__time">В середине</span>
                <strong>Смена механики</strong>
                <span class="muted">Через 15–20 минут лучше перейти к другому формату: мифы, навыки или профессии будущего.</span>
              </div>
              <div class="lesson-rhythm__item">
                <span class="lesson-rhythm__time">В конце</span>
                <strong>Короткая рефлексия</strong>
                <span class="muted">Попросите назвать одну профессию или один навык, о котором захотелось узнать больше.</span>
              </div>
            </div>
          </div>

          <div class="teacher-layout__panel">
            <div>
              <p class="eyebrow">Памятка</p>
              <h2>Что помогает обсуждению</h2>
            </div>
            <ul class="feature-list">
              <li>Не искать одну «правильную» профессию, а обсуждать разные маршруты и сочетания навыков.</li>
              <li>После ответа просить класс назвать, какие предметы, кружки или проекты связаны с этой ролью.</li>
              <li>Поощрять аргументы и любопытство, а не только скорость и победу команды.</li>
              <li>Не сводить разговор о профессиях только к зарплате или престижу.</li>
            </ul>
            <p class="footer-note">Состояние таймера, очков и списков сохраняется в браузере автоматически.</p>
          </div>
        </section>
      </section>
    `;
  }

  function handleAction(action, app, trigger) {
    switch (action) {
      case 'toggle-projector':
        app.updateTeacher(function (teacher) {
          const next = App.storage.clone(teacher);
          next.projectorMode = !next.projectorMode;
          return next;
        }, { render: true });
        break;
      case 'timer-start':
        startTimer(app);
        break;
      case 'timer-pause':
        pauseTimer(app);
        break;
      case 'timer-reset':
        resetTimer(app);
        break;
      case 'timer-preset':
        setTimerPreset(app, trigger.getAttribute('data-seconds'));
        break;
      case 'score-increase':
        adjustScore(app, Number(trigger.getAttribute('data-team-index')), 1);
        break;
      case 'score-decrease':
        adjustScore(app, Number(trigger.getAttribute('data-team-index')), -1);
        break;
      case 'score-reset':
        resetScores(app);
        break;
      case 'team-count':
        setTeamCount(app, Number(trigger.getAttribute('data-count')) || 3);
        break;
      case 'pick-random':
        pickRandom(app);
        break;
      case 'set-picker-mode':
        app.updateTeacher(function (teacher) {
          const next = App.storage.clone(teacher);
          next.pickerMode = trigger.getAttribute('data-mode') || 'students';
          return next;
        });
        break;
      case 'launch-game':
        app.navigate(`/game/${trigger.getAttribute('data-game-id')}`);
        break;
      case 'next-current':
        app.runCurrentGameCommand('next');
        break;
      case 'reset-current':
        app.runCurrentGameCommand('reset');
        break;
      default:
        break;
    }
  }

  function handleInput(target, app) {
    if (target.getAttribute('data-teacher-field') === 'team-name') {
      const index = Number(target.getAttribute('data-team-index'));
      const value = target.value.trim() || `Команда ${index + 1}`;
      app.updateTeacher(function (teacher) {
        const next = App.storage.clone(teacher);
        next.teamNames[index] = value;
        return next;
      }, { render: false });
      return;
    }

    if (target.getAttribute('data-teacher-field') === 'picker-pool') {
      app.updateTeacher(function (teacher) {
        const next = App.storage.clone(teacher);
        next.pickerPool = target.value;
        return next;
      }, { render: false });
    }
  }

  App.teacherMode = {
    getTimerState,
    handleAction,
    handleInput,
    init,
    render,
    syncProjectorButtons,
  };
})(window.CareerGuide = window.CareerGuide || {});
