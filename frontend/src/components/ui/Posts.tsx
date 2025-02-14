import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import Layout from "./Layout";
import api from "../../utils";
import { useDebounce } from "../../hooks/useDebounce";
import PostCard from "./PostCard";
import { PostsGridSkeleton } from "./PostCardSkeleton";
import { SkeletonTheme } from "react-loading-skeleton";

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  tags: string;
}

interface PostsResponse {
  posts: Post[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const Posts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveSearchTerm = useCallback((term: string) => {
    if (term.trim()) {
      setSearchHistory((prev) => {
        const newHistory = [term, ...prev.filter((h) => h !== term)].slice(
          0,
          5
        );
        localStorage.setItem("searchHistory", JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, []);

  const fetchPosts = useCallback(
    async (pageNum: number, search?: string) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "10",
        });

        if (search) {
          params.append("search", search);
        }

        const response = await api.get<PostsResponse>(`/api/posts?${params}`);

        setPosts((prev) =>
          pageNum === 1
            ? response.data.posts
            : [...prev, ...response.data.posts]
        );
        setTotalResults(response.data.metadata.total);
        setHasMore(pageNum < response.data.metadata.totalPages);

        if (pageNum === 1 && search) {
          saveSearchTerm(search);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    },
    [saveSearchTerm]
  );

  // Reset and fetch when search term changes
  useEffect(() => {
    setPage(1);
    fetchPosts(1, debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchPosts]);

  // Intersection Observer setup for infinite scrolling
  const lastPostRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
          fetchPosts(page + 1, debouncedSearchTerm);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page, fetchPosts, debouncedSearchTerm]
  );

  const handleSearchClick = (term: string) => {
    setSearchTerm(term);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Sticky Search Bar */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              {/* Search Input Container */}
              <div ref={searchContainerRef} className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Search History */}
              {showSuggestions && searchHistory.length > 0 && (
                <div className="flex items-center space-x-2 overflow-x-auto">
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchClick(term)}
                      className="flex-none px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm whitespace-nowrap transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Posts Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
              {loading && posts.length === 0 ? (
                <PostsGridSkeleton />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post, index) => (
                    <div
                      key={post.id}
                      ref={index === posts.length - 1 ? lastPostRef : undefined}
                    >
                      <PostCard
                        title={post.title}
                        content={post.content}
                        createdAt={post.createdAt}
                        tags={post.tags}
                        searchTerm={debouncedSearchTerm}
                      />
                    </div>
                  ))}
                </div>
              )}
            </SkeletonTheme>

            {loading && posts.length > 0 && (
              <div className="flex justify-center my-8">
                <PostsGridSkeleton />
              </div>
            )}

            {!loading && posts.length === 0 && (
              <div className="text-center text-gray-500 my-8">
                No posts found
              </div>
            )}
          </div>
        </div>

        {/* Fixed Results Counter */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                {totalResults > 0
                  ? `Showing ${posts.length} of ${totalResults} results`
                  : "No results"}
              </span>
              {totalResults > 0 && (
                <span>
                  Page {page} of {Math.ceil(totalResults / 10)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Posts;
