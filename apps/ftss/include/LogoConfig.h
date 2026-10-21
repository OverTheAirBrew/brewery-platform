#pragma once

// The compact built-in HC badge is intentionally used instead of a Base64 logo.
// Repeating a Base64 image in every generated page used too much RAM and delayed
// page responses on the Pico 2 W.
constexpr char CONTROLLER_LOGO_MIME[] = "image/png";
constexpr char CONTROLLER_LOGO_BASE64[] = "";
