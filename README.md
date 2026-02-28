<div align="center">

# 🌍 Rtrv Timezone

**Rtrv Timezone** is a modern, elegant **world clock and timezone planning application** built with React.

Designed for remote teams, global collaborators, and frequent travelers — easily compare times across multiple timezones, plan meetings across the globe, and visualize working hours overlap with an intuitive drag-to-adjust slider interface. Available as both a **web app** and a **Chrome extension** that replaces your new tab page.


[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/) [![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](#-docker) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat&logo=googlechrome&logoColor=white)](#-chrome-extension)
</div>

---

<p align="center">
  <img src="images/rtrv_timezone_dark.png" alt="Dark Theme" width="80%"/>
</p>

<p align="center">
  <img src="images/rtrv_timezone_light.png" alt="Light Theme" width="80%"/>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌐 **Multi-Timezone Support** | Add and compare unlimited timezones simultaneously |
| 🎚️ **Interactive Time Slider** | Drag to see how times change across all zones |
| 📊 **Visual Time Grid** | 24-hour comparison view with working hours highlighting |
| 💼 **Working Hours Indicator** | Easily identify overlap for scheduling meetings |
| 🌓 **Light/Dark Theme** | Toggle between themes with system preference detection |
| ⭐ **Favorite Timezones** | Star frequently used timezones for quick access |
| 💾 **Persistent Storage** | Your timezone selections are saved locally |
| 🔴 **Now Indicator** | Red column highlights current time in the comparison grid |
| 📱 **Responsive Design** | Works on desktop and tablet devices |

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd rtrv_timezone

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## � Docker

Run the application in a Docker container:

```bash
# Build the Docker image
docker build -t rtrv-timezone .

# Run the container
docker run -d -p 8080:80 rtrv-timezone
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Docker Compose (optional)

Create a `docker-compose.yml`:

```yaml
services:
  rtrv-timezone:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

Then run:

```bash
docker compose up -d
```

---

## �🛠️ Tech Stack

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
      <br>React 19
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=ts" width="48" height="48" alt="TypeScript" />
      <br>TypeScript
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=vite" width="48" height="48" alt="Vite" />
      <br>Vite 7
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
      <br>Tailwind 4
    </td>
  </tr>
</table>

- **Luxon** - Timezone and datetime handling
- **LocalStorage** - Persistent timezone preferences

---

## 📁 Project Structure

```
rtrv_timezone/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # App header with logo and theme toggle
│   │   ├── TimeSlider.tsx      # Primary time adjustment slider
│   │   ├── TimezoneCards.tsx   # Grid of timezone cards
│   │   ├── TimezoneCard.tsx    # Individual timezone display
│   │   ├── TimeGrid.tsx        # 24-hour comparison grid
│   │   └── AddTimezoneModal.tsx # Timezone search and selection
│   ├── App.tsx                 # Main application component
│   ├── App.css                 # Component styles
│   ├── index.css               # Global styles and CSS variables
│   └── main.tsx                # Application entry point
├── images/                     # Screenshots and assets
├── public/                     # Static assets
└── src/chromeExtension/        # Chrome extension build
```

---

## 📖 Usage

### Adding Timezones
1. Click the **+ Add Timezone** button
2. Search for a city or timezone
3. Click to add it to your dashboard

### Comparing Times
- Use the **Primary slider** to shift time and see how it affects all zones
- Click **NOW** to reset to current time
- View the **Time Grid** for a 24-hour visual comparison

### Managing Timezones
- **Star** a timezone to mark it as favorite
- **Delete** timezones you no longer need
- Reorder by adding/removing as needed

### Theme Toggle
Click the sun/moon icon in the header to switch between light and dark themes.

---

## 💻 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Build Chrome extension
npm run build:extension

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🧩 Chrome Extension

Rtrv Timezone is also available as a Chrome extension that replaces your new tab page.

### Installation

1. Build the extension:
   ```bash
   npm run build:extension
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top-right)

4. Click **Load unpacked** and select the `src/chromeExtension` folder

5. Open a new tab to see Rtrv Timezone!

### Extension Features
- Full app functionality in every new tab
- Local storage persists your timezone selections
- Theme preference synced with the extension

For more details, see [src/chromeExtension/README.md](src/chromeExtension/README.md).

---

## 🎨 Design

### Color Palette
| Theme | Colors |
|-------|--------|
| **Primary** | Blue (`#3b82f6`) to Teal (`#0ea5e6`) gradient |
| **Accent** | Rose (`#f43f5e`) for the primary slider |
| **Dark Theme** | Deep slate backgrounds with glassmorphism effects |
| **Light Theme** | Clean whites with subtle shadows |

### Typography
System font stack for optimal readability across platforms.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by Rtrv**

[⬆ Back to top](#-rtrv-timezone)

</div>
