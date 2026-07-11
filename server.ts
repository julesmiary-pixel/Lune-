import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON bodies with higher limits for base64 uploads
app.use(express.json({ limit: "10mb" }));

// Initialize Google Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// 1. API: Chat endpoint with Gemini 3.5 Flash
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, image } = req.body;

    if (!message) {
      res.status(400).json({ error: "Mila hafatra ianao (Message is required)." });
      return;
    }

    // Safety checks: Block inappropriate content/bad words immediately
    const lowerMessage = message.toLowerCase();
    const inappropriateKeywords = [
      "porn", "porno", "nude", "naked", "sexy", "seksy", "erotic", "nsfw", "fuck", "bitch", 
      "asshole", "bastard", "cock", "vagina", "penis", "hentai", "strip", "salope", "connard", 
      "pute", "enculer", "baiser", "vetaveta", "miboridana", "boridana", "mivarotena", "mamono tena"
    ];

    const hasInappropriate = inappropriateKeywords.some(keyword => lowerMessage.includes(keyword));
    if (hasInappropriate) {
      res.json({ 
        text: "Miala tsiny indrindra! 😔 Araka ny fitsipika mifehy ahy dia tsy mahazo miteny ratsy aho, ary tsy afaka miresaka na mamorona votoatiny tsy mendrika (sary, horonan-tsary, na teny ratsy). Misy zavatra hafa mahasoa azoko ampiana anao ve? ✨" 
      });
      return;
    }

    // Format chat history for Gemini
    // Ensure we send valid system instructions with safety rules
    const systemInstruction = 
      "Ianao dia 'lune', mpanampy manan-tsaina artifisialy sady namana mahafinaritra indrindra.\n" +
      "Mifandraisa amin'ny mpampiasa amin'ny fomba tsotra, mahafinaritra, ary mitondra tena tahaka ny tena namana akaiky.\n\n" +
      "FITSIPIDY MOMBA NY EMOJI (STRICT EMOJI RULES):\n" +
      "- VOARARA TANTERAKA NY MAMPIDITRA EMOJI BETSAKA LOATRA (emoji-flooding) satria manaratsy endrika ny resaka izany.\n" +
      "- Ampiasao 1 na 2 ihany ny emoji amin'ny hafatra manontolo (ohatra tsara indrinta: 'Mahafinaritra an'izany hevitra izany! 😆' na 'Salama tsara namako! 🙂').\n" +
      "- VOARARA TANTERAKA ny mampiasa ny emoji '😊' satria matotra loatra izany. Soloina '🙂' foana rehefa tiana hampiasaina io emoji io.\n" +
      "- VOARARA ny mametraka emoji mifanakaiky mitovy na samy hafa (toy ny '😂 😂' na '🧠 💡'). Faty emoji tokana ihany no azo ampiasaina isaky ny fehezanteny raha ilaina.\n" +
      "- Tokony hiovaova mifanaraka tsara amin'ny toe-javatra sy ny fihetseham-po ny emoji (dynamic & context-aware).\n" +
      "- Aza mampiasa emoji ho lohan'ny andalana na ho bullet points rehefa manao lisitra na andalan-tsoratra maromaro. Ataovy madio, tsara tarehy, ary madio mangirana ny endriky ny lahatsoratra.\n\n" +
      "TOETRA MANOKANA TOKONY HARAVINA:\n" +
      "- Namana tsotra, mahafinaritra sady mampiasa fiteny Malagasy mahazatra (colloquial, natirely).\n" +
      "- Tia vazivazy kely rehefa miresaka sady mahay mampihomehy amin'ny fomba mendrika.\n" +
      "- Mametraka fanontaniana kely foana any amin'ny faran'ny resaka mba hanohizana ny fifampiresahana.\n\n" +
      "IREO ZAVATRA HO HAIN'I LUNE:\n" +
      "- Fikarohana zavatra na vaovao amin'ny tranonkala.\n" +
      "- Fandikana, famakafakana, na famintinana antontan-taratasy.\n" +
      "- Famokarana feo sy tantara.\n" +
      "- Fanoratana boky, tantara fohy, tononkalo mampihomehy.\n" +
      "- Torohevitra momba ny fiainana sy fitadiavana asa (CV, torolalana).\n" +
      "- Fandalinana ara-panahy ary fandalinana siantifika (fizika, matematika, simia).\n" +
      "- Mamaky sy mandinika sary (vision / image analysis).\n\n" +
      "FITSIPIDY MOMBA NY FIAROVANA:\n" +
      "- Voarara tanteraka ny miteny ratsy na mamorona zavatra tsy mendrika (vetaveta, NSFW, sary maloto).\n" +
      "- VOARARA TANTERAKA ny mody mamorona sary mivantana amin'ny alalan'ny rohy/markdown misy teny hoe 'undefined' na base64 sandoka ato amin'ny chat. Raha mangataka famoronana sary ny mpampiasa, dia toroy hevitra am-panajana sy am-pifaliana izy hampiasa ny 'Studio Famoronan-Sary' (ao amin'ny menio ankavia) izay natokana ho an'izany indrindra sady mampiasa milina mpanorona sary kanto sy haingana!";

    // Format previous history into Gemini contents structure if any
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        });
      }
    }

    const userParts: any[] = [{ text: message }];
    
    // Support either a single image or multiple images (array of base64 strings)
    if (image) {
      const imagesArray = Array.isArray(image) ? image : [image];
      for (const img of imagesArray) {
        const match = img.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          userParts.unshift({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        }
      }
    }
    contents.push({ role: "user", parts: userParts });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Miala tsiny, tsy nahazo valiny aho.";
    res.json({ text: reply });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Nisy fahadisoana teo am-piresahana amin'i lune.",
      details: error.message || String(error),
    });
  }
});

// 2. API: Image Generation endpoint with gemini-3.1-flash-lite-image
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Mila mamorona lohahevitra ianao (Prompt is required)." });
      return;
    }

    // Safety checks: Block inappropriate image content/bad words immediately
    const lowerPrompt = prompt.toLowerCase();
    const inappropriateKeywords = [
      "porn", "porno", "nude", "naked", "sexy", "seksy", "erotic", "nsfw", "fuck", "bitch", 
      "asshole", "bastard", "cock", "vagina", "penis", "hentai", "strip", "salope", "connard", 
      "pute", "enculer", "baiser", "vetaveta", "miboridana", "boridana", "mivarotena", "violence", 
      "gore", "blood", "killing", "murder"
    ];

    const hasInappropriate = inappropriateKeywords.some(keyword => lowerPrompt.includes(keyword));
    if (hasInappropriate) {
      res.status(400).json({ 
        error: "Mila mamorona lohahevitra mendrika ianao. Araka ny fitsipika dia voarara ny mamorona sary na horonan-tsary tsy mendrika. ❌" 
      });
      return;
    }

    // Enhance prompt for beautiful artistic outputs
    const enhancedPrompt = `A stunning digital artwork representing: ${prompt}. Highly detailed, beautiful colors, professional photography/digital art style.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let base64Image = null;
    let message = "";

    // Iterate candidates and parts to find the base64 image data
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
        } else if (part.text) {
          message += part.text;
        }
      }
    }

    if (base64Image) {
      res.json({
        imageUrl: `data:image/png;base64,${base64Image}`,
        description: message || "Sary novoronin'i lune",
      });
    } else {
      res.status(500).json({
        error: "Tsy nahazo sary avy amin'ny milina mpanorona sary izahay.",
        message,
      });
    }
  } catch (error: any) {
    console.error("Image generation error:", error);
    res.status(500).json({
      error: "Tsy nahomby ny famoronana sary.",
      details: error.message || String(error),
    });
  }
});

// Integrate Vite Middleware
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
