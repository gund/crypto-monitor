// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
globalThis.ngJest = {
  testEnvironmentOptions: {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  },
};
import 'jest-preset-angular/setup-jest';
// Jest is **retarded** and complains somehow hides Node own Response class
// So we import this shit from another lib to shut it the fuck up, jeez...
import 'whatwg-fetch';
