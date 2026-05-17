import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit for image uploads
app.use(express.json({ limit: "20mb" }));

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// AI Personal Color Analysis Endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Extract base64 data
    const base64Data = image.split(",")[1];
    const mimeType = image.split(",")[0].split(":")[1].split(";")[0];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: `너는 전문 퍼스널컬러 컨설턴트이자 이미지 분석 전문가야.
업로드된 사진을 바탕으로 사용자의 퍼스널컬러를 분석해줘.
모든 답변은 한국어로 작성해줘.

분석 항목:
1. 피부 톤 (밝기, 노란기/붉은기/푸른기, 맑은/차분한 느낌)
2. 전체 인상 (명도, 채도, 대비감, 부드러운/선명한 이미지)
3. 웜톤/쿨톤 판단 (웜/쿨/중립 가능성)
4. 4계절 추천 (봄 웜, 여름 쿨, 가을 웜, 겨울 쿨 중 하나와 세부 타입 예: 여름 쿨 뮤트)
5. 추천 컬러 (어울리는 색 8개, 피할 색 5개)

주의사항: 사진의 조명, 화장, 필터에 따라 결과가 다를 수 있다는 안내 문구를 포함해줘.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["skinTone", "impression", "toneType", "seasonalType", "colors", "disclaimer"],
          properties: {
            skinTone: {
              type: Type.OBJECT,
              required: ["brightness", "undertone", "clarity", "description"],
              properties: {
                brightness: { type: Type.STRING },
                undertone: { type: Type.STRING },
                clarity: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
            impression: {
              type: Type.OBJECT,
              required: ["value", "chroma", "contrast", "vibe", "description"],
              properties: {
                value: { type: Type.STRING },
                chroma: { type: Type.STRING },
                contrast: { type: Type.STRING },
                vibe: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
            toneType: {
              type: Type.OBJECT,
              required: ["type", "description"],
              properties: {
                type: { type: Type.STRING, description: "Warm, Cool, or Neutral" },
                description: { type: Type.STRING },
              },
            },
            seasonalType: {
              type: Type.OBJECT,
              required: ["main", "sub", "description"],
              properties: {
                main: { type: Type.STRING },
                sub: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
            colors: {
              type: Type.OBJECT,
              required: ["best", "worst"],
              properties: {
                best: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "8 recommended colors with color names or hex codes if possible"
                },
                worst: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "5 colors to avoid"
                },
              },
            },
            disclaimer: { type: Type.STRING },
          },
        },
      },
    });

    const result = JSON.parse(response.text);
    res.json(result);
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "분석 중 오류가 발생했습니다. 다시 시도해 주세요." });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
