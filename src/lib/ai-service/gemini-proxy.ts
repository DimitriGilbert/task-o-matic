import { LanguageModelV2 } from "@ai-sdk/provider";
import * as fs from "fs";
import * as path from "path";

export class GeminiProviderProxy implements LanguageModelV2 {
  readonly specificationVersion = "v2";
  readonly provider = "gemini";
  readonly modelId: string;
  readonly defaultObjectGenerationMode = "json";
  readonly supportedUrls: Record<string, RegExp[]> = {}; // Explicitly typed to match interface
  private readonly config: any;
  private realModel: LanguageModelV2 | null = null;

  constructor(modelId: string, config: any) {
    this.modelId = modelId;
    this.config = config;
  }

  private async getRealModel(): Promise<LanguageModelV2> {
    if (!this.realModel) {
      // The dependency 'ai-sdk-provider-gemini-cli' is misconfigured:
      // it claims to be ESM ("type": "module") but its "main" points to CJS.
      // This crashes Node.js with "module is not defined".
      // We must load the ESM entry point ("index.mjs") explicitly.

      const projectRoot = process.cwd();

      // Attempt to resolve the path explicitly to dist/index.mjs
      let modulePath = path.join(
        projectRoot,
        "node_modules",
        "ai-sdk-provider-gemini-cli",
        "dist",
        "index.mjs"
      );

      if (!fs.existsSync(modulePath)) {
        // Fallback for nested dep or monorepo structures (common in workspaces)
        modulePath = path.join(
          projectRoot,
          "..",
          "..",
          "node_modules",
          "ai-sdk-provider-gemini-cli",
          "dist",
          "index.mjs"
        );

        if (!fs.existsSync(modulePath)) {
          console.warn(
            "GeminiProxy: Could not locate index.mjs manually. Falling back to default resolution."
          );
          // Last ditch: try to rely on standard resolution.
          // This will likely crash if the package isn't fixed, but it's the only remaining option.
          const { createGeminiProvider } = await import(
            "ai-sdk-provider-gemini-cli"
          );
          const provider = createGeminiProvider(this.config);
          this.realModel = provider(this.modelId);
          return this.realModel!;
        }
      }

      // Dynamic import of the absolute path bypasses 'exports' restrictions
      // and forces Node to load the correct ESM file.
      const { createGeminiProvider } = await import(modulePath);
      const provider = createGeminiProvider(this.config);
      this.realModel = provider(this.modelId);
    }
    return this.realModel!;
  }

  async doGenerate(options: any): Promise<any> {
    const model = await this.getRealModel();
    return model.doGenerate(options);
  }

  async doStream(options: any): Promise<any> {
    const model = await this.getRealModel();
    return model.doStream(options);
  }
}
