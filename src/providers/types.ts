export interface Provider {
  generateMessages(prompt: string): Promise<string[]>;
}