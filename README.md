# Desky

A beautiful, customizable desktop dashboard/startpage built with Tauri and Svelte. Designed to be your personal command center — showing the information you need at a glance.

![Desky Dashboard](https://via.placeholder.com/800x400/141414/dedede?text=Desky+Dashboard)

## Features

### 🕐 Date & Time

- Large, elegant clock display
- Configurable time format (12h/24h)
- Date display with customizable format (MDY/DMY)
- Automatically detects your system preferences

### 🌤️ Weather

- Current weather conditions
- Hourly and daily forecasts
- Support for Celsius and Fahrenheit
- Automatic location detection or manual coordinates
- Wind speed in km/h or mph

### 📝 Tasks

- Simple task management
- Add, complete, and delete tasks
- Persistent storage (localStorage)
- Clean, minimal interface

### 🍅 Pomodoro Timer

- Focus sessions with customizable durations
- Short and long break support
- Configurable session counts before long break
- Audio notifications (chime, soft ping, bell)
- Auto-start options for focus and breaks

### 📊 Stats

- Page load time
- Network latency/ping
- Frames per second (FPS)
- Viewport dimensions

### 🎨 Customization

- Multiple themes (default + custom)
- Custom CSS injection
- Font selection (defaults to Geist Mono)
- Show/hide any component
- Custom color palette
- Import/export settings

## Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm/yarn
- **Rust** (latest stable)
- **Cargo** (comes with Rust)
- **Linux only**: WebKitGTK and GTK runtime libraries for Tauri 2, including `libwebkit2gtk-4.1.so.0`

On Arch Linux, install the missing runtime pieces with:

```bash
sudo pacman -S webkit2gtk-4.1 javascriptcoregtk-4.1 libsoup3 gtk3
```

The `sudo` is only needed for installing system packages. Run `pnpm tauri dev` as your normal user.

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/desky.git
cd desky

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri:dev
```

### Building for Production

```bash
# Build the application
pnpm tauri:build
```

The built executable will be in:

- Linux: `src-tauri/target/release/desky`
- macOS: `src-tauri/target/release/desky.app`
- Windows: `src-tauri/target/release/desky.exe`

### Desktop Installation

#### Linux

```bash
# The .deb package will be in:
src-tauri/target/release/bundle/deb/
```

#### macOS

```bash
# The .app bundle will be in:
src-tauri/target/release/bundle/dmg/
```

#### Windows

```bash
# The .exe installer will be in:
src-tauri/target/release/bundle/nsis/
```

## Development

### Tech Stack

- **Frontend**: Svelte 5, Vite
- **Backend**: Tauri 2 (Rust)
- **Package Manager**: pnpm
- **Styling**: CSS (custom properties)

### Project Structure

```
desky/
├── src/                    # Svelte frontend source
│   ├── lib/
│   │   ├── components/     # UI components
│   │   │   ├── DateTime.svelte
│   │   │   ├── Stats.svelte
│   │   │   ├── Weather.svelte
│   │   │   ├── Tasks.svelte
│   │   │   ├── Pomodoro.svelte
│   │   │   └── Settings.svelte
│   │   ├── settings-store.svelte.js
│   │   └── *.js            # Utilities
│   ├── App.svelte
│   ├── app.css
│   └── main.js
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── capabilities/
├── package.json
├── vite.config.js
└── README.md
```

### Available Scripts

| Command                       | Description                   |
| ----------------------------- | ----------------------------- |
| `pnpm dev`                    | Run frontend dev server       |
| `pnpm build`                  | Build frontend for production |
| `pnpm preview`                | Preview built frontend        |
| `pnpm tauri:dev`              | Run full Tauri dev mode       |
| `pnpm tauri:build`            | Build Tauri application       |
| `pnpm tauri:build -- --debug` | Build with debug symbols      |

## Configuration

### Weather API

Desky uses a weather API for forecast data. By default, it uses Open-Meteo (free, no API key required).

To use a different weather service:

1. Open Settings (click the gear icon)
2. Navigate to Weather settings
3. Enter your API endpoint and key

### Environment Variables

For production builds, you can set:

```bash
# Weather API (optional)
VITE_WEATHER_API_KEY=your_api_key
VITE_WEATHER_API_URL=https://api.weather.com
```

### Custom CSS

You can inject custom CSS via the Settings panel. Example:

```css
/* Custom background gradient */
body {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

/* Customize component appearance */
.panel {
  border-radius: 12px;
  backdrop-filter: blur(10px);
}
```

### Themes

Desky supports theming via CSS custom properties. The default theme uses:

```css
--bg1: #141414;
--bg2: #1d1d1d;
--bg3: #262626;
--txt1: #dedede;
--txt2: #aeaeae;
--txt3: #636363;
--txt4: #484848;
--txtErr: #d6809c;
```

Create custom themes by modifying the color palette in Settings.

## Usage Tips

### Setting as Browser Startpage

1. Build the application: `pnpm tauri:build`
2. Open your browser settings
3. Set the startpage to the built HTML file or host it on a local server

### Keyboard Shortcuts

- `Esc` - Close settings panel
- `Enter` - Confirm in input fields

### Data Storage

All settings and tasks are stored in your browser's localStorage:

- Settings: `startpage-settings`
- Tasks: `startpage-tasks`

## Troubleshooting

### Common Issues

**Weather not working**

- Ensure location permissions are granted
- Check API endpoint configuration
- Verify internet connectivity

**Pomodoro sounds not playing**

- Check browser/audio permissions
- Ensure sound files are loaded

**Build fails**

- Ensure Rust and Node.js are up to date
- Run `pnpm install` to fetch all dependencies
- Check for cargo dependency issues: `cd src-tauri && cargo update`

### Getting Help

- Open an issue on GitHub
- Check existing issues for solutions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- [Svelte](https://svelte.dev) - UI framework
- [Tauri](https://tauri.app) - Desktop app framework
- [Open-Meteo](https://open-meteo.com) - Weather data
- [Geist Mono](https://vercel.com/font) - Default font
