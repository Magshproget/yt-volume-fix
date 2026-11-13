# YouTube Volume Fix

Browser extension (Manifest V3) that maps YouTube's linear volume slider to a perceptual power curve (exponent 2.5), enabling granular audio control at low volume levels.

## Features

- Dynamic volume scaling via HTMLMediaElement prototype hooking
- Options popup to adjust the exponent curve in real time (from 1.0 to 4.0)
- Zero external dependencies
- Isolated bridge communicating with the page's main execution context

## Installation

1. Clone or download this repository.
2. Open Chrome (or any Chromium browser: Brave, Edge, Arc) and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the root directory of this repository.
