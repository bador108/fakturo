export type Block =
  | { t: 'h2'; text: string }
  | { t: 'p'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'quote'; text: string }
  | { t: 'tip'; title: string; text: string }

export interface Post {
  slug: string
  title: string
  description: string
  category: string
  published: string
  updated?: string
  blocks: Block[]
  related: string[]
}
