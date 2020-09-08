# Nullsoft scriptable install system GitHub action

This action calls `C:\Program Files (x86)\NSIS\makensis.exe` to create an installer. This action is currently only compatible with Windows.

This codebase was ported from the Azure DevOps Extension [dev-maxima/nsis-extension][].

[dev-maxima/nsis-extension]: https://github.com/dev-maxima/nsis-extension

## Inputs

### `script-file`

Path to the .nsi script file. Default `"install.nsi"`

### `additional-plugin-paths`

Newline-delimited list of paths to load plugins from. Default `""`

### `compiler-process-priority`

Sets the compiler process priority, where x is 5=realtime,4=high,3=above normal,2=normal,1=below normal,0=idle. Default `""`

### `verbosity`

Sets the verbosity where x is 4=all,3=no script,2=no info,1=no warnings,0=none. Default `"1"`

### `warnings-as-errors`

Treats warnings as errors <false|true>. Default `"false"`

### `compiler-output-file-path`

Specifies a text file to log compiler output (default is stdout) <false|true>. Default `"false"`

### `no-config`

Disables the inclusion of <path to makensis.exe>\nsisconf.nsh <false|true>. Default `"false"`

### `no-cd`

Disables the current directory change to that of the .nsi file <false|true>. Default `"false"`

### `input-charset`

Sets the input charset <ACP|OEM|CP#|UTF8|UTF16<LE|BE>>. Default `""`

### `output-charset`

Sets the output charset <ACP|OEM|CP#|UTF8[SIG]|UTF16<LE|BE>[BOM]>. Default `""`

### `preprocess-output`

Preprocesses script only <false|true|safe>. Default `"false"`

### `arguments`

Additional custom arguments to makensis. Default `""`

## Example usage

```yml
- name: Create installer
  uses: joncloud/makensis-action@v3.1
  with:
    arguments: "/V3"
```

## Sample Projects
* [joncloud/makensis-action-test](https://github.com/joncloud/makensis-action-test)
