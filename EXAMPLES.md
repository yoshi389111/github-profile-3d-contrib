## Advanced example 1: automatic day/night switching + keeping output in other branch

This alternative workflow generates two files, `day.svg` and `night.svg`, and pushes it to `output-3d-contrib` branch, keeping the main repo 'clean' from build artifacts.

### 1. Create special repository.

Create a repository on GitHub with the same name as your user name.

* e.g. If the user name is `octocat`, create a repository named `octocat/octocat`.
* ref. [Managing your profile README](https://docs.github.com/en/github/setting-up-and-managing-your-github-profile/managing-your-profile-readme)

In this repository, do the following.

### 2. Create `conf/github-profile-3d-contrib.json` file in your <username> repo:
```json:conf/github-profile-3d-contrib.json
[
    {
        "type": "normal",
        "fileName": "day.svg",
        "backgroundColor": "#ffffff",
        "foregroundColor": "#00000f",
        "strongColor": "#111133",
        "weakColor": "gray",
        "radarColor": "#47a042",
        "growingAnimation": true,
        "contribColors": [
            "#efefef",
            "#d8e887",
            "#8cc569",
            "#47a042",
            "#1d6a23"
        ]
    },
    {
        "type": "rainbow",
        "fileName": "night.svg",
        "backgroundColor": "#00000f",
        "foregroundColor": "#eeeeff",
        "strongColor": "rgb(255,200,55)",
        "weakColor": "#aaaaaa",
        "radarColor": "rgb(255,200,55)",
        "growingAnimation": true,
        "saturation": "50%",
        "contribLightness": [
            "20%",
            "30%",
            "35%",
            "40%",
            "50%"
        ],
        "duration": "10s",
        "hueRatio": -7
    }
]
```

### 3. Create `.github/workflows/profile-3d-contrib.yml` workflow file in your <username> repo:
```yaml:.github/workflows/profile-3d-contrib.yml
name: generate 3d chart for profile contributions

on:
  # run automatically every 24 hours
  schedule:
    - cron: "0 */24 * * *" 
  
  # allows to manually run the job at any time
  workflow_dispatch:
  
  # run on every push on the main branch
  # don't forget to change if you're using 'master' branch
  push:
    branches:
    - main

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
          SETTING_JSON: conf/github-profile-3d-contrib.json
          
      # push the content of <build_dir> to a branch
      # the content will be available at https://raw.githubusercontent.com/<github_user>/<repository>/<target_branch>/<file> , or as github page
      - name: push SVGs to the output-3d branch
        uses: crazy-max/ghaction-github-pages@v3.1.0
        with:
          target_branch: output-3d-contrib
          build_dir: profile-3d-contrib
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 4. Edit `README.md` in your <username> repo, adding the following code:
Do not forget to replace `<github_user>` and `<repository>` with your GitHub username.
```html
<p align="center" >
	<picture>
	  <source media="(prefers-color-scheme: dark)"  srcset="https://raw.githubusercontent.com/<github_user>/<repository>/output-3d-contrib/night.svg" />
	  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/<github_user>/<repository>/output-3d-contrib/day.svg" />
	  <img alt="github profile contributions chart"    src="https://raw.githubusercontent.com/<github_user>/<repository>/output-3d-contrib/day.svg" />
	</picture>
</p>
```
