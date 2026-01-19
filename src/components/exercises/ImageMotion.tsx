import React from "react";
import VideoPlayer from "./VideoPlayer";

interface Props {
  images?: string[];
  videoUrl?: string | null;
  alt?: string;
}

export default function ImageMotion({
  images = [],
  videoUrl,
  alt = "",
}: Props) {
  const [idx, setIdx] = React.useState(0);

  if (!Array.isArray(images) || images.length === 0) {
    if (videoUrl) {
      return (
        <div className="aspect-video mb-3 bg-gray-100 rounded-md overflow-hidden">
          <VideoPlayer videoUrl={videoUrl} />
        </div>
      );
    }

    return (
      <div className="aspect-video mb-3 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
        No image available
      </div>
    );
  }

  const toggle = () => {
    if (images.length > 1) setIdx((i) => (i === 0 ? 1 : 0));
  };

  return (
    <div
      className="aspect-video mb-3 bg-gray-100 rounded-md overflow-hidden cursor-pointer flex items-center justify-center"
      onClick={toggle}
      title="Click to toggle image"
    >
      <img
        src={`/exercises/${images[idx]}`}
        alt={`${alt} ${idx === 0 ? "start" : "end"}`}
        className="object-contain w-full h-full"
      />
    </div>
  );
}
