#!/usr/bin/env node
/**
 * Preview command for Cloudflare Workers Builds.
 *
 * Set it in the dashboard: Workers & Pages > autumnnote-plus > Settings >
 * Build > Preview command:
 *
 *   node scripts/cloudflare-preview.mjs
 *
 * Workers Builds runs the preview command on every push to a branch other
 * than the production branch (main), and has no setting to limit that to
 * certain branches. The limit lives here instead: only `staging` gets a
 * Preview, so what is about to be released can be checked before it reaches
 * main. Any other branch (dev, a feature branch) still runs the build, so a
 * broken build fails the check, and then skips the upload.
 *
 * Workers Builds sets WORKERS_CI_BRANCH to the branch being built.
 */
import { spawnSync } from 'node:child_process';

const PREVIEW_BRANCH = 'staging';
const branch = process.env.WORKERS_CI_BRANCH ?? '';

if (branch !== PREVIEW_BRANCH) {
  console.log(`No Preview for "${branch || 'an unknown branch'}": only ${PREVIEW_BRANCH} deploys one.`);
  process.exit(0);
}

// The Preview is named after the branch, so every staging push updates the
// same Preview instead of creating a new one.
const result = spawnSync('npx', ['wrangler', 'preview', '--name', PREVIEW_BRANCH], { stdio: 'inherit' });
process.exit(result.status ?? 1);
