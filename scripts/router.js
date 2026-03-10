(function (App) {
  let changeHandler = null;

  function parseHash(hash) {
    const clean = (hash || '').replace(/^#/, '') || '/';
    const parts = clean.split('/').filter(Boolean);

    if (!parts.length) {
      return { kind: 'home', path: '/' };
    }

    if (parts[0] === 'teacher') {
      return { kind: 'teacher', path: '/teacher' };
    }

    if (parts[0] === 'game' && parts[1]) {
      return { kind: 'game', path: clean, gameId: parts[1] };
    }

    return { kind: 'not-found', path: clean };
  }

  function notify() {
    if (typeof changeHandler === 'function') {
      changeHandler(parseHash(location.hash));
    }
  }

  function init(handler) {
    changeHandler = handler;
    window.addEventListener('hashchange', notify);
    notify();
  }

  function go(path) {
    const hash = path.startsWith('#') ? path : `#${path}`;
    if (location.hash === hash) {
      notify();
      return;
    }
    location.hash = hash;
  }

  App.router = {
    init,
    go,
    parseHash,
  };
})(window.CareerGuide = window.CareerGuide || {});
