import { interpretQuery } from "@/component";

export type QueryPreview = {
  labels: readonly string[];
};

export class PreviewQuery {
  async execute(text: string): Promise<QueryPreview> {
    return { labels: interpretQuery(text).terms.map((term) => term.label) };
  }
}
