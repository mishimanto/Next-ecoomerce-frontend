export type BlogItem = {
  id?: number;
  slug: string;
  date: string;
  views: number;
  title: string;
  img: string;
  category?: string;
  author?: {
    name: string;
    role?: string;
    avatar?: string;
  };
  excerpt?: string;
  content?: string[];
  quote?: string;
  tags?: string[];
};
