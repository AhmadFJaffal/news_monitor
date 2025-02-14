import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PostCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden h-[400px] flex flex-col">
      <div className="p-6 flex flex-col flex-grow">
        {/* Title skeleton */}
        <div className="mb-2 h-[3.5rem]">
          <Skeleton count={2} />
        </div>

        {/* Content skeleton */}
        <div className="flex-grow mb-4">
          <Skeleton count={6} />
        </div>

        {/* Footer skeleton */}
        <div className="flex justify-between items-center mt-auto pt-4 border-t">
          <Skeleton width={100} />
          <div className="flex gap-2">
            <Skeleton width={60} height={24} borderRadius={20} />
            <Skeleton width={60} height={24} borderRadius={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const PostsGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default PostCardSkeleton;
