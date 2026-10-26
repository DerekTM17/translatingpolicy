import { execSync } from 'node:child_process';

export default function setup() {
  execSync('npx astro build', { stdio: 'pipe' });
}
