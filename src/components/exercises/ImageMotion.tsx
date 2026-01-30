import React from "react";

interface Props {
  images?: string[];
  alt?: string;
  className?: string;
}

export default function ImageMotion({
  images = [],
  alt = "",
  className = "",
}: Props) {
  const [idx, setIdx] = React.useState(0);

  // Always show an image. If no images, use a fallback image.
  const hasImages = Array.isArray(images) && images.length > 0;
  const fallback = "/no-image.png"; // Place a fallback image in public/no-image.png
  const displayImages = hasImages ? images : [fallback];

  const toggle = () => {
    if (displayImages.length > 1) setIdx((i) => (i === 0 ? 1 : 0));
  };

  return (
    <div
      className={`w-full h-full bg-gray-100 rounded-md overflow-hidden cursor-pointer flex items-center justify-center ${className}`}
      onClick={toggle}
      title="Click to show movement"
    >
      <img
        src={
          displayImages[idx]?.startsWith("http")
            ? displayImages[idx]
            : displayImages[idx]?.startsWith("/")
              ? displayImages[idx]
              : `/exercises/${displayImages[idx]}`
        }
        alt={`${alt} ${idx === 0 ? "start" : "end"}`}
        className="object-contain w-full h-full"
      />
    </div>
  );
}
