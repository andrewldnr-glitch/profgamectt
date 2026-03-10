(function (App) {
  const files = {
    professions: './data/professions.json',
    questions: './data/questions.json',
    myths: './data/myths.json',
    skillsMatching: './data/skills-matching.json',
    futureGenerator: './data/future-generator.json',
  };

  async function loadFile(key, path) {
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Не удалось загрузить ${path}`);
      }
      return await response.json();
    } catch (error) {
      if (App.localDataSnapshot && Object.prototype.hasOwnProperty.call(App.localDataSnapshot, key)) {
        return App.storage.clone(App.localDataSnapshot[key]);
      }
      throw error;
    }
  }

  async function loadAll() {
    const datasets = {};
    const keys = Object.keys(files);
    for (const key of keys) {
      datasets[key] = await loadFile(key, files[key]);
    }
    return datasets;
  }

  App.dataLoader = {
    loadAll,
  };
})(window.CareerGuide = window.CareerGuide || {});
