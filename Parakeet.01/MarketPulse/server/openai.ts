import OpenAI from "openai";
import { storage } from "./storage";
import { AIAssistantResponse } from "@shared/types";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Store information about the marketplace offerings for the system message
const MARKETPLACE_INFO = `
Parakeet is an AI-powered Telegram marketplace by ApexBart Solutions with the following offerings:

- AI Services: 
  * Custom AI Chatbot Development ($299) - Trained on business data
  * Content Generation Service ($199) - AI-powered blog and social media content
  * Predictive Analytics ($399) - Business intelligence reports
  
- SEO & Copywriting:
  * Website SEO Audit ($99) - Full analysis and recommendations
  * Content Strategy ($149) - Monthly content planning
  * Product Description Writing ($49) - Compelling copy for your products
  
- Automation Tools:
  * Workflow Automation ($249) - Automate routine business tasks
  * Process Optimization ($299) - Streamline business operations
  * Data Integration ($199) - Connect different data sources
  
- Online Courses:
  * AI Strategy Masterclass ($199) - 10 modules, 6 hours
  * Python for Automation ($149) - 12 modules, 8 hours
  * Data Analytics Fundamentals ($129) - 8 modules, 5 hours
`;

export async function aiChat(message: string): Promise<AIAssistantResponse> {
  try {
    // First, check if this is a direct search query that should use the product search
    const normalizedMessage = message.toLowerCase();
    const isSearchQuery = normalizedMessage.includes('find') || 
                          normalizedMessage.includes('search') || 
                          normalizedMessage.includes('looking for');
    
    if (isSearchQuery) {
      // Extract keywords from message
      const keywords = extractKeywords(normalizedMessage);
      
      // Search products based on keywords
      const products = await searchProductsByKeywords(keywords);
      
      if (products.length > 0) {
        return {
          message: `I found ${products.length} products that might interest you:`,
          products: products.slice(0, 3) // Limit to 3 products
        };
      }
    }

    // If it's not a search query or no products were found, use the GPT model
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: `You are the AI assistant for Parakeet, an AI-powered marketplace on Telegram. 
You are helpful, knowledgeable, and tailored to assist users find and understand products.
${MARKETPLACE_INFO}

When responding:
1. Keep answers concise and focused on the marketplace products
2. If users ask about product recommendations, suggest relevant items from the catalog
3. Provide pricing information when available
4. Offer quick option buttons when appropriate
5. Never mention that you're an AI model, just focus on being the marketplace assistant
6. Format your answers with clear sections using line breaks and bullet points for readability
7. Respond in JSON format with these fields:
   - message: your response text
   - options: array of option objects with 'text' and 'value' fields (optional)

Example response format:
{
  "message": "your response text here",
  "options": [
    {"text": "Option 1", "value": "option_1"},
    {"text": "Option 2", "value": "option_2"}
  ]
}`
        },
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(responseContent);
    
    // Return formatted AI response
    return {
      message: parsedResponse.message,
      options: parsedResponse.options || []
    };
  } catch (error) {
    console.error('AI Assistant error:', error);
    
    // Fallback response for when the API fails
    return {
      message: "I'm sorry, I encountered an error while processing your request. Please try again later.",
      options: [
        { text: "Featured Products", value: "show_featured" },
        { text: "Popular Services", value: "show_services" },
        { text: "Trending Courses", value: "show_courses" }
      ]
    };
  }
}

// Helper function to extract keywords from a message
function extractKeywords(message: string): string[] {
  // Remove common words and punctuation
  const stopWords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 
                     'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 
                     'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 
                     'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 
                     'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 
                     'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 
                     'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 
                     'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 
                     'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 
                     'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 
                     'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 
                     'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'don\'t', 'should', 
                     'should\'ve', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'aren\'t', 
                     'couldn', 'couldn\'t', 'didn', 'didn\'t', 'doesn', 'doesn\'t', 'hadn', 'hadn\'t', 
                     'hasn', 'hasn\'t', 'haven', 'haven\'t', 'isn', 'isn\'t', 'ma', 'mightn', 'mightn\'t', 
                     'mustn', 'mustn\'t', 'needn', 'needn\'t', 'shan', 'shan\'t', 'shouldn', 'shouldn\'t', 
                     'wasn', 'wasn\'t', 'weren', 'weren\'t', 'won', 'won\'t', 'wouldn', 'wouldn\'t',
                     'looking', 'for', 'find', 'me', 'need', 'want', 'search', 'help'];
  
  // Clean and tokenize the message
  const cleanMessage = message.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  // Return unique keywords
  return [...new Set(cleanMessage)];
}

// Helper function to search products by keywords
async function searchProductsByKeywords(keywords: string[]): Promise<any[]> {
  if (keywords.length === 0) return [];
  
  const allProducts = await storage.getProducts();
  
  return allProducts.filter(product => {
    const productText = `${product.name} ${product.description}`.toLowerCase();
    return keywords.some(keyword => productText.includes(keyword));
  }).map(async product => {
    const category = (await storage.getCategories()).find(c => c.id === product.categoryId);
    return { ...product, category };
  });
}
