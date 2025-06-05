import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { text, targetKeyword, optimizationType, email} = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }
    
    if ( email != process.env.ACCEPTED_EMAIL){ 
      return NextResponse.json({ error: "Invalid email provided" }, { status: 400 })

    }
    

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    let prompt = ""
    const systemPrompt = "You are an expert SEO content optimizer. Provide actionable, specific recommendations."

    switch (optimizationType) {
      case "keywords":
        prompt = `Analyze this content and suggest 10-15 high-value SEO keywords that should be naturally integrated. Focus on long-tail keywords and semantic variations.

Content: "${text}"
${targetKeyword ? `Target keyword: "${targetKeyword}"` : ""}

Provide keywords in this format:
- Primary keywords (3-5): [list]
- Long-tail keywords (5-7): [list]  
- Semantic variations (3-5): [list]

Also suggest where each keyword type should be placed (title, headings, body, meta description).`
        break

      case "content":
        prompt = `Optimize this content for SEO while maintaining readability and value. Focus on:
1. Natural keyword integration
2. Improved structure with headings
3. Better readability
4. Enhanced user engagement

Original content: "${text}"
${targetKeyword ? `Target keyword: "${targetKeyword}"` : ""}

Provide the optimized version with clear improvements marked.`
        break

      case "meta":
        prompt = `Create SEO-optimized meta elements for this content:

Content: "${text}"
${targetKeyword ? `Target keyword: "${targetKeyword}"` : ""}

Provide:
1. 3 compelling title options (50-60 characters)
2. 2 meta descriptions (150-160 characters)
3. 5-8 relevant meta keywords
4. Suggested URL slug
5. Open Graph title and description`
        break

      case "structure":
        prompt = `Analyze and improve the content structure for better SEO:

Content: "${text}"

Provide:
1. Suggested heading hierarchy (H1, H2, H3)
2. Content sections that should be added
3. Internal linking opportunities
4. Call-to-action placements
5. FAQ section suggestions
6. Schema markup recommendations`
        break

      default:
        prompt = `Provide comprehensive SEO optimization suggestions for this content:

Content: "${text}"
${targetKeyword ? `Target keyword: "${targetKeyword}"` : ""}

Include:
1. Keyword optimization opportunities
2. Content structure improvements  
3. Readability enhancements
4. Meta tag suggestions
5. Technical SEO recommendations`
    }

    const { text: aiResponse } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: prompt,
      maxTokens: 1500,
      temperature: 0.7,
    })

    return NextResponse.json({
      optimization: aiResponse,
      type: optimizationType,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("AI optimization error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate AI optimization",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
