export interface BlogCategoryNested {
    id: string;
    name: string;
    slug: string;
}

export interface BlogAuthor {
    id: string;
    name: string;
    email: string;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content_path: string;
    author_id?: string;
    author?: BlogAuthor;
    published_at?: string;
    is_published: boolean;
    seo_meta_title?: string;
    seo_meta_description?: string;
    featured_image_url?: string;
    created_at: string;
    updated_at: string;
    categories?: BlogCategoryNested[];
}

export interface CreateBlogPost {
    title: string;
    slug: string;
    excerpt?: string;
    content_file: File;
    author_id: string;
    published_at?: string;
    is_published?: boolean;
    seo_meta_title?: string;
    seo_meta_description?: string;
    featured_image_url?: string;
    category_ids?: string[];
}

export interface UpdateBlogPost {
    slug: string;
    title?: string;
    excerpt?: string;
    content_path?: string;
    author_id?: string;
    published_at?: string;
    is_published?: boolean;
    seo_meta_title?: string;
    seo_meta_description?: string;
    featured_image_url?: string;
    category_ids?: string[];
}
