import React from "react";

interface HighlightTextProps {
  text: string;
  searchTerm: string;
  className?: string;
}

const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  searchTerm,
  className = "",
}) => {
  if (!searchTerm.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark
            key={index}
            className="bg-yellow-200 text-gray-900 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default HighlightText;
