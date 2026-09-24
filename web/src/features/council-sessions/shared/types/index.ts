export type CouncilSession = {
  id: string;
  name: string;
  slug: string | null;
  council_url: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** 議案一覧ページ（/sessions/[slug]/bills）を持つ定例会 */
export type CouncilSessionWithSlug = CouncilSession & { slug: string };
