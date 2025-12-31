declare module "stopword" {
  export const eng: string[];
  export function removeStopwords<T extends string>(
    tokens: T[],
    stopwords?: string[]
  ): T[];
}
