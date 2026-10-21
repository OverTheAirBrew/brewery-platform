# Embedded web assets

These are the editable browser assets for the controller:

- `PageShell.html` — shared page header and branding shell
- `ControllerStyles.css` — dashboard stylesheet
- `ControllerScript.js` — browser JavaScript

They deliberately retain their normal file extensions so VS Code recognizes HTML, CSS, and JavaScript. Each file is wrapped in a C++ raw-string delimiter (`R"TAG(` … `)TAG"`) because `src/ConfigWebServer.cpp` includes the file directly at compile time. Leave those first and last delimiter lines in place; edit the contents between them normally.

The assets are embedded in the compiled Pico firmware. No SD card, web filesystem, or separate asset upload is required.

## Optional logo

`include/LogoConfig.h` is the single logo setting used by the running pages. It starts with an empty `CONTROLLER_LOGO_BASE64`, which keeps the built-in `HC` badge. To show a custom logo, paste its Base64 payload into that string and set `CONTROLLER_LOGO_MIME` to its matching MIME type, such as `image/png` or `image/svg+xml`. Paste the payload only, not the `data:image/...;base64,` prefix. Keep it small so setup pages remain quick to open.
