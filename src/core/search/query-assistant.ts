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
  isAvailable(): boolean;
  rephrase(request: RephraseRequest): Promise<string | null>;
}
