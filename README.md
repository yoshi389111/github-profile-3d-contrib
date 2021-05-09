# GitHub Profile 3D Contrib.

![svg](https://raw.githubusercontent.com/yoshi389111/yoshi389111/main/profile-3d-contrib/profile-green-animate.svg)

[日本語](./docs/README.ja-jp.md)

## Overview

This GitHub Action creates a GitHub contribution calendar on a 3D profile image.

## How to use (GitHub Actions)

This action generate your github profile 3d contribute calendar and make a commit to your repo.
You can also trigger action by yourself after add this action.

### 1. Create special repository.

Create a repository on GitHub with the same name as your user name.

* e.g. If the user name is `octocat`, create a repository named `octocat/octocat`.

In this repository, do the following.

### 2. Create workflow file.

Create a workflow file like the one below.

* `.github/workflows/profile-3d.yml`

The schedule is set to start once a day.
Please correct the startup time to a convenient time.

```yaml:.github/workflows/profile-3d.yml
name: GitHub-Profile-3D-Contrib

on:
  schedule: # 03:00 JST == 18:00 UTC
    - cron: "0 18 * * *"
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    name: generate-github-profile-3d-contrib
    steps:
      - uses: actions/checkout@v2
      - uses: yoshi389111/github-profile-3d-contrib@0.1.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          USERNAME: ${{ github.repository_owner }}
      - name: Commit & Push
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add -A .
          git commit -m "generated"
          git push
```

Note: If you also want to include the private repository, register the "personal access token" in the repository and set it to GITHUB_TOKEN specified in the workflow file.

This will add the action to the repository.

### 3. Manually launch the action

Launch the added action.

* `Actions` -> `GitHub-Profile-3D-Contrib` -> `Run workflow`

The profile image is generated with the following paths.

* `profile-3d-contrib/profile-green-animate.svg`
* `profile-3d-contrib/profile-green.svg`
* `profile-3d-contrib/profile-season-animate.svg`
* `profile-3d-contrib/profile-season.svg`

### 4. Add image to README.md

Add the path of the generated image to the readme file.

e.g.

```md
![](./profile-3d-contrib/profile-green-animate.svg)
```

## Licence

MIT License

Copyright (C) 2021 SATO Yoshiyuki
