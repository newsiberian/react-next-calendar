// eslint-disable-next-line @typescript-eslint/no-var-requires
const { pathsToModuleNameMapper } = require('ts-jest/utils');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { compilerOptions } = require('../tsconfig.json');

module.exports = {
  preset: 'ts-jest',

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    // This has to match the baseUrl defined in tsconfig.json.
    prefix: '<rootDir>/../',
  }),
};
