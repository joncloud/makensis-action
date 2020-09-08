# Nullsoft scriptable install system GitHub action

This action calls `makensis` to create a Windows installer.

This codebase was ported from the Azure DevOps Extension [dev-maxima/nsis-extension][].

[dev-maxima/nsis-extension]: https://github.com/dev-maxima/nsis-extension

## Platforms
### Windows
Windows platforms requires makensis to be installed to the `C:\Program Files (x86)\NSIS\` directory, where `makensis.exe` and `Plugins` exist.

### Linux and macOS
Linux and macOS require the following paths to exist:
* makensis must exist at `/usr/local/bin/makensis` or `/usr/bin/makensis`
* Plugins must exist at `/usr/local/share/nsis`

## Inputs

### `script-file`

Path to the .nsi script file. Default `"install.nsi"`.

### `arguments`

Arguments to makensis.exe. Default: `""`.

### `additional-plugin-paths`

Newline-delimited list of paths to load plugins from. Default `""`.

## Example usage

```yml
- name: Create installer
  uses: joncloud/makensis-action@v3.1
  with:
    arguments: "/V3"
```

## Sample Projects
* [joncloud/makensis-action-test](https://github.com/joncloud/makensis-action-test)
