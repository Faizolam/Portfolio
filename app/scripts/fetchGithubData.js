// Script to fetch GitHub repo data with full tech detection
// Run: node app/scripts/fetchGithubData.js
require("dotenv").config();
const { data } = require("framer-motion/client");
const fs = require("fs");
const { get } = require("http");
const { url } = require("inspector");
const path = require("path");
const { escape } = require("querystring");

// GitHub repos to fetch
const GITHUB_REPOS = [
  "https://github.com/polarsource/polar.git",
  "https://github.com/netbox-community/netbox.git",
  "https://github.com/ashishps1/awesome-system-design-resources",
  "https://github.com/BerriAI/litellm",
  "https://github.com/Faizolam/MediumX.git",
];

// Image URLs (in same order as GITHUB_REPOS)
// Use "/image.png" for local files in public folder
const IMAGE_URLS = [
  "/Polar.png",
  "https://raw.githubusercontent.com/netbox-community/netbox/main/docs/netbox_logo_light.svg",
  "https://raw.githubusercontent.com/ashishps1/awesome-system-design-resources/main/diagrams/system-design-github.png",
  "",
  "/faiz.png",
];

// YouTube URLs (optional)
const YOUTUBE_URLS = ["https://www.youtube.com/watch?v=hAfCbB-4cyk", "", "", ""];

// GitHub token (from environment)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;

const CALLS_PER_REPO = 10
// requiredCalls = repos * CALLS_PER_REPO

async function getRateLimit(headers={}) {
  const res = await fetch("https://api.github.com/rate_limit", { headers });

  if (!res.ok){
    throw new Error("Failed to fetch GitHub rate limit");
  }

  const data = await res.json();
  return data.resources.core;
}

async function chooseGitHubAuth(repoCount) {
  // calculate required API calls
  const requiredCalls = repoCount * CALLS_PER_REPO

  console.log(`\n🔎 Checking GitHub rate limits...`);
  console.log(`Need approx ${requiredCalls} API calls\n`);

  // 1️⃣ Check public rate limit
  const publicLimit = await getRateLimit();
  if (publicLimit.remaining >= requiredCalls){
    console.log("✅ Using PUBLIC GitHub API\n");
    return null; //no token needed
  }
  console.log("TOKEN EXISTS?", !!process.env.GITHUB_TOKEN);
  // 2️⃣ If token exists, check PAT rate limit
  if (GITHUB_TOKEN){
    const patLimit = await getRateLimit({Authorization: `token ${GITHUB_TOKEN}`});

     console.log(
      `PAT remaining: ${patLimit.remaining}/${patLimit.limit}`
    );

    if (patLimit.remaining >= requiredCalls){
      console.log("🔐 Switching to PAT authentication\n");
      return GITHUB_TOKEN;
    }
  }

  // 3️⃣ Not enough calls available
  const resetData = new Date(publicLimit.reset * 1000).toLocaleTimeString();

  throw new Error(
    `Not enough GitHub API calls remaining.
    Need ${requiredCalls} calls.
    Public remaining: ${publicLimit.remaining} 
    Reset at: ${resetData} 
    Try again later.`
  )
}

// Return token ONCE
let ACTIVE_TOKEN = null;
async function initGitHubAuth() {
  ACTIVE_TOKEN = await chooseGitHubAuth(GITHUB_REPOS.length);
  console.log("Auth initialized.\n");
}

function getHeaders() {
  if (ACTIVE_TOKEN) {
    return{
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json"
    }
  }
  return { Accept: "application/vnd.github.v3+json" };
}

function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  }
  return null;
}

// Language mapping
const LANGUAGE_MAP = {
  Python: "Python", JavaScript: "JavaScript", TypeScript: "TypeScript",
  Java: "Java", Go: "Go", Rust: "Rust", "C++": "C++", Ruby: "Ruby",
  PHP: "PHP", Swift: "Swift", Kotlin: "Kotlin", Scala: "Scala",
  Shell: "Shell", HTML: "HTML", CSS: "CSS", HCL: "Terraform", YAML: "YAML", JSON: "JSON",
};

// Tech keywords to detect from README
const TECH_KEYWORDS = [
  "Django", "Flask", "FastAPI", "React", "Next.js", "Vue", "Angular", "Svelte", "HTML", "CSS", "Tailwind", "Bootstrap", "Framer", "Redux", "Zustand", "React Native", "Expo", "Flutter", "SwiftUI",
  "Node.js", "Express", "Spring", "Rails", "Laravel", "ASP.NET",
  "GraphQL", "REST", "gRPC", "WebSocket",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Elasticsearch", "Prisma",
  "Supabase", "Firebase", "DynamoDB", "Cassandra",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions",
  "Vercel", "Netlify", "Heroku", "Railway", "NGINX",
  "TensorFlow", "PyTorch", "OpenAI", "LangChain", "Hugging Face", "AI", "ML",
  "Stripe", "Auth0", "OAuth", "JWT", "Web3", "Solidity", "Ethereum",
];

// Package.json dependencies mapping
const PACKAGE_JSON_DEPS = {
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

// Python dependencies mapping
const PYTHON_DEPS = {
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

// Go dependencies mapping
const GO_DEPS = {
  "gin-gonic/gin": "Gin", "labstack/echo": "Echo", "fiber/fiber": "Fiber",
  "gorilla/mux": "Mux", "go-chi/chi": "Chi",
  "gorm.io/gorm": "GORM", "go-redis/redis": "Redis", "lib/pq": "PostgreSQL",
  "mongodb/mongo-driver": "MongoDB", "elastic/go-elasticsearch": "Elasticsearch",
  "aws/aws-sdk-go": "AWS", "google-cloud/go": "GCP", "azure/azure-sdk-for-go": "Azure",
  "docker/docker": "Docker", "kubernetes/client-go": "Kubernetes",
  "jwt-go/jwt": "JWT", "golang-jwt/jwt": "JWT",
};

// Dependency files to check
const DEPENDENCY_FILES = [
  "package.json", "requirements.txt", "Pipfile", "pyproject.toml", "setup.py",
  "go.mod", "go.sum", "Gemfile", "Gemfile.lock",
];


// Fetch a single file content
async function fetchFileContent(apiBase, filePath) {
    const fullUrl = `${apiBase}/contents/${filePath}`;
    // 1. Initial attempt: No token (Public API)
    // console.log("Fetching without token...");
  try {
    const response = await fetch(fullUrl, {
      headers: getHeaders(),
    });
  
    if (response.ok) {
      const data = await response.json();
      // GitHub returns content encoded in Base64
      // We use decodeURIComponent(escape()) to handle emojis or special characters/UTF-8 safely
      return decodeURIComponent(escape(atob(data.content)));
        
    }
   

  } catch (e) { 
    console.error("Fetch failed:", e)
    return null;
   }
}

// Parse dependency file and detect tech
function parseDependencyFile(content, fileName, detectedTech) {
  const tech = new Set(detectedTech);

  try {
    if (fileName === "package.json" || fileName === "package-lock.json") {
      const json = JSON.parse(content);
      const allDeps = { ...json.dependencies, ...json.devDependencies };
      for (const [dep] of Object.entries(allDeps)) {
        if (PACKAGE_JSON_DEPS[dep]) {
          tech.add(PACKAGE_JSON_DEPS[dep]);
        }
      }
    } else if (fileName === "requirements.txt" || fileName === "Pipfile" || fileName === "pyproject.toml" || fileName === "setup.py") {
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
      const lines = content.split("\n");
      for (const line of lines) {
        for (const [dep, techName] of Object.entries(GO_DEPS)) {
          if (line.toLowerCase().includes(dep.toLowerCase())) {
            tech.add(techName);
          }
        }
      }
    }
  } catch (e) { /* ignore */ }

  return Array.from(tech);
}

// Detect tech from README content
function detectTechFromReadme(readmeContent, existingTech) {
  const tech = new Set(existingTech);
  const lowerContent = readmeContent.toLowerCase();

  for (const techName of TECH_KEYWORDS) {
    if (lowerContent.includes(techName.toLowerCase()) && !tech.has(techName)) {
      tech.add(techName);
    }
  }

  return Array.from(tech);
}

async function fetchRepo(githubUrl, imageUrl = "", youtubeUrl = "") {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    console.log(`❌ Invalid URL: ${githubUrl}`);
    return null;
  }

  const { owner, repo } = parsed;
  const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

  console.log(`📦 Fetching: ${owner}/${repo}...`);

  try {
    const repoResponse = await fetch(apiBase, { headers: getHeaders() });

    if (!repoResponse.ok) {
      console.log(`   ❌ Failed: ${repoResponse.status} ${repoResponse.statusText}`);
      return null;
    }

    const repoData = await repoResponse.json();
    const techStack = [];

    // 1. Get languages from the repo
    try {
      const langResponse = await fetch(`${apiBase}/languages`, { 
        headers: getHeaders()         
      });
      if (langResponse.ok) {
        const languages = await langResponse.json();
        const sorted = Object.entries(languages)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3);
        for (const [lang] of sorted) {
          if (LANGUAGE_MAP[lang]) {
            techStack.push(LANGUAGE_MAP[lang]);
          }
        }
        
    }
    
    } catch (e) { console.log("Language fetch failed:", e);
        return null;
     }

    console.log(`   📝 Languages: ${techStack.join(", ")}`);

    // 2. Check dependency files for frameworks and tools
    for (const depFile of DEPENDENCY_FILES) {
      if (techStack.length >= 6) break;

      const content = await fetchFileContent(apiBase, depFile);
      if (content) {
        const detectedTech = parseDependencyFile(content, depFile, techStack);
        for (const t of detectedTech) {
          if (!techStack.includes(t)) {
            techStack.push(t);
          }
        }
      }
    }

    if (techStack.length < 6) {
      // 3. Scan README for additional tech
      try {
        const readmeResponse = await fetch(`${apiBase}/readme`, { headers: getHeaders() });
        if (readmeResponse.ok) {
          const readmeData = await readmeResponse.json();
          const readmeContent = atob(readmeData.content);
          const detectedTech = detectTechFromReadme(readmeContent, techStack);
          for (const t of detectedTech) {
            if (!techStack.includes(t)) {
              techStack.push(t);
            }
          }
        }
      } catch (e) { /* ignore */ }
    }

    // Limit to 6 techs
    const finalTech = techStack.slice(0, 6);

    console.log(`   🛠️  Tech: ${finalTech.join(", ")}`);

    const project = {
      name: repoData.name,
      description: repoData.description || "No description available",
      tech: finalTech.length > 0 ? finalTech : ["GitHub"],
      link: repoData.homepage || undefined,
      github: repoData.html_url,
      youtube: youtubeUrl || undefined,
      image: imageUrl || undefined,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
    };

    console.log(`   ✅ ${repoData.name} (⭐ ${repoData.stargazers_count})`);
    return project;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  console.log("🚀 Starting GitHub data fetch with tech detection...\n");

  await initGitHubAuth();
  console.log(ACTIVE_TOKEN ? "🔐 Using PAT" : "🌍 Using Public API");

  const projects = [];

  for (let i = 0; i < GITHUB_REPOS.length; i++) {
    const project = await fetchRepo(
      GITHUB_REPOS[i],
      IMAGE_URLS[i] || "",
      YOUTUBE_URLS[i] || ""
    );
    if (project) {
      projects.push(project);
      await sleep(300);
    }
  }

  // Save to JSON file
  const outputPath = path.join(__dirname, "..", "data", "github-projects.json");
  fs.writeFileSync(outputPath, JSON.stringify(projects, null, 2));

  console.log(`\n✅ Done! Saved ${projects.length} projects to ${outputPath}`);
}

main().catch(console.error);