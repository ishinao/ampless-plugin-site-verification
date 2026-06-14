# @ishinao/ampless-plugin-site-verification

## 0.1.2

- Sync to the `ampless@1.0.0-beta.52` plugin spec (dependency bumped from
  `^1.0.0-alpha.22` to `^1.0.0-beta.52`). The plugin's runtime, manifest, and
  types were already beta.52-compliant; verified with lint, tests, and build.
- Modernize tests to the canonical reference-plugin idiom (`resolvePluginSettings`
  + `callPublicHead`), with added `instanceId` and whitespace-trim coverage.
