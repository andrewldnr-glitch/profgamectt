(function (App) {
  const STORAGE_KEY = 'career-guidance-game:state';

  function clone(value) {
    if (value === undefined) {
      return undefined;
    }

    return JSON.parse(JSON.stringify(value));
  }

  function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  function mergeDeep(base, extra) {
    if (Array.isArray(base)) {
      return Array.isArray(extra) ? clone(extra) : clone(base);
    }

    if (isObject(base)) {
      const result = clone(base);
      if (!isObject(extra)) {
        return result;
      }

      Object.keys(extra).forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(base, key)) {
          result[key] = mergeDeep(base[key], extra[key]);
        } else {
          result[key] = clone(extra[key]);
        }
      });
      return result;
    }

    return extra === undefined ? clone(base) : clone(extra);
  }

  function load(defaultState) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return clone(defaultState);
      }

      const parsed = JSON.parse(raw);
      return mergeDeep(defaultState, parsed);
    } catch (error) {
      return clone(defaultState);
    }
  }

  function save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // localStorage may be unavailable in strict privacy mode.
    }
  }

  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Ignore storage cleanup failures.
    }
  }

  App.storage = {
    clone,
    load,
    save,
    clear,
  };
})(window.CareerGuide = window.CareerGuide || {});
