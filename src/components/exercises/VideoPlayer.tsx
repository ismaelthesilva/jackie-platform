"use client";

import { useState } from "react";
import { extractYouTubeId } from "@/lib/utils/videoUtils";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  className?: string;
}

export default function VideoPlayer({
  videoUrl,
  className = "",
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = extractYouTubeId(videoUrl);

  if (!videoId) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
      >
        <p className="text-sm text-gray-500">Invalid video URL</p>
      </div>
    );
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  if (!isPlaying) {
    return (
      <div
        className={`relative cursor-pointer group ${className}`}
        onClick={() => setIsPlaying(true)}
      >
        <img
          src={thumbnailUrl}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all">
          <div className="bg-white rounded-full p-4 group-hover:scale-110 transition-transform">
            <Play className="h-8 w-8 text-red-600 fill-current" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={embedUrl}
      className={`w-full h-full ${className}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
