# Plugin Loading

The backend currently loads plugins from local plugin folders under `src/plugins/*`.

The backend validates all loaded plugins at startup:

- Plugin `metadata.id` must be unique
- Device provider class names must be unique
- Logic provider class names must be unique

Startup will fail fast if a configured plugin package cannot be resolved or does not export a valid plugin config.
