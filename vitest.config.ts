import { defineConfig } from 'vitest/config';

// Build dist/ once for every test file, so parallel files never race on it.
export default defineConfig({ test: { globalSetup: ['tests/global-setup.ts'] } });
