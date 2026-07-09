# `.github/workflows/`

GitHub Actions workflow definitions.

## Purpose

Define automated pipelines; currently production deploy only.

## Key files

| File | Role |
|------|------|
| `deploy.yml` | Install, build, upload Pages artifact, deploy |

## How they relate

Triggered by pushes to `main` (and `workflow_dispatch`). Consumes root `package.json` scripts and publishes static files for `https://tdglu.github.io/Weather-App/`.

## Notable patterns

- Keep secrets out of the workflow; the OpenWeather key is a client-side demo key in source.
- **Extension**: add CI lint/test jobs here before deploy if the project grows tests.
