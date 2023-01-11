# GitHub Profile 3D Contrib.

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-gitblock.svg)

[日本語](./README.ja-jp.md) | [English](/README.md)

## Visión general

Esta acción de GitHub crea un calendario de contribuciones de GitHub en una imagen de perfil 3D.

## Cómo usar (Actions de GitHub)

Esta acción genera su calendario de contribución 3d de perfil de github y se compromete con la actualización de su repositorio.
También puede activar manualmente la acción usted mismo después de agregar esta acción.

### paso 1. Crear un repositorio especial.

Cree un repositorio en GitHub con el mismo nombre que su nombre de usuario.

* ej. Si el nombre de usuario es `octocat`, crear un repositorio llamado `octocat/octocat`.
* ref. [Gestión de su perfil README](https://docs.github.com/es/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme)

En este repositorio, haga lo siguiente.

### paso 2. Crear archivo de workflow (flujo de trabajo).

Cree un archivo de flujo de trabajo como el siguiente.

* `.github/workflows/profile-3d.yml`

El horario está configurado para comenzar una vez al día.
Corrija la hora de inicio a una hora conveniente.

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

Nota: si también desea incluir el repositorio privado, registre el "token de acceso personal" en el repositorio y configúrelo en GITHUB_TOKEN especificado en el archivo de workflow (flujo de trabajo).

Esto agregará la acción al repositorio.

#### Variables de entorno

* `GITHUB_TOKEN` : (requerido) token de acceso
* `USERNAME` : (requerido) nombre de usuario de destino (o especificar con un argumento).
* `MAX_REPOS` : (opcional) repositorios máximos, predeterminado 100 - desde ver. 0.2.0
* `SETTING_JSON` : (opcional) configuración de la ruta del archivo json. Ver `sample-settings/*.json` y `src/type.ts` en `yoshi389111/github-profile-3d-contrib` repositorio para más detalles. - desde ver. 0.6.0

### paso 3. Inicie manualmente la acción

Inicie la acción añadida.

* `Actions` -> `GitHub-Profile-3D-Contrib` -> `Run workflow`

La imagen de perfil se genera con las siguientes rutas:

* `profile-3d-contrib/profile-green-animate.svg`
* `profile-3d-contrib/profile-green.svg`
* `profile-3d-contrib/profile-season-animate.svg`
* `profile-3d-contrib/profile-season.svg`
* `profile-3d-contrib/profile-south-season-animate.svg`
* `profile-3d-contrib/profile-south-season.svg`
* `profile-3d-contrib/profile-night-view.svg`
* `profile-3d-contrib/profile-night-green.svg`
* `profile-3d-contrib/profile-night-rainbow.svg`
* `profile-3d-contrib/profile-gitblock.svg`

Alternativamente, si `SETTING_JSON` se especifica, se generará la siguiente imagen.

* `profile-3d-contrib/profile-customize.svg`

ejemplo: green version

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-green-animate.svg)

ejemplo: season version (Northern Hemisphere.)

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-season-animate.svg)

ejemplo: season version (Southern Hemisphere.)

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-south-season-animate.svg)

ejemplo: night view version

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-night-view.svg)

ejemplo: night green version

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-night-green.svg)

ejemplo: night reinbow version

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-night-rainbow.svg)

ejemplo: git block version

![svg](https://raw.githubusercontent.com/yoshi389111/github-profile-3d-contrib/main/docs/demo/profile-gitblock.svg)

### paso 4. Agregar imagen a README.md

Agregue la ruta de la imagen generada al archivo README.

ej.

```md
![](./profile-3d-contrib/profile-green-animate.svg)
```

## Cómo usar (local)

Configura la variable de entorno `GITHUB_TOKEN` con el valor del "token de acceso personal".

```shell-session
export GITHUB_TOKEN=XXXXXXXXXXXXXXXXXXXXX
```

Ejecútelo con su usuario de GitHub especificado.

```shell-session
node_modules/.bin/ts-node src/index.ts USER_NAME
```

o

```shell-session
npm run build
node . USER_NAME
```

## Licencia

MIT License

(C) 2021 SATO, Yoshiyuki
