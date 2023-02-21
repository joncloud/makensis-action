# Nullsoft scriptable install system GitHub action

This action calls `makensis` to create a Windows installer.

This codebase was ported from the Azure DevOps Extension [dev-maxima/nsis-extension][].

[dev-maxima/nsis-extension]: https://github.com/dev-maxima/nsis-extension

## Platforms

This action looks for `makensis` or `makensis.exe` in the environment path, and if not found it will attempt to look in a couple of different places:

* Windows - `C:\Program Files (x86)\NSIS\`
* Linux and macOS:
  * `/usr/local/bin/`
  * `/usr/bin/`
  * `/opt/local/bin/`

## Inputs

### `script-file`

Path to the .nsi script file. Default `"install.nsi"`.

### `arguments`

Arguments to makensis.exe. Default: `""`.

### `additional-plugin-paths`

Newline-delimited list of paths to load plugins from. Default `""`.

### `defines`

Newline-delimited list of key-value pairs to define variables. Default `""`.

## Example usage

```yml
- name: Create installer
  uses: joncloud/makensis-action@v4
  with:
    arguments: "/V3"
```

## Development

This action needs to be built from the source code located in the `/src` folder. Whenever you make changes, you should run the `npm run build` script. Otherwise, your changes won't be tested by CI.

## Sample Projects

* [joncloud/makensis-action-test](https://github.com/joncloud/makensis-action-test)
