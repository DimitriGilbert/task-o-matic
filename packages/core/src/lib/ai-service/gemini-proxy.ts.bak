import type { LanguageModelV2 } from "@ai-sdk/provider";

let _createGeminiProvider: any = null;

function getCreateGeminiProvider() {
  if (_createGeminiProvider) return _createGeminiProvider;

  if (typeof window !== "undefined") {
    throw new Error(
      "GeminiProviderProxy is only available in Node.js CLI environments."
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  _createGeminiProvider =
    require("ai-sdk-provider-gemini-cli").createGeminiProvider;
  return _createGeminiProvider;
}

export class GeminiProviderProxy implements LanguageModelV2 {
  readonly specificationVersion = "v2";
  readonly provider = "gemini";
  readonly modelId: string;
  readonly defaultObjectGenerationMode = "json";
  readonly supportedUrls: Record<string, RegExp[]> = {};
  private readonly config: any;
  private realModel: LanguageModelV2 | null = null;

  constructor(modelId: string, config: any) {
    this.modelId = modelId;
    this.config = config;
  }

  private getRealModel(): LanguageModelV2 {
    if (!this.realModel) {
      const createGeminiProvider = getCreateGeminiProvider();
      const provider = createGeminiProvider(this.config);
      this.realModel = provider(this.modelId);
    }
    return this.realModel!;
  }

  async doGenerate(options: any): Promise<any> {
    const model = this.getRealModel();
    return model.doGenerate(options);
  }

  async doStream(options: any): Promise<any> {
    const model = this.getRealModel();
    return model.doStream(options);
  }
}
