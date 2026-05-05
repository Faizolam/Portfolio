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

// Import cached GitHub data from JSON file
import githubProjectsData from "../data/github-projects.json";

// Use cached data - no API calls needed at runtime
const cachedGitHubProjects: Project[] = githubProjectsData;

// Your manual projects
const manualProjects: Project[] = [
  // {
  //   name: "MetaWiper",
  //   description: "A tool that cleans image metadata. My first real attempt at shipping something complete.",
  //   tech: ["Python", "Pillow"],
  //   github: "https://github.com/ashishps1/awesome-system-design-resources.git",
  //   // link: "https://algomaster.io/metawiper",
  //   link: "https://algomaster.io/",
  //   image: "https://raw.githubusercontent.com/ashishps1/awesome-system-design-resources/main/diagrams/system-design-github.png",
  //   youtube: "https://www.youtube.com/watch?v=OeR2OiUA0gA",
  // },
  // {
  //   name: "NeuraLeap",
  //   description: "Had the most meaningful user interactions yet - HRs from established firms. Data pipelines handling 50M LinkedIn profiles.",
  //   tech: ["Python", "AI/ML", "Redis"],
  //   link: "#",
  //   image: "",
  // },
  // {
  //   name: "Meteor",
  //   description: "AI SEO toolkit being used by 6 YC-backed companies. Real users. Real traction. Real feedback loops.",
  //   tech: ["TypeScript", "LangChain", "PostgreSQL"],
  //   link: "#",
  //   image: "",
  // },
  // {
  //   name: "Eumlet",
  //   description: "UAE-based B2B Web3 payments platform deployed on AWS with high availability and secure transactions.",
  //   tech: ["Next.js", "AWS", "NGINX"],
  //   link: "#",
  //   github: "#",
  //   image: "",
  // },
];

const INITIAL_COUNT = 6;

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
    // Use cached GitHub data from JSON file - no API calls needed
    setProjects([...cachedGitHubProjects, ...manualProjects]);
    setIsLoading(false);
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