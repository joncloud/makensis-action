# Nullsoft scriptable install system action

This action downloads NSIS 3, and calls `makensis.exe` to create an installer. Due to the requirement of NSIS, this is only compatible on Windows.

This codebase was ported from the Azure DevOps Extension [dev-maxima/nsis-extension][].

[dev-maxima/nsis-extension]: https://github.com/dev-maxima/nsis-extension

## Inputs

### `script-file`

**Required** Path to the .nsi script file. Default `"install.nsi"`.

### `arguments`

Arguments to makensis.exe. Default: `""`.

### `just-include`

**Required** Should we just include Nsis as an environment variable without executing? Default `false`.

### `include-more-plugins`

**Required** Should we also add more Nsis plugins to the plugin folder? Default `false`.

### `include-custom-plugins-path`

If you want include additional plugins that aren't in our default directory, you could specify your plugin directory so your plugins will copied and used into NSIS process. This will work with plugins/x86-ansi. Default: `""`.

## Outputs

### `nsis-path`

The path to where NSIS is installed

## Example usage

```yml
uses: joncloud/nsis-action@v1
```