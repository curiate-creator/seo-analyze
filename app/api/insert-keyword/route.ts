import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, keyword } = await request.json()

    if (!text || !keyword) {
      return NextResponse.json({ error: "Text and keyword are required" }, { status: 400 })
    }

    // Smart keyword insertion logic
    const sentences = text.split(/(?<=[.!?])\s+/)
    let updatedText = text

    // Check if keyword already exists in the text
    const keywordLower = keyword.toLowerCase()
    const textLower = text.toLowerCase()

    if (!textLower.includes(keywordLower)) {
      // Find the best position to insert the keyword
      // Strategy: Insert in the middle of the text for better flow
      const middleIndex = Math.floor(sentences.length / 2)

      if (sentences.length > 1) {
        // Insert keyword naturally into a sentence
        const targetSentence = sentences[middleIndex]

        // Simple insertion: add keyword with context
        const insertionPhrases = [
          `This relates to ${keyword}, which`,
          `When considering ${keyword},`,
          `The concept of ${keyword}`,
          `In terms of ${keyword},`,
        ]

        const randomPhrase = insertionPhrases[Math.floor(Math.random() * insertionPhrases.length)]

        // Insert the phrase at the beginning of the target sentence
        sentences[middleIndex] = `${randomPhrase} ${targetSentence.toLowerCase()}`

        updatedText = sentences.join(" ")
      } else {
        // If there's only one sentence, append the keyword
        updatedText = `${text} This is related to ${keyword}.`
      }
    } else {
      // If keyword already exists, highlight it by capitalizing
      updatedText = text.replace(new RegExp(keyword, "gi"), (match : any) => `**${match}**`)
    }

    return NextResponse.json({ updatedText })
  } catch (error) {
    console.error("Keyword insertion error:", error)
    return NextResponse.json({ error: "Failed to insert keyword" }, { status: 500 })
  }
}
