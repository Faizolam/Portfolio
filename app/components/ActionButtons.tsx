"use client";

import { Github, ExternalLink, Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ActionButtonsProps {
  github?: string;
  link?: string;
  youtube?: string;
  projectName: string;
}

export function ActionButtons({ github, link, youtube, projectName }: ActionButtonsProps) {
  const [showVideo, setShowVideo] = useState(false);

  const hasAnyAction = github || link || youtube;

  if (!hasAnyAction) return null;

  return (
    <>
      <div className="flex gap-2">
        {youtube && (
          <button
            onClick={() => setShowVideo(true)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-500 transition-all hover:bg-red-500 hover:text-white"
            title="Watch demo"
          >
            <Play size={12} fill="currentColor" />
          </button>
        )}
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-gray-800 hover:text-white dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-100 dark:hover:text-black"
            title="View source code"
          >
            <Github size={14} />
          </a>
        )}
        {link && link !== "" && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 transition-all hover:bg-blue-500 hover:text-white"
            title="View live project"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* YouTube Video Modal */}
      <AnimatePresence>
        {showVideo && youtube && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
              >
                <X size={16} />
              </button>
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  src={youtube.replace("watch?v=", "embed/")}
                  title={`${projectName} demo`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}