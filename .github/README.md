# `.github/`

GitHub-specific project configuration.

## Purpose

Automate continuous deployment of the static Weather App to GitHub Pages.

## Key files / folders

| Path | Role |
|------|------|
| `workflows/deploy.yml` | CI build + Pages deploy on `main` |

## How they relate

On push to `main`, Actions installs deps, runs `npm run build`, and deploys the repository (including freshly built `assets/`) via GitHub Pages.

## Notable patterns

- Site settings must use **GitHub Actions** as the Pages source (not “Deploy from a branch” alone).
- Build artifacts are the same files used for local `python -m http.server`.
