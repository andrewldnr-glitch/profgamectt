(function (App) {
  const rootId = 'modal-root';
  let bound = false;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getRoot() {
    return document.getElementById(rootId);
  }

  function renderActions(actions) {
    if (!Array.isArray(actions) || !actions.length) {
      return '';
    }

    return actions
      .map((action) => {
        const variantClass = action.variant ? ` button--${action.variant}` : '';
        if (action.route) {
          return `<button type="button" class="button${variantClass}" data-route="${escapeHtml(action.route)}">${escapeHtml(action.label)}</button>`;
        }

        const dataAction = action.action || 'modal:close';
        return `<button type="button" class="button${variantClass}" data-action="${escapeHtml(dataAction)}">${escapeHtml(action.label)}</button>`;
      })
      .join('');
  }

  function close() {
    const root = getRoot();
    if (!root) {
      return;
    }

    root.innerHTML = '';
    root.removeAttribute('data-open');
    document.body.classList.remove('has-modal');
  }

  function open(config) {
    const root = getRoot();
    if (!root) {
      return;
    }

    const title = escapeHtml(config && config.title ? config.title : 'Информация');
    const bodyHtml = config && config.bodyHtml ? config.bodyHtml : '';
    const actions = renderActions(config && config.actions ? config.actions : []);

    root.setAttribute('data-open', 'true');
    root.innerHTML = `
      <div class="modal" role="presentation">
        <div class="modal__dialog" role="dialog" aria-modal="true" aria-label="${title}">
          <div class="modal__header">
            <h2 class="modal__title">${title}</h2>
            <button type="button" class="icon-button" aria-label="Закрыть окно" data-modal-close>×</button>
          </div>
          <div class="modal__body">${bodyHtml}</div>
          ${actions ? `<div class="inline-actions">${actions}</div>` : ''}
        </div>
      </div>
    `;

    document.body.classList.add('has-modal');
  }

  function bind() {
    if (bound) {
      return;
    }

    document.addEventListener('click', function (event) {
      if (event.target.matches('[data-modal-close]') || event.target.classList.contains('modal')) {
        close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        close();
      }
    });

    bound = true;
  }

  App.modal = {
    bind,
    open,
    close,
  };
})(window.CareerGuide = window.CareerGuide || {});
