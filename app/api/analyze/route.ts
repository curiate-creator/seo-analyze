import { type NextRequest, NextResponse } from "next/server"

// Enhanced types for better type safety
interface TextRazorEntity {
  matchedText: string
  type?: string[]
  freebaseTypes?: string[]
  dbpediaTypes?: string[]
  relevanceScore: number
  confidenceScore: number
  startingPos: number
  endingPos: number
}

interface TextRazorWord {
  token: string
  lemma: string
  partOfSpeech: string
  startingPos: number
  endingPos: number
}

interface TextRazorSentence {
  words: TextRazorWord[]
}

interface TextRazorTopic {
  id: string
  label: string
  score: number
  wikiLink?: string
}

interface TextRazorSentiment {
  score: number
  label: string
  confidence: number
}

interface TextRazorResponse {
  entities?: TextRazorEntity[]
  topics?: TextRazorTopic[]
  sentences?: TextRazorSentence[]
  sentiment?: TextRazorSentiment
}

// Enhanced stop words list
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'would', 'you', 'your', 'this', 'they', 'them', 'their',
  'have', 'had', 'has', 'having', 'do', 'does', 'did', 'doing', 'can', 'could',
  'should', 'would', 'may', 'might', 'must', 'shall', 'will', 'am', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'me', 'my', 'myself', 'we', 'our',
  'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he',
  'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its',
  'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
  'who', 'whom', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself',
  'we', 'our', 'ours', 'ourselves'
])

// Flesch-Kincaid
function calculateReadabilityScores(text: string, avgWordsPerSentence: number): {
  fleschScore: number
  fleschGrade: number
  readabilityLevel: string
} {
  // Approximate syllable counting
  const syllableCount = (text.match(/[aeiouyAEIOUY]+/g) || []).length
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
  const avgSyllablesPerWord = syllableCount / Math.max(wordCount, 1)
  
  // Flesch Reading Ease
  const fleschScore = Math.max(0, Math.min(100, 
    206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  ))
  
  // Flesch-Kincaid Grade Level
  const fleschGrade = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59
  
  // Readability level
  let readabilityLevel = 'Very Difficult'
  if (fleschScore >= 90) readabilityLevel = 'Very Easy'
  else if (fleschScore >= 80) readabilityLevel = 'Easy'
  else if (fleschScore >= 70) readabilityLevel = 'Fairly Easy'
  else if (fleschScore >= 60) readabilityLevel = 'Standard'
  else if (fleschScore >= 50) readabilityLevel = 'Fairly Difficult'
  else if (fleschScore >= 30) readabilityLevel = 'Difficult'
  
  return {
    fleschScore: Math.round(fleschScore),
    fleschGrade: Math.round(fleschGrade * 10) / 10,
    readabilityLevel
  }
}

//  keyword extraction
function extractKeywords(text: string, entities: TextRazorEntity[], words: TextRazorWord[]) {
  const wordFreq: { [key: string]: number } = {}
  const keywordSet = new Set<string>()
  const formattedKeywords: Array<{
    text: string
    relevanceScore: number
    confidence: number
    frequency: number
    positions: number[]
    type: 'entity' | 'noun' | 'adjective' | 'frequent'
  }> = []

  // Clean and normalize text for analysis
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ')
  const allWords = cleanText.match(/\b[a-z]+\b/g) || []
  
  // Build word frequency map
  allWords.forEach((word, index) => {
    if (word.length > 3 && !STOP_WORDS.has(word)) {
      if (!wordFreq[word]) {
        wordFreq[word] = 0
      }
      wordFreq[word]++
    }
  })

  // Add entities as high-priority keywords
  entities.forEach((entity) => {
    if (entity.matchedText && entity.matchedText.length > 2) {
      const normalizedText = entity.matchedText.toLowerCase()
      const freq = wordFreq[normalizedText] || 1
      
      if (!keywordSet.has(normalizedText)) {
        keywordSet.add(normalizedText)
        formattedKeywords.push({
          text: entity.matchedText,
          relevanceScore: entity.relevanceScore || 0.8,
          confidence: entity.confidenceScore || 0.8,
          frequency: freq,
          positions: [entity.startingPos],
          type: 'entity'
        })
      }
    }
  })

  // Add important words (nouns, adjectives) from TextRazor analysis
  words.forEach((word) => {
    if (word.lemma && word.lemma.length > 3 && !keywordSet.has(word.lemma.toLowerCase())) {
      const freq = wordFreq[word.lemma.toLowerCase()] || 1
      
      if (word.partOfSpeech?.includes('NN')) { // Nouns
        keywordSet.add(word.lemma.toLowerCase())
        formattedKeywords.push({
          text: word.lemma,
          relevanceScore: 0.6,
          confidence: 0.6,
          frequency: freq,
          positions: [word.startingPos],
          type: 'noun'
        })
      } else if (word.partOfSpeech?.includes('JJ')) { // Adjectives
        keywordSet.add(word.lemma.toLowerCase())
        formattedKeywords.push({
          text: word.lemma,
          relevanceScore: 0.5,
          confidence: 0.5,
          frequency: freq,
          positions: [word.startingPos],
          type: 'adjective'
        })
      }
    }
  })

  // Add high-frequency words as keywords if we need more
  if (formattedKeywords.length < 8) {
    Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .forEach(([word, freq]) => {
        if (!keywordSet.has(word) && freq > 2) {
          keywordSet.add(word)
          formattedKeywords.push({
            text: word,
            relevanceScore: Math.min(0.7, (freq / allWords.length) * 20),
            confidence: 0.5,
            frequency: freq,
            positions: [],
            type: 'frequent'
          })
        }
      })
  }

  return formattedKeywords
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 20)
}

// Enhanced SEO scoring
function calculateSEOScore(
  wordCount: number,
  sentenceCount: number,
  paragraphCount: number,
  avgWordsPerSentence: number,
  readabilityScore: number,
  keywordCount: number,
  headingCount: number,
  listCount: number,
  linkCount: number,
  imageCount: number,
  keywordDensity: number,
  sentimentScore: number
) {
  let score = 0
  const breakdown: { [key: string]: { score: number; maxScore: number; reason: string } } = {}

  // Content Length (0-20 points)
  let lengthScore = 0
  if (wordCount >= 300) lengthScore += 8
  if (wordCount >= 600) lengthScore += 6
  if (wordCount >= 1200) lengthScore += 6
  score += lengthScore
  breakdown['Content Length'] = {
    score: lengthScore,
    maxScore: 20,
    reason: `${wordCount} words (300+ recommended for SEO)`
  }

  // Readability (0-20 points)
  let readabilityPoints = 0
  if (readabilityScore >= 40) readabilityPoints += 10
  if (readabilityScore >= 60) readabilityPoints += 10
  score += readabilityPoints
  breakdown['Readability'] = {
    score: readabilityPoints,
    maxScore: 20,
    reason: `Flesch score: ${readabilityScore} (60+ is ideal)`
  }

  // Sentence Structure (0-15 points)
  let structureScore = 0
  if (avgWordsPerSentence <= 20) structureScore += 8
  if (avgWordsPerSentence <= 15) structureScore += 4
  if (sentenceCount >= 5) structureScore += 3
  score += structureScore
  breakdown['Sentence Structure'] = {
    score: structureScore,
    maxScore: 15,
    reason: `Avg ${avgWordsPerSentence.toFixed(1)} words/sentence (15-20 ideal)`
  }

  // Content Organization (0-20 points)
  let orgScore = 0
  if (paragraphCount > 2) orgScore += 5
  if (headingCount > 0) orgScore += 10
  if (listCount > 0) orgScore += 3
  if (paragraphCount > 5) orgScore += 2
  score += orgScore
  breakdown['Content Organization'] = {
    score: orgScore,
    maxScore: 20,
    reason: `${headingCount} headings, ${listCount} lists, ${paragraphCount} paragraphs`
  }

  // Keyword Usage (0-15 points)
  let keywordScore = 0
  if (keywordCount >= 5) keywordScore += 5
  if (keywordDensity >= 1 && keywordDensity <= 3) keywordScore += 8
  else if (keywordDensity > 0.5 && keywordDensity < 5) keywordScore += 5
  if (keywordCount >= 10) keywordScore += 2
  score += keywordScore
  breakdown['Keyword Usage'] = {
    score: keywordScore,
    maxScore: 15,
    reason: `${keywordCount} keywords, ${keywordDensity.toFixed(1)}% density (1-3% ideal)`
  }

  // Multimedia & Links (0-10 points)
  let mediaScore = 0
  if (linkCount > 0) mediaScore += 3
  if (imageCount > 0) mediaScore += 4
  if (linkCount > 2) mediaScore += 2
  if (imageCount > 1) mediaScore += 1
  score += mediaScore
  breakdown['Multimedia & Links'] = {
    score: mediaScore,
    maxScore: 10,
    reason: `${linkCount} links, ${imageCount} images`
  }

  // Content Quality Indicators (0-10 points)
  let qualityScore = 0
  if (sentimentScore > -0.2 && sentimentScore < 0.8) qualityScore += 3 // Neutral to positive
  if (wordCount > 500 && avgWordsPerSentence < 25) qualityScore += 4 // Good depth + readability
  if (keywordCount > 8 && keywordDensity < 4) qualityScore += 3 // Good keyword variety without stuffing
  score += qualityScore
  breakdown['Content Quality'] = {
    score: qualityScore,
    maxScore: 10,
    reason: 'Based on sentiment, depth, and keyword balance'
  }

  return {
    totalScore: Math.min(100, Math.round(score)),
    breakdown,
    grade: score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetKeyword, url } = await request.json()

    // Enhanced input validation
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }

    if (text.length < 10) {
      return NextResponse.json({ error: "Text must be at least 10 characters long" }, { status: 400 })
    }

    if (text.length > 50000) {
      return NextResponse.json({ error: "Text is too long (max 50,000 characters)" }, { status: 400 })
    }

    const apiKey = process.env.TEXTRAZOR_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "TextRazor API key not configured" }, { status: 500 })
    }

    // Enhanced TextRazor API call with retry logic
    let textRazorResponse
    let retryCount = 0
    const maxRetries = 2

    while (retryCount <= maxRetries) {
      try {
        const response = await fetch("https://api.textrazor.com/", {
          method: "POST",
          headers: {
            "X-TextRazor-Key": apiKey,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            text: text,
            extractors: "entities,topics,words,phrases,dependency-trees,sentiment,relations",
            "entities.filterDbpediaTypes": "Person,Place,Organisation,Company,Work,Event",
            "topics.filterDbpediaTypes": "Person,Place,Organisation,Company,Work,Event",
            cleanup: "true",
            "cleanup.mode": "cleanHTML",
            "cleanup.returnCleaned": "false",
            "entities.enrichmentQueries": "dbpedia_types,freebase_types",
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`TextRazor API error (attempt ${retryCount + 1}):`, response.status, errorText)
          
          if (response.status === 429 && retryCount < maxRetries) {
            // Rate limited, wait and retry
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
            retryCount++
            continue
          }
          
          throw new Error(`TextRazor API error: ${response.status} - ${errorText}`)
        }

        textRazorResponse = await response.json()
        break
      } catch (error) {
        if (retryCount === maxRetries) {
          throw error
        }
        retryCount++
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log("TextRazor response received:", !!textRazorResponse?.response)

    // Safely extract data from TextRazor response
    const entities: TextRazorEntity[] = textRazorResponse?.response?.entities || []
    const topics: TextRazorTopic[] = textRazorResponse?.response?.topics || []
    const sentences: TextRazorSentence[] = textRazorResponse?.response?.sentences || []
    const words: TextRazorWord[] = sentences.flatMap(s => s.words || [])
    const sentiment: TextRazorSentiment = textRazorResponse?.response?.sentiment || { 
      score: 0, 
      label: "neutral", 
      confidence: 0.5 
    }

    // Enhanced content analysis
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    const cleanText = text.replace(/\s+/g, ' ').trim()
    const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length
    const sentenceCount = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length
    const paragraphCount = Math.max(paragraphs.length, 1)

    // Advanced metrics
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1)
    const avgSentencesPerParagraph = sentenceCount / Math.max(paragraphCount, 1)

    // Content structure analysis
    const headingCount = (text.match(/^#{1,6}\s/gm) || []).length + 
                        (text.match(/<h[1-6][^>]*>/gi) || []).length
    const listCount = (text.match(/^\s*[-*+]\s/gm) || []).length + 
                     (text.match(/<[uo]l[^>]*>/gi) || []).length
    const linkCount = (text.match(/\[.*?\]\(.*?\)/g) || []).length + 
                     (text.match(/<a\s[^>]*>/gi) || []).length
    const imageCount = (text.match(/!\[.*?\]\(.*?\)/g) || []).length + 
                      (text.match(/<img\s[^>]*>/gi) || []).length

    // Enhanced readability calculation
    const readabilityMetrics = calculateReadabilityScores(text, avgWordsPerSentence)

    // Enhanced keyword extraction
    const keywords = extractKeywords(text, entities, words)

    // Keyword density analysis
    const allWords = cleanText.toLowerCase().match(/\b[a-z]+\b/g) || []
    const topKeywordDensity = keywords.length > 0 ? 
      (keywords[0].frequency / allWords.length) * 100 : 0

    const keywordDensity = keywords.slice(0, 10).map(keyword => ({
      keyword: keyword.text,
      density: (keyword.frequency / allWords.length) * 100,
      count: keyword.frequency,
      type: keyword.type
    }))

    // Enhanced title and meta description suggestions
    const topKeywords = keywords.slice(0, 5).map(k => k.text)
    const titleSuggestions = [
      `${topKeywords[0] || 'Complete'} Guide: ${topKeywords[1] || 'Everything You Need to Know'}`,
      `How to Master ${topKeywords[0] || 'Your Topic'} in ${new Date().getFullYear()}`,
      `${topKeywords[0] || 'Essential'} Tips for ${topKeywords[1] || 'Success'} | Expert Guide`,
      `The Ultimate ${topKeywords[0] || 'Resource'} for ${topKeywords[1] || 'Professionals'}`,
      `${topKeywords[0] || 'Advanced'} Strategies for ${topKeywords[1] || 'Growth'}`
    ]

    // Better meta description generation
    const firstSentences = text.split(/[.!?]/).slice(0, 3).join('. ').trim()
    let metaDescription = firstSentences.length > 160 
      ? firstSentences.substring(0, 157) + "..."
      : firstSentences

    if (metaDescription.length < 120 && topKeywords.length > 0) {
      metaDescription += ` Learn about ${topKeywords.slice(0, 2).join(' and ')}.`
    }

    // Enhanced SEO scoring
    const seoScore = calculateSEOScore(
      wordCount,
      sentenceCount,
      paragraphCount,
      avgWordsPerSentence,
      readabilityMetrics.fleschScore,
      keywords.length,
      headingCount,
      listCount,
      linkCount,
      imageCount,
      topKeywordDensity,
      sentiment.score
    )

    // Target keyword analysis (if provided)
    let targetKeywordAnalysis = null
    if (targetKeyword) {
      const keywordRegex = new RegExp(targetKeyword.toLowerCase(), 'gi')
      const keywordMatches = text.match(keywordRegex) || []
      const keywordDensityPercent = (keywordMatches.length / wordCount) * 100
      
      targetKeywordAnalysis = {
        keyword: targetKeyword,
        frequency: keywordMatches.length,
        density: Math.round(keywordDensityPercent * 100) / 100,
        inTitle: text.toLowerCase().includes(targetKeyword.toLowerCase()),
        firstParagraph: paragraphs[0]?.toLowerCase().includes(targetKeyword.toLowerCase()) || false,
        distribution: keywordMatches.length / Math.max(paragraphCount, 1)
      }
    }

    // Compile final results
    const result = {
      // Basic metrics
      wordCount,
      sentenceCount,
      paragraphCount,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSentencesPerParagraph: Math.round(avgSentencesPerParagraph * 10) / 10,

      // Readability
      readability: readabilityMetrics,

      // Keywords and topics
      keywords: keywords.slice(0, 15),
      keywordDensity,
      targetKeywordAnalysis,

      // Entities and topics from TextRazor
      entities: entities.slice(0, 10).map(entity => ({
        text: entity.matchedText || "Unknown",
        type: entity.dbpediaTypes?.[0] || entity.freebaseTypes?.[0] || entity.type?.[0] || "Unknown",
        relevanceScore: Math.round((entity.relevanceScore || 0) * 100) / 100,
        confidence: Math.round((entity.confidenceScore || 0) * 100) / 100
      })),

      topics: topics.slice(0, 10).map(topic => ({
        label: topic.label || topic.id || "Unknown Topic",
        score: Math.round((topic.score || 0) * 100) / 100,
        wikiLink: topic.wikiLink
      })),

      // Sentiment analysis
      sentiment: {
        score: Math.round((sentiment.score || 0) * 100) / 100,
        label: sentiment.label || "neutral",
        confidence: Math.round((sentiment.confidence || 0) * 100) / 100
      },

      // Content structure
      contentStructure: {
        hasHeadings: headingCount > 0,
        headingCount,
        listCount,
        linkCount,
        imageCount,
        hasParagraphs: paragraphCount > 1
      },

      // SEO recommendations
      seoAnalysis: {
        score: seoScore.totalScore,
        grade: seoScore.grade,
        breakdown: seoScore.breakdown,
        titleSuggestions,
        metaDescriptionSuggestion: metaDescription,
        recommendations: generateRecommendations(seoScore.breakdown, wordCount, readabilityMetrics.fleschScore, keywords.length)
      },

      // Technical details
      processingInfo: {
        textrazorEntities: entities.length,
        textrazorTopics: topics.length,
        textrazorWords: words.length,
        processingTime: Date.now()
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze text",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Helper function to generate actionable recommendations
function generateRecommendations(
  breakdown: { [key: string]: { score: number; maxScore: number; reason: string } },
  wordCount: number,
  readabilityScore: number,
  keywordCount: number
): string[] {
  const recommendations: string[] = []

  // Content length recommendations
  if (wordCount < 300) {
    recommendations.push("Add more content - aim for at least 300 words for better SEO performance")
  } else if (wordCount < 600) {
    recommendations.push("Consider expanding your content to 600+ words for improved search rankings")
  }

  // Readability recommendations
  if (readabilityScore < 40) {
    recommendations.push("Improve readability by using shorter sentences and simpler words")
  } else if (readabilityScore < 60) {
    recommendations.push("Good readability, but could be improved with shorter paragraphs and clearer language")
  }

  // Structure recommendations
  if (breakdown['Content Organization']?.score < 15) {
    recommendations.push("Add more headings (H1, H2, H3) to better structure your content")
    recommendations.push("Use bullet points or numbered lists to break up text")
  }

  // Keyword recommendations
  if (keywordCount < 5) {
    recommendations.push("Include more relevant keywords naturally throughout your content")
  }

  // Add positive reinforcement
  if (breakdown['Readability']?.score >= 15) {
    recommendations.push("✓ Excellent readability - your content is easy to understand")
  }

  if (breakdown['Content Organization']?.score >= 15) {
    recommendations.push("✓ Good content structure with proper headings and formatting")
  }

  return recommendations.slice(0, 6) // Limit to top 6 recommendations
}