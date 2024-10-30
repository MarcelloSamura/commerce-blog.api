import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  modulePaths: ['.'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/modules/**/*.(t|j)s'],
  coveragePathIgnorePatterns: ['src/lib/database/migrations'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};

export default config;
