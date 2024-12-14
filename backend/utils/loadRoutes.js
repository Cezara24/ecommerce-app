const fs = require('fs');
const path = require('path');

const loadRoutes = (app, routesDirectory) => {
  const absolutePath = path.resolve(routesDirectory);

  fs.readdirSync(absolutePath).forEach((file) => {
    if (file.endsWith('.js')) {
      const routeName = file.replace('.js', '');
      const routePath = `/${routeName === 'index' ? '' : routeName}`;
      const route = require(path.join(absolutePath, file));
      app.use(routePath, route);
      console.log(`Loaded route: ${routePath}`);
    }
  });
};

module.exports = loadRoutes;
