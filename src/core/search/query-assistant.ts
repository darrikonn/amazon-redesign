export type AssistantVocabulary = {
  categories: readonly string[];
  features: readonly string[];
  colors: readonly string[];
};

export type RephraseRequest = {
  text: string;
  unrecognizedWords: readonly string[];
  vocabulary: AssistantVocabulary;
};

export interface QueryAssistant {
  rephrase(request: RephraseRequest): Promise<string | null>;
}
