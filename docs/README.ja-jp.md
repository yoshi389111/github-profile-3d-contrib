# GitHub Profile 3D Contrib.

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-gitblock.svg)

[Español](./README.es-es.md) | [English](/README.md)

## 概要

この GitHub Action は GitHub のコントリビュートカレンダーの 3D 版を SVG で作成します。

## 使い方 (GitHub Actions)

このアクションは、GitHub プロファイルの3D 版のコントリビュートカレンダー（いわゆる芝生）の 3D 版の SVG を GitHub プロフィール用に作成し、リポジトリにコミットします。

このアクションを追加した後、自分でアクションをトリガーすることもできます。

### 手順 1. スペシャルなリポジトリを作る

ユーザー名と同じ名前で GitHub にリポジトリを作成してください。

* 例：ユーザー名が `octocat`の場合は、`octocat/octocat` という名前のリポジトリを作成します。
* 参考：[プロフィールの README を管理する](https://docs.github.com/ja/github/setting-up-and-managing-your-github-profile/managing-your-profile-readme)

このリポジトリで、以降の手順を実行します。

### 手順 2. ワークフローファイルを作る

以下のようなワークフローファイルを作成します。

* `.github/workflows/profile-3d.yml`

スケジュールは1日1回開始するように設定されています。
起動時間を都合の良い時間に修正してください。

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
      - uses: actions/checkout@v3
      - uses: yoshi389111/github-profile-3d-contrib@0.7.1
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

注：プライベートリポジトリも集計対象とする場合は、「personal access token」をリポジトリに登録し、ワークフローファイルで指定されている GITHUB_TOKEN に設定します。

これにより、アクションがリポジトリに追加されます。

#### 環境変数

* `GITHUB_TOKEN` : (必須) アクセストークン
* `USERNAME` : (必須) 対象のユーザー名. （あるいは引数で指定する）
* `MAX_REPOS` : (任意) 最大のリポジトリ数。デフォルトは100 - バージョン 0.2.0 で追加
* `SETTING_JSON` : (任意) 設定JSONファイルパス。詳細は `yoshi389111/github-profile-3d-contrib` リポジトリの `sample-settings/*.json` や `src/type.ts` を参照してください - バージョン 0.6.0 で追加

### 手順 3. アクションを手動起動する

追加したアクションを起動してください。

* `Actions` -> `GitHub-Profile-3D-Contrib` -> `Run workflow`

プロフィール画像は以下のパスで生成されます。

* `profile-3d-contrib/profile-green-animate.svg`
* `profile-3d-contrib/profile-green.svg`
* `profile-3d-contrib/profile-season-animate.svg`
* `profile-3d-contrib/profile-season.svg`
* `profile-3d-contrib/profile-south-season-animate.svg`
* `profile-3d-contrib/profile-south-season.svg`
* `profile-3d-contrib/profile-night-view.svg`
* `profile-3d-contrib/profile-night-green.svg`
* `profile-3d-contrib/profile-night-rainbow.svg`

あるいは、`SETTING_JSON` を指定した場合は、以下のファイルが生成されます。

* `profile-3d-contrib/profile-customize.svg`

例：green バージョン

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-green-animate.svg)

例：season バージョン（北半球）

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-season-animate.svg)

例：season バージョン（南半球）

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-south-season-animate.svg)

例：night view バージョン

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-night-view.svg)

例：night green バージョン

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-night-green.svg)

例：night reinbow バージョン

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-night-rainbow.svg)

example: git block バージョン

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-gitblock.svg)

### 手順 4. README.md を追加

生成された画像のパスを readme ファイルに追加します。

例：

```md
![](./profile-3d-contrib/profile-green-animate.svg)
```

## 使い方 (ローカル)

環境変数 `GITHUB_TOKEN` には「personal access token」を指定してください。

```shell-session
export GITHUB_TOKEN=XXXXXXXXXXXXXXXXXXXXX
```

GitHubのユーザを指定して実行してください。

```shell-session
node_modules/.bin/ts-node src/index.ts USER_NAME
```

あるいは

```shell-session
npm run build
node . USER_NAME
```

## Licence

MIT License

(C) 2021 SATO, Yoshiyuki
