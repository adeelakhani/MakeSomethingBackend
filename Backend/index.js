import dotenv from "dotenv";
import { Anthropic } from "@anthropic-ai/sdk";
import express from "express";
import cors from "cors";


const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();
const API_KEY = process.env.ANTHROPIC_API_KEY;

const PROMPT = `
You are essentially a cooking assistance that is going to recieve a list of ingriedents that
a user has. You will suggest a recipe that the user can make with all or some of the ingredients the
user has depending on what is best. It is not neccessary to use every ingredient. You can also suggest
additional ingredients that the user may want to go get for the recipe to be better but please try to 
not include too many extra ingredients, and none best case scenario. Please format your response in
markdown and in a way that is easy to render on a webpage. Remember: format in MARKDOWN`;

const anthropic = new Anthropic({
  apiKey: API_KEY,
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/api/getrecipe", async (req, res) => {
    const ingredients = req.body.ingredients;
    try {
      const recipe = await getInputAPI(ingredients);
      res.status(200).json({ recipe });
    } catch (error) {
      console.error("Error in /api/get-recipe endpoint:", error);
      res.status(500).json({ error: "Failed to fetch recipe." });
    }
  });

export default async function getInputAPI(ingredients) {
  const ingredientsFormatted = ingredients.join(", ");
  try {
    console.log("Hi there")

    const msg = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      temperature: 0,
      system: PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `I have ${ingredientsFormatted}. Please give me a recipe you recommend!`,
            },
          ],
        },
      ],
    });
    return msg.content[0].text;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});