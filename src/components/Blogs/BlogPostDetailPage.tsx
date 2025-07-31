"use client";
// BlogPostDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useGetBlogPostBySlugQuery } from "@/redux/features/blogPosts/blogPostsApi";
import Link from "next/link";
import * as mammoth from "mammoth";

const BlogPostDetailPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug;
  const [docxContent, setDocxContent] = useState<string>("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [contentError, setContentError] = useState<string>("");

  const {
    data: blogPost,
    isLoading,
    error,
  } = useGetBlogPostBySlugQuery(slug as string);

  useEffect(() => {
    const loadDocxContent = async () => {
      if (!blogPost?.content_path) return;

      setIsLoadingContent(true);
      setContentError("");

      try {
        // Fetch the DOCX file as a blob
        const response = await fetch(blogPost.content_path);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        // Convert DOCX to HTML using mammoth
        const result = await mammoth.convertToHtml({ arrayBuffer });

        if (result.messages.length > 0) {
          console.warn("Mammoth conversion messages:", result.messages);
        }

        setDocxContent(result.value);
      } catch (error) {
        console.error("Error loading DOCX content:", error);
        setContentError(
          `Failed to load content: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsLoadingContent(false);
      }
    };

    loadDocxContent();
  }, [blogPost?.content_path]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading blog post: {error.toString()}
        </div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Blog post not found.
        </div>
      </div>
    );
  }

  const getContent = () => {
    if (blogPost.content_path) {
      if (isLoadingContent) {
        return (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading content...</span>
          </div>
        );
      }

      if (contentError) {
        return (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            <p className="font-semibold">Error loading content:</p>
            <p>{contentError}</p>
            <p className="mt-2 text-sm">
              Attempted to load from:
              <span className="font-mono bg-red-100 px-2 py-1 rounded ml-1">
                {blogPost.content_path}
              </span>
            </p>
          </div>
        );
      }

      if (docxContent) {
        return (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: docxContent }}
            style={{
              // Enhanced styling for better DOCX content display
              lineHeight: "1.6",
            }}
          />
        );
      }

      return (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded">
          <p>Content file found but no content loaded yet.</p>
          <p className="text-sm mt-1">
            File path:
            <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-1">
              {blogPost.content_path}
            </span>
          </p>
        </div>
      );
    }

    // Fallback to excerpt if no content_path
    return (
      <div className="prose prose-lg max-w-none">
        <p>{blogPost.excerpt || "No content available."}</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {blogPost.title}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-600 mb-4">
          {blogPost.author && (
            <div className="flex items-center">
              <span>By {blogPost.author.name}</span>
              {blogPost.author.email && (
                <span className="ml-1 text-sm">({blogPost.author.email})</span>
              )}
            </div>
          )}

          {blogPost.published_at && (
            <div className="flex items-center">
              {blogPost.author && (
                <span className="hidden sm:inline mx-2">•</span>
              )}
              <span>
                Published on{" "}
                {new Date(blogPost.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {blogPost.featured_image_url && (
        <div className="mb-8">
          <Image
            src={blogPost.featured_image_url}
            alt={blogPost.title}
            width={800}
            height={400}
            className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
            unoptimized
            loading="lazy"
            priority={false}
          />
        </div>
      )}

      {/* Main Content */}
      <article className="mb-8">{getContent()}</article>

      {/* Categories */}
      {blogPost.categories && blogPost.categories.length > 0 && (
        <div className="border-t pt-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {blogPost.categories.map((category) => (
              <span
                key={category.slug}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="border-t pt-6">
        <Link
          href="/blogs"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to all posts
        </Link>
      </div>
    </div>
  );
};

export default BlogPostDetailPage;
