# Portfolio Website

A modern, interactive personal portfolio built with Next.js 16, React 19, and Tailwind CSS 4. Features include GitHub project integration, neural network visualization, Pomodoro timer, and more.

![Portfolio Preview](https://via.placeholder.com/1200x600.png?text=Portfolio+Preview)

## ✨ Features

### Core Features
- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- **Dark/Light Mode** - Toggle between themes with smooth transitions
- **GitHub Integration** - Auto-fetches project data from GitHub API
- **Interactive Elements** - Framer Motion animations throughout

### Special Features
- 🎥 **Intro Video Modal** - YouTube video integration with bloom effects
- 🎵 **Lofi Music Player** - Background lofi music with play/pause controls
- 🧠 **Neural Network Simulation** - 3D visualization using React Three Fiber
- 🍅 **Pomodoro Timer** - Built-in productivity timer
- 📊 **GitHub Activity Graph** - Contribution visualization
- 🔗 **Project Action Buttons** - GitHub, live demo, YouTube, and commits links

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **3D Graphics**: React Three Fiber + Three.js
- **Icons**: Lucide React + React Icons
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd myportfolio
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Add your GitHub token (optional but recommended for higher API rate limits):
```env
# .env.local
GITHUB_TOKEN=your_github_personal_access_token
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
myportfolio/
├── app/
│   ├── components/
│   │   ├── ActionButtons.tsx    # Project action buttons (GitHub, link, YouTube, commits)
│   │   ├── ExperienceItem.tsx    # Work experience component
│   │   ├── GithubGraph.tsx       # GitHub contribution graph
│   │   ├── NeuralNetworkSim.tsx  # 3D neural network visualization
│   │   ├── PomodoroTimer.tsx     # Productivity timer
│   │   ├── ProjectGrids.tsx      # Project cards grid
│   │   ├── TechStack.tsx         # Technology stack display
│   │   └── ThemeToggle.tsx       # Dark/light mode toggle
│   ├── data/
│   │   ├── content.ts            # Markdown content for agent mode
│   │   └── github-projects.json  # Cached GitHub project data
│   ├── scripts/
│   │   └── fetchGithubData.js    # Script to fetch GitHub data
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main page
│   └── providers.tsx             # Theme providers
├── public/
│   └── (static assets)
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🔧 Configuration

### Adding GitHub Projects

1. Open `app/scripts/fetchGithubData.js`
2. Add your repository URLs to `GITHUB_REPOS` array:
```javascript
const GITHUB_REPOS = [
  "https://github.com/username/repo1",
  "https://github.com/username/repo2",
];
```

3. Add corresponding image URLs to `IMAGE_URLS` array:
```javascript
const IMAGE_URLS = [
  "https://raw.githubusercontent.com/...",
  "",
];
```

4. Run the fetch script:
```bash
node app/scripts/fetchGithubData.js
```

### Adding Manual Projects

Edit the `manualProjects` array in `app/components/ProjectGrids.tsx`:

```typescript
const manualProjects: Project[] = [
  {
    name: "My Project",
    description: "Project description",
    tech: ["React", "Node.js"],
    link: "https://myproject.com",
    github: "https://github.com/username/myproject",
    youtube: "https://youtube.com/watch?v=...",
    image: "/path/to/image.png",
  },
];
```

### Updating GitHub Data

To refresh GitHub project data:

```bash
node app/scripts/fetchGithubData.js
```

This will:
- Fetch latest data from GitHub API
- Detect tech stack from languages, dependencies, and README
- Save to `app/data/github-projects.json`

> **Note**: Without a GitHub token, you're limited to 60 requests/hour. With a token, you get 5,000 requests/hour.

## 🎨 Customization

### Theme Colors
Edit `app/globals.css` to customize colors:
```css
:root {
  --primary: #your-color;
  --secondary: #your-color;
}
```

### Adding New Components
Place new components in `app/components/` and import them in `page.tsx`.

## 📝 License

MIT License - feel free to use this portfolio as a template!

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Lucide Icons](https://lucide.dev)

---

Built with ❤️ using Next.js and Tailwind CSS