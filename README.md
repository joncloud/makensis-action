# Nullsoft scriptable install system action

This action downloads NSIS 3, and calls `makensis.exe` to create an installer. Due to the requirement of NSIS, this is only compatible on Windows.

This codebase was ported from the Azure DevOps Extension [dev-maxima/nsis-extension][].

[dev-maxima/nsis-extension]: https://github.com/dev-maxima/nsis-extension

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
  uses: joncloud/makensis-action@v2.0
  with:
    arguments: "/V3"
```

## Sample Projects
* [joncloud/makensis-action-test](https://github.com/joncloud/makensis-action-test)
