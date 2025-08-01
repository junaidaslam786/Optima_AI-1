"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";
import { withAuth } from "@/components/Auth/withAuth";
import {
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useGetBlogPostBySlugQuery,
} from "@/redux/features/blogPosts/blogPostsApi";
import { useGetBlogCategoriesQuery } from "@/redux/features/blogCategories/blogCategoriesApi";
import {
  Save,
  Eye,
  ArrowLeft,
  Calendar,
  Tag,
  FileText,
  Globe,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content_path: string;
  content_file: File | null;
  author_id: string;
  published_at: string;
  is_published: boolean;
  seo_meta_title: string;
  seo_meta_description: string;
  featured_image_url: string;
  category_ids: string[];
}

const BlogCreateEditForm: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const session = useSession();
  const isEdit = Boolean(params?.slug);
  const postSlug = params?.slug as string;

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content_path: "",
    content_file: null,
    author_id: "",
    published_at: new Date().toISOString().slice(0, 16),
    is_published: false,
    seo_meta_title: "",
    seo_meta_description: "",
    featured_image_url: "",
    category_ids: [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof BlogFormData, string>>
  >({});
  const [showSEOSection, setShowSEOSection] = useState(false);

  // Fetch existing post for edit mode
  const {
    data: existingPost,
    isLoading: loadingPost,
    isError: postError,
  } = useGetBlogPostBySlugQuery(postSlug, {
    skip: !isEdit,
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } =
    useGetBlogCategoriesQuery();

  // Mutations
  const [
    createBlogPostMutation,
    {
      isLoading: isCreating,
      isSuccess: createSuccess,
      isError: createError,
      error: createErrorDetails,
    },
  ] = useCreateBlogPostMutation();

  const [
    updateBlogPostMutation,
    {
      isLoading: isUpdating,
      isSuccess: updateSuccess,
      isError: updateError,
      error: updateErrorDetails,
    },
  ] = useUpdateBlogPostMutation();

  // Populate form with existing post data
  useEffect(() => {
    if (existingPost && isEdit) {
      setFormData({
        title: existingPost.title || "",
        slug: existingPost.slug || "",
        excerpt: existingPost.excerpt || "",
        content_path: existingPost.content_path || "",
        content_file: null,
        author_id: existingPost.author_id || "",
        published_at: existingPost.published_at
          ? new Date(existingPost.published_at).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        is_published: existingPost.is_published || false,
        seo_meta_title: existingPost.seo_meta_title || "",
        seo_meta_description: existingPost.seo_meta_description || "",
        featured_image_url: existingPost.featured_image_url || "",
        category_ids: existingPost.categories?.map((cat) => cat.id) || [],
      });
    }
  }, [existingPost, isEdit, session]);

  // Handle success/error
  useEffect(() => {
    if (createSuccess || updateSuccess) {
      toast.success(
        isEdit
          ? "Blog post updated successfully!"
          : "Blog post created successfully!"
      );
      router.push("/admin/blogs/dashboard");
    }

    if (createError || updateError) {
      const errorDetails = createErrorDetails || updateErrorDetails;
      let errorMessage = isEdit
        ? "Failed to update blog post"
        : "Failed to create blog post";

      if (errorDetails) {
        if (
          "message" in errorDetails &&
          typeof errorDetails.message === "string"
        ) {
          errorMessage = errorDetails.message;
        } else if (
          "data" in errorDetails &&
          (typeof errorDetails.data === "string" ||
            (errorDetails.data as { error?: string })?.error)
        ) {
          errorMessage =
            (errorDetails.data as { error?: string })?.error ||
            (errorDetails.data as string);
        }
      }
      toast.error(errorMessage);
    }
  }, [
    createSuccess,
    updateSuccess,
    createError,
    updateError,
    createErrorDetails,
    updateErrorDetails,
    isEdit,
    router,
  ]);

  useEffect(() => {
    if (!isEdit && formData.title) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, isEdit]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setFormData((prev) => ({
        ...prev,
        content_file: file,
      }));
      if (errors.content_file) {
        setErrors((prev) => ({ ...prev, content_file: undefined }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));

      if (errors[name as keyof BlogFormData]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: checked
        ? [...prev.category_ids, categoryId]
        : prev.category_ids.filter((id) => id !== categoryId),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BlogFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (!isEdit && !formData.content_file) {
      newErrors.content_file = "Content file is required for new posts.";
    } else if (isEdit && !formData.content_file && !formData.content_path) {
      // In edit mode, if no new file is uploaded and no existing path, it's an error
      newErrors.content_file =
        "Either upload a new content file or ensure an existing one is linked.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setErrors({});

    const dataToSend = new FormData();
    dataToSend.append("title", formData.title);
    dataToSend.append("slug", formData.slug);

    if (formData.excerpt) dataToSend.append("excerpt", formData.excerpt);
    dataToSend.append("author_id", session.data?.user.id || "");
    if (formData.published_at)
      dataToSend.append("published_at", formData.published_at);
    dataToSend.append("is_published", String(formData.is_published));
    if (formData.seo_meta_title)
      dataToSend.append("seo_meta_title", formData.seo_meta_title);
    if (formData.seo_meta_description)
      dataToSend.append("seo_meta_description", formData.seo_meta_description);
    if (formData.featured_image_url)
      dataToSend.append("featured_image_url", formData.featured_image_url);

    if (formData.category_ids && formData.category_ids.length > 0) {
      dataToSend.append("category_ids", formData.category_ids.join(","));
    }

    try {
      if (isEdit) {
        if (formData.content_file) {
          dataToSend.append("content_file", formData.content_file);
        }
        await updateBlogPostMutation({
          slug: postSlug,
          formData: dataToSend,
        }).unwrap();
      } else {
        if (!formData.content_file) {
          toast.error("Content file is missing for new post.");
          return;
        }
        dataToSend.append("content_file", formData.content_file);
        await createBlogPostMutation(dataToSend).unwrap();
      }
    } catch (err) {
      console.error("Failed to save blog post:", err);
    }
  };

  if (loadingPost || categoriesLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8 border border-secondary text-secondary rounded-lg mx-auto min-h-[400px]">
        <LoadingSpinner />
        <p className="ml-2 text-secondary">
          {loadingPost ? "Loading blog post..." : "Loading form data..."}
        </p>
      </div>
    );
  }

  if (postError && isEdit) {
    return (
      <div className="w-full text-center p-8 bg-red-50 border border-red-200 text-red-600 rounded-lg mx-auto">
        <p>
          Failed to load blog post. The post may not exist or you may not have
          permission to edit it.
        </p>
        <Link href="/admin/blogs/dashboard" className="mt-4 inline-block">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full container mx-auto p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/blogs/dashboard">
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-extrabold text-primary">
            {isEdit ? "Edit Blog Post" : "Create New Blog Post"}
          </h1>
        </div>

        {isEdit && existingPost && (
          <Link href={`/blogs/${existingPost.slug}`} target="_blank">
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye size={16} />
              Preview
            </Button>
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Content Section */}
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <FileText size={20} />
            Post Content
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-primary mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  errors.title ? "border-red-500" : "border-secondary/30"
                }`}
                placeholder="Enter post title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-primary mb-2"
              >
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  errors.slug ? "border-red-500" : "border-secondary/30"
                }`}
                placeholder="post-url-slug"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
            </div>

            {/* Excerpt */}
            <div className="md:col-span-2">
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium text-primary mb-2"
              >
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Brief description of the post"
              />
            </div>

            {/* Content File Input */}
            <div className="md:col-span-2">
              <label
                htmlFor="content_file"
                className="block text-sm font-medium text-primary mb-2 items-center gap-2"
              >
                <UploadCloud size={20} />
                Content File (.doc, .docx) *
              </label>
              <input
                type="file"
                id="content_file"
                name="content_file"
                onChange={handleInputChange}
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" // Restrict to Word documents
                className={`w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  ${
                    errors.content_file
                      ? "border-red-500"
                      : "border-secondary/30"
                  }`}
              />
              {errors.content_file && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.content_file}
                </p>
              )}
              {isEdit && formData.content_path && !formData.content_file && (
                <p className="mt-2 text-sm text-tertiary">
                  Current content:{" "}
                  <a
                    href={formData.content_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {formData.content_path.split("/").pop()}
                  </a>
                  . Upload a new file to replace it.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Publishing & Categories Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Publishing Settings */}
          <div className="bg-white shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <Calendar size={20} />
              Publishing
            </h2>

            <div className="space-y-4">
              {/* Published Date */}
              <div>
                <label
                  htmlFor="published_at"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Publish Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="published_at"
                  name="published_at"
                  value={formData.published_at}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Published Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-secondary/30 rounded"
                />
                <label
                  htmlFor="is_published"
                  className="ml-2 block text-sm font-medium text-primary"
                >
                  Publish immediately
                </label>
              </div>

              {/* Featured Image */}
              <div>
                <label
                  htmlFor="featured_image_url"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Featured Image URL
                </label>
                <input
                  type="url"
                  id="featured_image_url"
                  name="featured_image_url"
                  value={formData.featured_image_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <Tag size={20} />
              Categories
            </h2>

            {categories && categories.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={formData.category_ids.includes(category.id)}
                      onChange={(e) =>
                        handleCategoryChange(category.id, e.target.checked)
                      }
                      className="h-4 w-4 text-primary focus:ring-primary border-secondary/30 rounded"
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="ml-2 block text-sm text-primary"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary text-sm">
                No categories available.
                <Link
                  href="/admin/blogs/categories"
                  className="text-primary underline ml-1"
                >
                  Create categories first
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* SEO Section */}
        <div className="bg-white shadow-xl rounded-lg p-6">
          <div className="flex flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Globe size={20} />
              SEO Settings
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowSEOSection(!showSEOSection)}
            >
              {showSEOSection ? "Hide" : "Show"} SEO Options
            </Button>
          </div>

          {showSEOSection && (
            <div className="space-y-4">
              {/* SEO Title */}
              <div>
                <label
                  htmlFor="seo_meta_title"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Meta Title
                </label>
                <input
                  type="text"
                  id="seo_meta_title"
                  name="seo_meta_title"
                  value={formData.seo_meta_title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="SEO optimized title (leave blank to use post title)"
                  maxLength={60}
                />
                <p className="mt-1 text-xs text-tertiary">
                  {formData.seo_meta_title.length}/60 characters
                </p>
              </div>

              {/* SEO Description */}
              <div>
                <label
                  htmlFor="seo_meta_description"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Meta Description
                </label>
                <textarea
                  id="seo_meta_description"
                  name="seo_meta_description"
                  value={formData.seo_meta_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Brief description for search engines (leave blank to use excerpt)"
                  maxLength={160}
                />
                <p className="mt-1 text-xs text-tertiary">
                  {formData.seo_meta_description.length}/160 characters
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white shadow-xl rounded-lg p-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/blogs/dashboard">
              <Button variant="secondary">Cancel</Button>
            </Link>
            {isEdit && (
              <span className="text-sm text-tertiary">
                Last updated:{" "}
                {existingPost?.updated_at
                  ? new Date(existingPost.updated_at).toLocaleString()
                  : "Never"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!formData.is_published && (
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => {
                  setFormData((prev) => ({ ...prev, is_published: false }));
                  const formEvent = e as unknown as React.FormEvent;
                  handleSubmit(formEvent);
                }}
                isLoading={isCreating || isUpdating}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                Save Draft
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating || isUpdating}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              {formData.is_published
                ? isEdit
                  ? "Update & Publish"
                  : "Create & Publish"
                : isEdit
                ? "Update Draft"
                : "Save & Publish"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default withAuth(BlogCreateEditForm, { allowedRoles: ["admin"] });
