export interface Video {
  id?: number;
  title: string;
  path: string;
  rating?: string;
  release_date?: string;
  category_name: string | null;
  thumbnail?: string;
  actors?: number[];
  tags?: number[];
  favorite: number;
}

export interface Category {
  id: number;
  display_name: string;
}

export interface Actor {
  id: number;
  name: string;
  photo: string;
  description?: string;
}

export interface Tag {
  id: number;
  name: string;
}
