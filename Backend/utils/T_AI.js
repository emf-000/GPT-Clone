// getTogetherLlama3Response.js
import "dotenv/config";
import fetch from "node-fetch";

const getTogetherLlama3Response = async (message) => {
  const endpoint = "https://api.together.xyz/v1/chat/completions";

  const options = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/Llama-3-70b-chat-hf", 
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  };

  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();

    if (data?.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    } else {
      console.error("Unexpected API response:", data);
      return null;
    }
  } catch (err) {
    console.error("Error fetching from Together.ai:", err.message);
    return null;
  }
};

export default getTogetherLlama3Response;
