"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FolderOpen, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionButtons } from "./ActionButtons";

interface Project {
  name: string;
  description: string;
  tech: string[];
  link?: string;
  github?: string;
  youtube?: string;
  image?: string;
  stars?: number;
  forks?: number;
}

// Add your GitHub repo URLs here - data will be auto-fetched
const GITHUB_REPOS = [
  "https://github.com/netbox-community/netbox.git",
  "https://github.com/ashishps1/awesome-system-design-resources",
  // "https://github.com/ashishps1/awesome-low-level-design",
  // "https://github.com/ashishps1/awesome-engineering-articles.git",
  "https://github.com/BerriAI/litellm",
  // "https://github.com/Faizolam/storybooksNew.git",
  "https://github.com/Faizolam/MediumX.git",
];

// GitHub token for higher API rate limits (optional but recommended)
// Create a token at: https://github.com/settings/tokens
// No scope needed for public repos
// NOTE: Do NOT use NEXT_PUBLIC_ prefix - that exposes the token to the browser!
// This must be used in server components or API routes only
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Helper to get headers with optional auth
function getHeaders() {
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`;
  }
  return headers;
}

// Add image URLs for each repo above (in same order)
// Leave empty string "" to auto-fetch from README, or provide direct raw URL, or local path like ./public/image.png
const IMAGE_URLS = [
  "https://raw.githubusercontent.com/netbox-community/netbox/main/docs/netbox_logo_light.svg",
  "https://raw.githubusercontent.com/ashishps1/awesome-system-design-resources/main/diagrams/system-design-github.png",
  // "https://raw.githubusercontent.com/ashishps1/awesome-low-level-design/main/images/lld-repo-logo.png",
  // "https://raw.githubusercontent.com/ashishps1/awesome-engineering-articles/main/eng-blogs.jpg",
  //"", // Leave empty to auto-fetch from README or provide direct raw URL if README image is not suitable
  //    "https://user-images.githubusercontent.com/29436595/528292435-c5ee0412-6fb5-4fb6-ab5b-bafae4209ca6",
  "./public/faiz.png",
  // "https://raw.githubusercontent.com/Faizolam/storybooksNew/main/storybooksCICD%26DeploymentDiagram.png"
]; 

// Add YouTube video URLs for each repo (optional)
const YOUTUBE_URLS = [
  "https://www.youtube.com/watch?v=OeR2OiUA0gA",
];

// Your manual projects
const manualProjects: Project[] = [
  {
    name: "MetaWiper",
    description: "A tool that cleans image metadata. My first real attempt at shipping something complete.",
    tech: ["Python", "Pillow"],
    github: "https://github.com/ashishps1/awesome-system-design-resources.git",
    // link: "https://algomaster.io/metawiper",
    link: "https://algomaster.io/",
    image: "https://raw.githubusercontent.com/ashishps1/awesome-system-design-resources/main/diagrams/system-design-github.png",
    youtube: "https://www.youtube.com/watch?v=OeR2OiUA0gA",
  },
  {
    name: "Stockic",
    description: "A news app where I spent months doing serious infrastructure work. Learned to build systems that could scale.",
    tech: ["React", "Node.js", "PostgreSQL"],
    link: "#",
    image: "",
  },
  {
    name: "Gloss Card",
    description: "For the first time, a customer actually wanted to buy it for their product. That validation was a turning point.",
    tech: ["Next.js", "MongoDB", "Stripe"],
    link: "#",
    image: "",
  },
  {
    name: "NeuraLeap",
    description: "Had the most meaningful user interactions yet - HRs from established firms. Data pipelines handling 50M LinkedIn profiles.",
    tech: ["Python", "AI/ML", "Redis"],
    link: "#",
    image: "",
  },
  {
    name: "Meteor",
    description: "AI SEO toolkit being used by 6 YC-backed companies. Real users. Real traction. Real feedback loops.",
    tech: ["TypeScript", "LangChain", "PostgreSQL"],
    link: "#",
    image: "",
  },
  {
    name: "ACL Manager",
    description: "GSoC 2025 project - system for managing Access Control List permissions across Linux file system servers.",
    tech: ["Go", "gRPC", "Next.js"],
    link: "https://minimalistbook.com/gsoc-final-report-2025/",
    image: "",
  },
  {
    name: "Eumlet",
    description: "UAE-based B2B Web3 payments platform deployed on AWS with high availability and secure transactions.",
    tech: ["Next.js", "AWS", "NGINX"],
    link: "#",
    github: "#",
    image: "",
  },
  {
    name: "Flipt Deploy",
    description: "Deployed and configured Flipt feature flagging platform on cloud infrastructure for video production workflows.",
    tech: ["Docker", "Go", "Cloud"],
    link: "https://algomaster.io/flipt-deploy",
    github: "https://github.com/ashishps1/awesome-system-design-resources.git",
    image: "https://raw.githubusercontent.com/ashishps1/awesome-system-design-resources/main/diagrams/system-design-github.png",
  },
];

const INITIAL_COUNT = 6;

// Map GitHub language to tech
const LANGUAGE_MAP: Record<string, string> = {
  JavaScript: "JavaScript",
  TypeScript: "TypeScript",
  Python: "Python",
  Java: "Java",
  Go: "Go",
  Rust: "Rust",
  "C++": "C++",
  Ruby: "Ruby",
  PHP: "PHP",
  Swift: "Swift",
  Kotlin: "Kotlin",
  Scala: "Scala",
  Shell: "Shell",
  HTML: "HTML",
  CSS: "CSS",
};

/**
 * Convert GitHub blob URL to raw URL
 * e.g., https://github.com/user/repo/blob/main/image.png -> https://raw.githubusercontent.com/user/repo/main/image.png
 * Also handles local paths like ./public/image.png, /image.png, or just image.png
 */
function convertToRawUrl(url: string, owner: string, repo: string, branch: string): string {
  // Handle local paths (./public/xxx.png, /xxx.png, or just xxx.png)
  // These are files in the /public folder
  if (url.startsWith("./public/")) {
    return url.replace("./public/", "/");
  }
  if (url.startsWith("./")) {
    return url.replace("./", "/");
  }
  if (url.startsWith("/")) {
    return url;
  }
  if (!url.startsWith("http") && url.includes(".")) {
    return "/" + url;
  }
  
  // Already raw URL (but not a blob URL)
  if ((url.includes("raw.githubusercontent.com") || url.includes("user-images.githubusercontent.com")) && !url.includes("/blob/")) {
    return url;
  }
  
  // Handle GitHub user-attachments URLs (e.g., https://github.com/user-attachments/assets/xxx)
  const userAttachMatch = url.match(/github\.com\/user-attachments\/assets\/([a-f0-9-]+)/);
  if (userAttachMatch) {
    const assetId = userAttachMatch[1];
    return `https://user-attachments.githubusercontent.com/${assetId}`;
  }
  
  // Convert blob URL to raw URL
  const blobMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/);
  if (blobMatch) {
    const [, , , , path] = blobMatch;
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  }
  
  // Convert relative path to raw URL (using provided branch)
  if (!url.startsWith("http")) {
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${url}`;
  }
  
  return url;
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  }
  return null;
}

// Common frameworks, databases, and tools to detect from README
const TECH_KEYWORDS = [
  // Frontend
  "React", "Next.js", "Vue", "Angular", "Svelte", "HTML", "CSS", "Tailwind", "Bootstrap",
  "Framer", "Redux", "Zustand", "React Native", "Expo", "Flutter", "SwiftUI",
  // Backend
  "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring", "Rails", "Laravel", "ASP.NET",
  "GraphQL", "REST", "gRPC", "WebSocket",
  // Databases
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Elasticsearch", "Prisma",
  "Supabase", "Firebase", "DynamoDB", "Cassandra",
  // Cloud & DevOps
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions",
  "Vercel", "Netlify", "Heroku", "Railway", "NGINX",
  // Languages
  "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "Ruby", "PHP", "C++", "C#",
  "Swift", "Kotlin", "Scala", "Shell",
  // AI/ML
  "TensorFlow", "PyTorch", "OpenAI", "LangChain", "Hugging Face", "AI", "ML",
  // Other tools
  "Stripe", "Auth0", "OAuth", "JWT", "Web3", "Solidity", "Ethereum",
];

// Map package.json dependencies to tech stack
const PACKAGE_JSON_DEPS: Record<string, string> = {
  "next": "Next.js", "react": "React", "vue": "Vue", "@angular/core": "Angular",
  "express": "Express", "fastify": "Fastify", "koa": "Koa", "hapi": "Hapi",
  "django": "Django", "flask": "Flask", "fastapi": "FastAPI", "spring-boot": "Spring",
  "rails": "Rails", "laravel": "Laravel", ".net": "ASP.NET",
  "mongoose": "MongoDB", "pg": "PostgreSQL", "mysql2": "MySQL", "redis": "Redis",
  "@prisma/client": "Prisma", "supabase": "Supabase", "firebase": "Firebase",
  "tailwindcss": "Tailwind", "bootstrap": "Bootstrap", "framer-motion": "Framer",
  "redux": "Redux", "zustand": "Zustand", "axios": "Axios", "socket.io": "Socket.io",
  "graphql": "GraphQL", "stripe": "Stripe", "jsonwebtoken": "JWT", "passport": "Auth0",
  "aws-sdk": "AWS", "@azure/identity": "Azure", "@google-cloud/storage": "GCP",
  "dockerode": "Docker", "kubernetes-client": "Kubernetes",
};

// Map requirements.txt/pip dependencies to tech stack
const PYTHON_DEPS: Record<string, string> = {
  "django": "Django", "flask": "Flask", "fastapi": "FastAPI",
  "numpy": "NumPy", "pandas": "Pandas", "tensorflow": "TensorFlow", "torch": "PyTorch",
  "keras": "Keras", "scikit-learn": "Scikit-learn", "pillow": "Pillow",
  "requests": "Requests", "aiohttp": "aiohttp", "celery": "Celery",
  "redis": "Redis", "psycopg2": "PostgreSQL", "pymongo": "MongoDB",
  "sqlalchemy": "SQLAlchemy", "pytest": "Pytest", "playwright": "Playwright",
  "selenium": "Selenium", "beautifulsoup": "BeautifulSoup", "scrapy": "Scrapy",
  "openai": "OpenAI", "anthropic": "Anthropic", "langchain": "LangChain",
  "boto3": "AWS", "google-cloud": "GCP", "azure": "Azure",
  "pydantic": "Pydantic", "uvicorn": "Uvicorn",
};

// Map Go mod dependencies to tech stack
const GO_DEPS: Record<string, string> = {
  "gin-gonic/gin": "Gin", "labstack/echo": "Echo", "fiber/fiber": "Fiber",
  "gorilla/mux": "Mux", "go-chi/chi": "Chi",
  "gorm.io/gorm": "GORM", "go-redis/redis": "Redis", "lib/pq": "PostgreSQL",
  "mongodb/mongo-driver": "MongoDB", "elastic/go-elasticsearch": "Elasticsearch",
  "aws/aws-sdk-go": "AWS", "google-cloud/go": "GCP", "azure/azure-sdk-for-go": "Azure",
  "docker/docker": "Docker", "kubernetes/client-go": "Kubernetes",
  "jwt-go/jwt": "JWT", "golang-jwt/jwt": "JWT",
};

// Map Ruby gems to tech stack
const RUBY_DEPS: Record<string, string> = {
  "rails": "Rails", "sinatra": "Sinatra", "puma": "Puma", "unicorn": "Unicorn",
  "activerecord": "ActiveRecord", "sequel": "Sequel", "redis": "Redis",
  "pg": "PostgreSQL", "mysql2": "MySQL", "mongo": "MongoDB",
  "sidekiq": "Sidekiq", "resque": "Resque", "capistrano": "Capistrano",
  "rspec": "RSpec", "minitest": "Minitest", "factory_bot": "Factory Bot",
  "devise": "Devise", "pundit": "Pundit", "cancancan": "CanCanCan",
  "aws-sdk-s3": "AWS", "carrierwave": "CarrierWave", "paperclip": "Paperclip",
};

// Files to check for dependencies
const DEPENDENCY_FILES = [
  "package.json", "requirements.txt", "Pipfile", "pyproject.toml", "setup.py",
  "go.mod", "go.sum", "Gemfile", "Gemfile.lock", "pom.xml", "build.gradle",
  "Cargo.toml", "composer.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
];

async function fetchFileContent(apiBase: string, filePath: string): Promise<string | null> {
  try {
    const response = await fetch(`${apiBase}/contents/${filePath}`, {
      headers: getHeaders(),
    });
    if (response.ok) {
      const data = await response.json();
      return atob(data.content);
    }
  } catch { /* ignore */ }
  return null;
}

async function parseDependencyFile(content: string, fileName: string, detectedTech: string[]): Promise<string[]> {
  const tech = new Set(detectedTech);
  
  try {
    if (fileName === "package.json" || fileName === "package-lock.json" || fileName === "yarn.lock" || fileName === "pnpm-lock.yaml") {
      // Parse package.json
      if (fileName === "package.json") {
        const json = JSON.parse(content);
        const allDeps = { ...json.dependencies, ...json.devDependencies };
        for (const [dep] of Object.entries(allDeps)) {
          if (PACKAGE_JSON_DEPS[dep]) {
            tech.add(PACKAGE_JSON_DEPS[dep]);
          }
        }
      }
    } else if (fileName === "requirements.txt" || fileName === "Pipfile" || fileName === "pyproject.toml" || fileName === "setup.py") {
      // Parse Python dependencies
      const lines = content.split("\n");
      for (const line of lines) {
        const cleanLine = line.split("#")[0].trim().toLowerCase();
        for (const [dep, techName] of Object.entries(PYTHON_DEPS)) {
          if (cleanLine.includes(dep.toLowerCase())) {
            tech.add(techName);
          }
        }
      }
    } else if (fileName === "go.mod" || fileName === "go.sum") {
      // Parse Go dependencies
      const lines = content.split("\n");
      for (const line of lines) {
        for (const [dep, techName] of Object.entries(GO_DEPS)) {
          if (line.toLowerCase().includes(dep.toLowerCase())) {
            tech.add(techName);
          }
        }
      }
    } else if (fileName === "Gemfile" || fileName === "Gemfile.lock") {
      // Parse Ruby dependencies
      const lines = content.split("\n");
      for (const line of lines) {
        for (const [dep, techName] of Object.entries(RUBY_DEPS)) {
          if (line.toLowerCase().includes(dep.toLowerCase())) {
            tech.add(techName);
          }
        }
      }
    }
  } catch { /* ignore parsing errors */ }
  
  return Array.from(tech);
}

async function fetchGitHubProject(githubUrl: string, imageUrl: string = "", youtubeUrl: string = ""): Promise<Project> {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) throw new Error("Invalid GitHub URL");

  const { owner, repo } = parsed;
  const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

  const repoResponse = await fetch(apiBase, {
    headers: getHeaders(),
  });

  if (!repoResponse.ok) {
    throw new Error(`Failed to fetch ${owner}/${repo} due you may have hit github API rate limits.`);
  }

  const repoData = await repoResponse.json();
  const techStack: string[] = [];

  // Get all languages from the repo
  try {
    const languagesResponse = await fetch(`${apiBase}/languages`, {
      headers: getHeaders(),
    });
    if (languagesResponse.ok) {
      const languagesData = await languagesResponse.json();
      // Sort by bytes and take top languages
      const sortedLanguages = Object.entries(languagesData)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3);
      
      for (const [lang] of sortedLanguages) {
        if (LANGUAGE_MAP[lang]) {
          techStack.push(LANGUAGE_MAP[lang]);
        }
      }
    }
  } catch { /* ignore */ }

  // Fetch dependency files to get frameworks and tools
  for (const depFile of DEPENDENCY_FILES) {
    if (techStack.length >= 6) break; // Limit to 6 techs
    
    const content = await fetchFileContent(apiBase, depFile);
    if (content) {
      const detectedTech = await parseDependencyFile(content, depFile, techStack);
      for (const t of detectedTech) {
        if (!techStack.includes(t)) {
          techStack.push(t);
        }
        if (techStack.length >= 6) break;
      }
    }
  }

  // Also scan README for frameworks, databases, and tools
  if (techStack.length < 6) {
    try {
      const readmeResponse = await fetch(`${apiBase}/readme`, {
        headers: getHeaders(),
      });
      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json();
        const readmeContent = atob(readmeData.content).toLowerCase();
        
        for (const tech of TECH_KEYWORDS) {
          if (techStack.length >= 6) break;
          if (readmeContent.includes(tech.toLowerCase()) && !techStack.includes(tech)) {
            techStack.push(tech);
          }
        }
      }
    } catch { /* ignore */ }
  }

  // Use provided image URL, or try to get from README if not provided
  let finalImageUrl = imageUrl;
  
  // Convert blob URL to raw URL if needed (for manually provided URLs)
  if (finalImageUrl) {
    finalImageUrl = convertToRawUrl(finalImageUrl, owner, repo, repoData.default_branch || "main");
  }
  
  if (!finalImageUrl) {
    try {
      const readmeResponse = await fetch(`${apiBase}/readme`, {
        headers: getHeaders(),
      });
      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json();
        const readmeContent = atob(readmeData.content);
        
        const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        let match;
        while ((match = imgRegex.exec(readmeContent)) !== null) {
          const imgUrl = match[2];
          if (imgUrl.includes(".svg") || imgUrl.includes("simpleicons")) continue;
          finalImageUrl = convertToRawUrl(imgUrl, owner, repo, repoData.default_branch || "main");
          break;
        }
      }
    } catch { /* ignore */ }
  }

  return {
    name: repoData.name,
    description: repoData.description || "No description available",
    tech: techStack.length > 0 ? techStack : ["GitHub"],
    link: repoData.homepage || undefined,
    github: repoData.html_url,
    youtube: youtubeUrl || undefined,
    image: finalImageUrl,
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
  };
}

/**
 * ProjectCard component renders individual project with:
 * - Project image (from GitHub README or custom provided)
 * - Architecture/diagram if available
 * - Description
 * - Tech stack as clickable badges
 */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const hasImage = project.image && project.image.trim() !== "";
  const imageSrc = project.image || "";
  const isLocalImage = hasImage && imageSrc.startsWith("/") ? true : false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700"
    >
      <div className="relative h-40 w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        {hasImage ? (
          <>
            <Image
              src={imageSrc}
              alt={`${project.name} screenshot`}
              fill
              unoptimized={isLocalImage}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-white dark:from-black to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-300 dark:text-gray-700">
              <FolderOpen size={40} strokeWidth={1} />
              <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
            </div>
          </div>
        )}

        {(project.stars || project.forks) && (
          <div className="absolute top-2 right-2 flex gap-2">
            {project.stars && (
              <span className="rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white dark:bg-white/70 dark:text-black">
                ⭐ {project.stars}
              </span>
            )}
            {project.forks && (
              <span className="rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white dark:bg-white/70 dark:text-black">
                🍴 {project.forks}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-black dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {project.name}
            </h3>
            <ActionButtons
              github={project.github}
              link={project.link}
              youtube={project.youtube}
              projectName={project.name}
            />
          </div>

          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {project.description}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600 dark:bg-gray-900 dark:text-gray-400"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function ProjectGrids() {
  const [showAll, setShowAll] = useState(false);
  const [projects, setProjects] = useState<Project[]>(manualProjects);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRepos() {
      if (GITHUB_REPOS.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const fetchedProjects = await Promise.all(
          GITHUB_REPOS.map((url, index) => fetchGitHubProject(url, IMAGE_URLS[index] || "", YOUTUBE_URLS[index] || ""))
        );
        setProjects([...fetchedProjects, ...manualProjects]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch projects");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRepos();
  }, []);

  const visibleProjects = showAll ? projects : projects.slice(0, INITIAL_COUNT);
  const hasMore = projects.length > INITIAL_COUNT;

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Projects
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Projects
        </h2>
        <span className="text-[10px] text-gray-500 dark:text-gray-600">
          {projects.length} total
        </span>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visibleProjects.map((project, index) => (
            <ProjectCard key={project.name} project={project} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="group flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 px-5 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <span>{showAll ? "Show Less" : `View More (${projects.length - INITIAL_COUNT})`}</span>
            <motion.span
              animate={{ rotate: showAll ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </motion.span>
          </button>
        </div>
      )}
    </div>
  );
}