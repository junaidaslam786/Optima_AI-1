"use client";
// BlogPostDetailPage.tsx
import React from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useGetBlogPostBySlugQuery } from "@/redux/features/blogPosts/blogPostsApi";
import Link from "next/link";

const BlogPostDetailPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug;

  const {
    data: blogPost,
    isLoading,
    error,
  } = useGetBlogPostBySlugQuery(slug as string);

  if (isLoading) {
    return <div>Loading blog post...</div>;
  }

  if (error) {
    return <div>Error loading blog post: {error.toString()}</div>;
  }

  if (!blogPost) {
    return <div>Blog post not found.</div>;
  }

  const getContent = () => {
    if (blogPost.content_path) {
      return (
        <p>
          Content would be loaded from:{" "}
          <span className="font-mono bg-gray-100 p-1 rounded">
            {blogPost.content_path}
          </span>
          . For this example, this is a placeholder.
        </p>
      );
    }
    return <p>{blogPost.excerpt || "No content available."}</p>;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">{blogPost.title}</h1>
      {blogPost.author && (
        <p className="text-gray-600 mb-2">
          By {blogPost.author.name} ({blogPost.author.email})
        </p>
      )}
      {blogPost.published_at && (
        <p className="text-gray-600 mb-4">
          Published on: {new Date(blogPost.published_at).toLocaleDateString()}
        </p>
      )}
      {blogPost.featured_image_url && (
        <Image
          src={blogPost.featured_image_url}
          alt={blogPost.title}
          width={800}
          height={320}
          className="w-full h-80 object-cover rounded-md mb-6"
        />
      )}

      <div className="prose max-w-none mb-6">{getContent()}</div>

      {blogPost.categories && blogPost.categories.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Categories:</h3>
          <div className="flex flex-wrap gap-2">
            {blogPost.categories.map((category) => (
              <span
                key={category.slug}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <Link href="/blogs" className="text-blue-600 hover:underline mt-8 block">
        &larr; Back to all posts
      </Link>
    </div>
  );
};

export default BlogPostDetailPage;
