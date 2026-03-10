(function (App) {
  function createDefaultState() {
    return {
      currentGameId: 'guess-profession',
      games: {},
      teacher: {
        projectorMode: false,
        teamNames: ['Команда 1', 'Команда 2', 'Команда 3'],
        teamScores: [0, 0, 0],
        timer: {
          preset: 60,
          remaining: 60,
          running: false,
          endsAt: null,
        },
        pickerPool: 'Алина\nТимур\nСофья\nАрсений',
        pickerMode: 'students',
        lastPick: '—',
      },
    };
  }

  function buildLessonPlanModal() {
    return {
      title: 'Сценарий занятия',
      bodyHtml: `
        <p>Базовый рабочий ритм для одного занятия:</p>
        <ul class="modal__list">
          <li><strong>Разминка:</strong> запустите генератор профессий или одну карточку «Угадай профессию» на 5–7 минут.</li>
          <li><strong>Основной блок:</strong> выберите 2–3 игровых раунда и меняйте механику каждые 15–20 минут.</li>
          <li><strong>Обсуждение:</strong> после каждого ответа задавайте короткий вопрос про навыки, интересы и реальные задачи.</li>
          <li><strong>Финал:</strong> попросите назвать профессию или навык, о котором хочется узнать больше после занятия.</li>
        </ul>
        <p>Оптимально держать каждый раунд коротким и не сводить разговор только к престижу или зарплате.</p>
      `,
      actions: [
        { label: 'Открыть режим учителя', route: '/teacher' },
        { label: 'Закрыть', variant: 'secondary', action: 'modal:close' },
      ],
    };
  }

  function buildGameGuide(game) {
    return {
      title: `Как провести: ${game.meta.title}`,
      bodyHtml: `
        <p>${App.ui.escapeHtml(game.meta.teacherTip)}</p>
        <ul class="modal__list">
          ${game.meta.discussionIdeas.map(function (idea) {
            return `<li>${App.ui.escapeHtml(idea)}</li>`;
          }).join('')}
        </ul>
      `,
      actions: [
        { label: 'Открыть модуль', route: `/game/${game.meta.id}` },
        { label: 'Закрыть', variant: 'secondary', action: 'modal:close' },
      ],
    };
  }

  function boot() {
    App.modal.bind();

    const root = document.getElementById('app-view');
    if (!root) {
      return;
    }

    const app = {
      root: root,
      state: App.storage.load(createDefaultState()),
      datasets: null,
      currentRoute: { kind: 'home', path: '/' },
      navigate: function (path) {
        App.router.go(path);
      },
      persist: function () {
        App.storage.save(this.state);
      },
      randomItem: function (items) {
        return items[Math.floor(Math.random() * items.length)];
      },
      shuffle: function (items) {
        const copy = items.slice();
        for (let index = copy.length - 1; index > 0; index -= 1) {
          const swapIndex = Math.floor(Math.random() * (index + 1));
          const current = copy[index];
          copy[index] = copy[swapIndex];
          copy[swapIndex] = current;
        }
        return copy;
      },
      getProfession: function (professionId) {
        return (this.datasets.professions || []).find(function (profession) {
          return profession.id === professionId;
        }) || null;
      },
      getGameMetaList: function () {
        return Object.keys(App.games)
          .map(function (key) { return App.games[key]; })
          .sort(function (left, right) { return left.meta.order - right.meta.order; });
      },
      getGameState: function (gameId, factory) {
        if (!this.state.games[gameId]) {
          this.state.games[gameId] = typeof factory === 'function' ? factory() : App.storage.clone(factory || {});
          this.persist();
        }

        return this.state.games[gameId];
      },
      updateGameState: function (gameId, nextState, options) {
        const settings = Object.assign({ render: true, persist: true }, options || {});
        const value = typeof nextState === 'function'
          ? nextState(App.storage.clone(this.state.games[gameId] || {}))
          : nextState;

        this.state.games[gameId] = value;
        if (settings.persist) {
          this.persist();
        }
        if (settings.render) {
          this.render();
        }
      },
      updateTeacher: function (updater, options) {
        const settings = Object.assign({ render: true, persist: true }, options || {});
        const value = typeof updater === 'function'
          ? updater(App.storage.clone(this.state.teacher))
          : updater;

        this.state.teacher = value;
        if (settings.persist) {
          this.persist();
        }
        if (settings.render) {
          this.render();
        }
      },
      render: function () {
        App.ui.renderRoute(this.root, this.currentRoute, this);
        App.teacherMode.syncProjectorButtons(this);
      },
      runCurrentGameCommand: function (command) {
        const game = App.games[this.state.currentGameId];
        if (game && typeof game[command] === 'function') {
          game[command](this);
        }
      },
      openModal: function (config) {
        App.modal.open(config);
      },
    };

    function handleAppAction(action, trigger) {
      if (action === 'open-lesson-plan') {
        app.openModal(buildLessonPlanModal());
        return;
      }

      if (action === 'open-game-guide') {
        const gameId = trigger.getAttribute('data-game-id');
        const game = App.games[gameId];
        if (game) {
          app.openModal(buildGameGuide(game));
        }
      }
    }

    document.addEventListener('click', function (event) {
      const trigger = event.target.closest('[data-action], [data-route]');
      if (!trigger) {
        return;
      }

      if (trigger.hasAttribute('data-route')) {
        event.preventDefault();
        app.navigate(trigger.getAttribute('data-route'));
        return;
      }

      const action = trigger.getAttribute('data-action');
      if (!action) {
        return;
      }

      const parts = action.split(':');
      const scope = parts[0];
      const name = parts[1];

      if (scope === 'app') {
        event.preventDefault();
        handleAppAction(name, trigger);
        return;
      }

      if (scope === 'teacher') {
        event.preventDefault();
        App.teacherMode.handleAction(name, app, trigger);
        return;
      }

      if (scope === 'game') {
        event.preventDefault();
        const currentGame = App.games[app.currentRoute.gameId];
        if (currentGame && typeof currentGame.handleAction === 'function') {
          currentGame.handleAction(name, app, trigger);
        }
        return;
      }

      if (scope === 'modal') {
        event.preventDefault();
        App.modal.close();
      }
    });

    document.addEventListener('input', function (event) {
      const target = event.target;
      if (target.matches('[data-teacher-field]')) {
        App.teacherMode.handleInput(target, app);
      }
    });

    App.ui.renderLoading(root);

    App.dataLoader.loadAll()
      .then(function (datasets) {
        app.datasets = datasets;
        App.teacherMode.init(app);

        App.router.init(function (route) {
          App.modal.close();
          app.currentRoute = route;
          if (route.kind === 'game') {
            app.state.currentGameId = route.gameId;
            app.persist();
          }
          app.render();
        });

        if ('serviceWorker' in navigator && location.protocol !== 'file:') {
          navigator.serviceWorker.register('./service-worker.js').catch(function () {
            return undefined;
          });
        }
      })
      .catch(function () {
        root.innerHTML = App.ui.renderEmptyState(
          'Не удалось загрузить данные',
          'Проверьте, что все файлы проекта лежат вместе и открыты из одной папки.'
        );
      });
  }

  document.addEventListener('DOMContentLoaded', boot);
})(window.CareerGuide = window.CareerGuide || {});
