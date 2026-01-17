
import { GoogleGenAI } from "@google/genai";

export const getPharmaceuticalAdvice = async (productName: string, status: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Você é um consultor farmacêutico especialista. O produto "${productName}" está com status "${status}". 
  Utilizando ferramentas de busca para garantir a precisão atualizada (normas ANVISA e descartes locais):
  1. Se estiver vencido: Forneça o passo a passo exato do descarte ético.
  2. Se estiver próximo ao vencimento: Dicas cruciais de armazenamento ou priorização.
  3. Alertas de Segurança: Mencione se houve algum recall recente ou aviso sanitário importante para este medicamento.
  Mantenha o tom profissional, direto e em tópicos. Mencione as fontes se houver alertas de recall.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro model for better reasoning and search grounding
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    let sourceText = "";
    if (sources.length > 0) {
      sourceText = "\n\nFontes consultadas:\n" + sources.map((s: { web?: { uri?: string } }) => s.web?.uri).filter(Boolean).slice(0, 3).join("\n");
    }

    return text + sourceText;
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return "Não foi possível obter orientações via IA no momento. Por favor, consulte o manual da ANVISA ou o CRF local.";
  }
};

export const scanProductLabel = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "Identifique o nome do medicamento e o código de barras (EAN-13) se visível nesta imagem. Retorne apenas o nome e o código em formato JSON simples: { 'name': '...', 'barcode': '...' }" }
        ]
      }
    });

    const text = response.text;
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Erro no processamento da imagem:", error);
    return null;
  }
};
