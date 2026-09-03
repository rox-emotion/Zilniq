import appConfig from '../app.json';

// Single source of truth: the version shipped in app.json (expo.version).
// Keep package.json's "version" in sync with this value manually, as it is
// not readable at runtime.
export const APP_VERSION = appConfig.expo.version;
