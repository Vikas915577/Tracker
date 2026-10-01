# Build without npm

The native shell uses Flutter/Dart. The repository intentionally has no `package.json` and no Node/npm build step.

GitHub Actions runs Flutter's toolchain and builds the APK. The mobile shell bundles the existing feature-preserving web core instead of deleting mature features during the migration.

For production Android/iOS signing, add your own signing credentials later; the included workflow is for repeatable debug APK validation.
