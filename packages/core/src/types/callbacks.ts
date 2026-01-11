export type ProgressEvent =
  | { type: "started"; message: string }
  | { type: "progress"; message: string; current?: number; total?: number }
  | { type: "stream-chunk"; text: string }
  | { type: "reasoning-chunk"; text: string }
  | { type: "completed"; message: string }
  | { type: "info"; message: string }
  | { type: "warning"; message: string };

export interface ProgressCallback {
  onProgress?: (event: ProgressEvent) => void;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}
