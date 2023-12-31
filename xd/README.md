# Grida Assistant on Adobe XD

## references

xd plugin react [example](https://github.com/AdobeXD/plugin-samples/tree/master/quick-start-react)

[get UXP developer tools](https://www.adobe.io/photoshop/uxp/devtool/)

[XD plugin api docs](https://adobexdplatform.com/plugin-docs/reference/xd-index.html)

# Development

## Getting started

- One time: Install nodejs (https://nodejs.org/en/download/) and yarn (npm i yarn -g)
- Open terminal and navigate to the /xd-flutter-plugin-src folder
- run `yarn`
- run `yarn build`
- Plugin files will be copied into the /build folder, and also into your XD plugin developer folder
- Refresh plugin in XD with `Ctrl+Shift+R`

## Notes

- If you get errors about missing dependencies when building, you probably need to run `yarn` again
- builds are run in watch mode by default, meaning webpack re-bundles on file save
  -> add `--no-watch` to disable watch mode
- builds are automatically copied to the XD develop folder, use cmd/ctrl-shft-R in XD to reload plugins

## Production builds

If you are creating production builds for publishing, there are a few other things to consider:

- re-export / test the example thoroughly
- in version.js: update the `version`, `xdVersionRequired`, & set `debug` to false
- update the version in manifest.json, and ensure the README and CHANGELOG are up to date (incl. version) and committed.
- clear the `build` folder and use `yarn build --production` to minifiy and disable sourcemaps
- create the `xdx` file by zipping the _contents_ of the build folder, and renaming with a `.xdx` extension.
- once the plugin is submitted, tag the commit with it's version number (ex. `v1.0.0`)
