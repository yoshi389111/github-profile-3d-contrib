# GitHub Profile 3D Contrib

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-gitblock.svg)

<!-- Language code order (except English) -->
English (en) |
[Deutsch (de)](docs/README.de.md) |
[Español (es)](docs/README.es.md) |
[Français (fr)](docs/README.fr.md) |
[日本語 (ja)](docs/README.ja.md) |
[한국어 (ko)](docs/README.ko.md) |
[Português (pt-BR)](docs/README.pt-br.md) |
[Português (pt)](docs/README.pt.md) |
[Русский (ru)](docs/README.ru.md) |
[简体中文 (zh-CN)](docs/README.zh-CN.md) |
[繁體中文 (zh-TW)](docs/README.zh-TW.md) |

<!--
> [!NOTE]
> This translation was generated with machine translation.
> It may contain errors or unnatural expressions.
> Contributions to improve the translation are welcome!
 -->

## Overview

This GitHub Action creates a GitHub contribution calendar on a 3D profile image.

## How to use (GitHub Actions) - Basic

This GitHub Action generates your github profile 3d contribution calendar and commits to your repo.
After adding the GitHub Action, the workflow runs automatically once a day.
You can also trigger the workflow manually.

### Step 1. Create special profile repository

Create a repository on GitHub with the same name as your username.

- For example, if the username is `octocat`, create a repository named `octocat/octocat`.
- See also: [Managing your profile README](https://docs.github.com/en/account-and-profile/how-tos/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme)

In this repository, follow the steps below.

### Step 2. Create workflow file

Create a workflow file like the one below.

- `.github/workflows/profile-3d.yml`

```yaml:.github/workflows/profile-3d.yml
name: GitHub-Profile-3D-Contrib

on:
  schedule: # 03:00 JST == 18:00 UTC
    - cron: "0 18 * * *"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    name: generate-github-profile-3d-contrib
    steps:
      - uses: actions/checkout@v5
      - uses: yoshi389111/github-profile-3d-contrib@latest
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          USERNAME: ${{ github.repository_owner }}
      - name: Commit & Push
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add -A .
          if git commit -m "generated"; then
            git push
          fi
```

> [!NOTE]
> You can change your GitHub settings to include contributions from private repositories. To change this setting, click `Contribution settings` in the top right of the standard contribution calendar, or click your icon in the top right of the screen, select `Settings` ⇒ `Public profile` ⇒ `Contributions & Activity`, and check `Include private contributions on my profile`.
>
> If you want to include additional activities from private repositories, register a personal access token as a secret and set it to the `GITHUB_TOKEN` environment variable in the workflow file. However, in most cases the default `secrets.GITHUB_TOKEN` is sufficient.

The schedule is set to run once a day by default.
You can change the scheduled time as you like.

This will add the workflow to your repository.

#### Environment variables

In the sample, only `GITHUB_TOKEN` and `USERNAME` are specified as environment variables, but you can specify the following environment variables:

- `GITHUB_TOKEN` : (required) access token
- `USERNAME` : (required) target username (or specify with an argument).
- `MAX_REPOS` : (optional) max repositories, default 100 - since ver. 0.2.0
- `SETTING_JSON` : (optional) settings json file path. See `sample-settings/*.json` and `src/type.ts` in `yoshi389111/github-profile-3d-contrib` repository for details. - since ver. 0.6.0
- `GITHUB_ENDPOINT` : (optional) Github GraphQL endpoint. For example, if you want to create a contribution calendar based on your company's GitHub Enterprise activity instead of GitHub.com, set this environment variable. e.g. `https://github.mycompany.com/api/graphql` - since ver. 0.8.0
- `YEAR` : (optional) For past calendars, specify the year. This is intended to be specified when running the tool from the command line. - since ver. 0.8.0
- `INCLUDE_ORGS` : (optional) Comma-separated list of organization logins whose public repositories should also be counted toward the star/fork totals. Useful when most of your work lives inside an organization rather than under your personal account. Default: empty (unchanged behavior). Example: `INCLUDE_ORGS: my-org,other-org`

#### About `GITHUB_TOKEN`

The `secrets.GITHUB_TOKEN` set in the `GITHUB_TOKEN` environment variable in the sample is a special access token automatically created by GitHub.

- GitHub Docs: [Use GITHUB_TOKEN for authentication in workflows](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)

If you want to generate a contribution calendar for public repositories only, use this value.
There is no need to create a secret manually.

Also, if you want to include activity in your private repositories in your contribution calendar, check "Include private contributions on my profile" in the "Profile settings" section of "Public profile" in your profile settings.

Furthermore, if you want to include additional activity information from private repositories, create an access token with the appropriate permissions.
Register that access token as a secret with any name you like (For example, `MY_PERSONAL_ACCESS_TOKEN`).
However, please note that user-created secrets cannot start with `GITHUB_`.

- GitHub Docs: [Secrets](https://docs.github.com/en/actions/concepts/security/secrets)

Set that secret as the value of the `GITHUB_TOKEN` environment variable.

```diff
          env:
-           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
+           GITHUB_TOKEN: ${{ secrets.MY_PERSONAL_ACCESS_TOKEN }}
            USERNAME: ${{ github.repository_owner }}
```

#### About the time to schedule

In the sample, it is set to start at 18:00 UTC.
This is because it will run at midnight JST, which is the author's local time.

```yaml
on:
  schedule: # 03:00 JST == 18:00 UTC
    - cron: "0 18 * * *"
```

You can change it to any time you like.
We recommend midnight (around 3am) your local time.
However, please note that the time must be specified in UTC.

### Step 3. Manually run this GitHub Action

The first time, run this workflow manually.

- `Actions` -> `GitHub-Profile-3D-Contrib` -> `Run workflow`

The profile images are generated at the following paths:

- `profile-3d-contrib/profile-green-animate.svg`
- `profile-3d-contrib/profile-green.svg`
- `profile-3d-contrib/profile-season-animate.svg`
- `profile-3d-contrib/profile-season.svg`
- `profile-3d-contrib/profile-south-season-animate.svg`
- `profile-3d-contrib/profile-south-season.svg`
- `profile-3d-contrib/profile-night-view.svg`
- `profile-3d-contrib/profile-night-green.svg`
- `profile-3d-contrib/profile-night-rainbow.svg`
- `profile-3d-contrib/profile-gitblock.svg`

If you specify the `SETTING_JSON` environment variable without a `fileName` property in the json file, the following image will be generated:

- `profile-3d-contrib/profile-customize.svg`

You can use these images in your README.md as shown below.

Example: green version

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-green-animate.svg)

Example: season version (Northern Hemisphere.)

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-season-animate.svg)

Example: season version (Southern Hemisphere.)

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-south-season-animate.svg)

Example: night view version

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-night-view.svg)

Example: night green version

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-night-green.svg)

Example: night rainbow version

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-night-rainbow.svg)

Example: git block version

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-gitblock.svg)

### Step 4. Add image to README.md

Add the path to the generated image in your README file.

Example:

```md
![](./profile-3d-contrib/profile-green-animate.svg)
```

## How to use (GitHub Actions) - Advanced examples

- [More info in EXAMPLES.md](./EXAMPLES.md)

## How to use (local)

Set the `GITHUB_TOKEN` environment variable to your personal access token.

```sh
export GITHUB_TOKEN=XXXXXXXXXXXXXXXXXXXXX
```

Run the following command, replacing `USER_NAME` with your GitHub username or the target username.

```sh
node_modules/.bin/ts-node src/index.ts USER_NAME
```

or

```sh
npm run build
node . USER_NAME
```

## License

&copy; 2021 SATO Yoshiyuki. Licensed under the MIT License.
