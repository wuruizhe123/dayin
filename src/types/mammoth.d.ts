declare module 'mammoth' {
  export interface Result<T> {
    value: T;
    messages: Message[];
  }

  export interface Message {
    type: 'warning' | 'error';
    message: string;
  }

  export interface TextContent {
    text: string;
  }

  export interface HtmlContent {
    value: string;
  }

  export interface Document {
    paragraphs: Paragraph[];
  }

  export interface Paragraph {
    style: string;
    text: string;
    children: ParagraphChild[];
  }

  export interface ParagraphChild {
    type: string;
    text?: string;
  }

  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<Result<TextContent>>;
  export function convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<Result<HtmlContent>>;
  export function parseRawText(input: { arrayBuffer: ArrayBuffer }): Promise<Result<Document>>;
}