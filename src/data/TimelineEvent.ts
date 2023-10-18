export type TimelineEvent = {
  year: number;
  title: string;
  tags: string[];
  details: string[];
  sources: string[];
  city?: string;
  individuals?: string[];
  author?: string;
  language?: string;
};
