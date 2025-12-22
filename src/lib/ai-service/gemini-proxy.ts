import { LanguageModelV2 } from "@ai-sdk/provider";

export class GeminiProviderProxy implements LanguageModelV2 {
  readonly specificationVersion = "v2";
  readonly provider = "gemini";
  readonly modelId: string;
  readonly defaultObjectGenerationMode = "json";
  readonly supportedUrls = {}; // Empty record as per interface requirement for no URL support
  private readonly config: any;
  private realModel: LanguageModelV2 | null = null;

  constructor(modelId: string, config: any) {
    this.modelId = modelId;
    this.config = config;
  }

  private async getRealModel(): Promise<LanguageModelV2> {
    if (!this.realModel) {
      // Dynamic import to bypass Node's CJS/ESM strictness with this specific broken package
      const { createGeminiProvider } = await import(
        "ai-sdk-provider-gemini-cli"
      );
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
