import React from "react";
import HighlightText from "./HighlightText";

interface PostCardProps {
  title: string;
  content: string;
  createdAt: string;
  tags?: string;
  searchTerm?: string;
}

const PostCard: React.FC<PostCardProps> = ({
  title,
  content,
  createdAt,
  tags,
  searchTerm = "",
}) => {
  const getTagsArray = (tags: string): string[] => {
    return tags.split(",").filter(Boolean);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden h-[400px] flex flex-col">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          <HighlightText text={title} searchTerm={searchTerm} />
        </h3>
        <p className="text-gray-600 mb-4">
          <HighlightText text={content} searchTerm={searchTerm} />
        </p>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            {new Date(createdAt).toLocaleDateString()}
          </span>
          {tags && (
            <div className="flex gap-2 flex-wrap">
              {getTagsArray(tags).map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tag.toLowerCase().includes(searchTerm.toLowerCase())
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  <HighlightText text={tag} searchTerm={searchTerm} />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
