(function (App) {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderTags(tags) {
    return (tags || [])
      .map(function (tag) {
        return `<span class="tag">${escapeHtml(tag)}</span>`;
      })
      .join('');
  }

  function render(meta) {
    return `
      <article class="game-card">
        <div class="game-card__meta">
          <span class="meta-chip">${escapeHtml(meta.duration)}</span>
          <span class="meta-chip">${escapeHtml(meta.format)}</span>
        </div>
        <h3 class="game-card__title">${escapeHtml(meta.title)}</h3>
        <p class="game-card__description">${escapeHtml(meta.description)}</p>
        <div class="tag-row">${renderTags(meta.tags)}</div>
        <div class="inline-actions">
          <button type="button" class="button" data-route="/game/${escapeHtml(meta.id)}">Открыть</button>
          <button type="button" class="button button--secondary" data-action="app:open-game-guide" data-game-id="${escapeHtml(meta.id)}">Как провести</button>
        </div>
      </article>
    `;
  }

  App.gameCard = {
    render,
  };
})(window.CareerGuide = window.CareerGuide || {});
