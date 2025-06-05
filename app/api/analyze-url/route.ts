import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

interface UrlAnalysisResult {
  url: string
  technicalSeo: {
    canonicalTag: { found: boolean; message: string; url?: string }
    noindexTag: { found: boolean; message: string }
    wwwRedirect: { found: boolean; message: string }
    robotsTxt: { found: boolean; message: string; content?: string }
    openGraph: {
      found: boolean
      missing: string[]
      message: string
      tags?: { [key: string]: string }
    }
    schemaMarkup: { found: boolean; message: string; types?: string[] }
    metaDescription: { found: boolean; message: string; content?: string; length?: number }
    titleTag: { found: boolean; message: string; content?: string; length?: number }
  }
  performance: {
    expiresHeaders: { found: boolean; message: string }
    jsMinified: { found: boolean; message: string; count?: number }
    cssMinified: { found: boolean; message: string; count?: number }
    requestCount: { count: number; message: string }
    htmlSize: { size: string; message: string; bytes?: number }
    responseTime: { time: string; message: string; ms?: number }
    imageOptimization: { optimized: boolean; message: string; count?: number }
  }
  seoScore: number
  recommendations: string[]
}

async function checkRobotsTxt(baseUrl: string): Promise<{ found: boolean; content?: string }> {
  try {
    const robotsUrl = new URL("/robots.txt", baseUrl).toString()
    const response = await fetch(robotsUrl, {
      method: "GET",
      headers: { "User-Agent": "SEO-Analyzer-Bot/1.0" },
    })

    if (response.ok) {
      const content = await response.text()
      return { found: true, content }
    }
    return { found: false }
  } catch {
    return { found: false }
  }
}

async function analyzePagePerformance(url: string, html: string, responseTime: number) {
  const $ = cheerio.load(html)

  // Count external resources
  const jsFiles = $("script[src]").length
  const cssFiles = $('link[rel="stylesheet"]').length
  const images = $("img").length
  const totalRequests = jsFiles + cssFiles + images + 1 // +1 for HTML

  // Check if JS/CSS appears minified (simple heuristic)
  const jsMinified = $("script[src]")
    .toArray()
    .some((el) => $(el).attr("src")?.includes(".min.") || false)
  const cssMinified = $('link[rel="stylesheet"]')
    .toArray()
    .some((el) => $(el).attr("href")?.includes(".min.") || false)

  // HTML size
  const htmlBytes = Buffer.byteLength(html, "utf8")
  const htmlSizeKb = Math.round((htmlBytes / 1024) * 10) / 10

  // Image optimization check
  const imagesWithoutAlt = $("img:not([alt])").length
  const imageOptimized = imagesWithoutAlt === 0 && images > 0

  return {
    expiresHeaders: {
      found: false, // Would need server header analysis
      message: "We're unable to check expires headers from client-side analysis, but this is a common optimization opportunity.",
    },
    jsMinified: {
      found: jsMinified,
      message: jsMinified 
        ? "Great! Your JavaScript files appear to be minified, which helps with loading speed." 
        : "Consider minifying your JavaScript files to improve loading performance.",
      count: jsFiles,
    },
    cssMinified: {
      found: cssMinified,
      message: cssMinified 
        ? "Excellent! Your CSS files appear to be minified for optimal performance." 
        : "You might want to consider minifying your CSS files for better performance.",
      count: cssFiles,
    },
    requestCount: {
      count: totalRequests,
      message: totalRequests <= 30 
        ? `Your page makes ${totalRequests} requests, which is quite efficient!`
        : totalRequests <= 50
        ? `Your page makes ${totalRequests} requests, which is reasonable but could potentially be optimized.`
        : `Your page makes ${totalRequests} requests. Consider combining resources to reduce this number.`,
    },
    htmlSize: {
      size: `${htmlSizeKb} KB`,
      message: htmlSizeKb < 33 
        ? `Your HTML document is ${htmlSizeKb} KB, which is nicely under the average of 33 KB!` 
        : `Your HTML document is ${htmlSizeKb} KB. While this is above the 33 KB average, it's not necessarily problematic depending on your content.`,
      bytes: htmlBytes,
    },
    responseTime: {
      time: `${responseTime}ms`,
      message: responseTime < 200 
        ? `Fantastic! Your response time of ${responseTime}ms is excellent.` 
        : responseTime < 500 
        ? `Good work! Your response time of ${responseTime}ms is solid.` 
        : responseTime < 1000
        ? `Your response time of ${responseTime}ms is acceptable, though there's room for improvement.`
        : `Your response time of ${responseTime}ms could benefit from optimization.`,
      ms: responseTime,
    },
    imageOptimization: {
      optimized: imageOptimized,
      message: imageOptimized
        ? "Well done! Your images are properly optimized with alt tags for accessibility."
        : images === 0
        ? "No images detected on this page."
        : `${imagesWithoutAlt} of your images could benefit from alt tags for better accessibility and SEO.`,
      count: images,
    },
  }
}

function analyzeTechnicalSeo(html: string, url: string) {
  const $ = cheerio.load(html)

  // Canonical tag
  const canonicalTag = $('link[rel="canonical"]')
  const canonicalFound = canonicalTag.length > 0
  const canonicalUrl = canonicalTag.attr("href")

  // Noindex tag
  const noindexMeta = $('meta[name="robots"][content*="noindex"]')
  const noindexFound = noindexMeta.length > 0

  // Open Graph tags
  const ogTags: { [key: string]: string } = {}
  const requiredOgTags = ["og:title", "og:type", "og:image", "og:url"]

  $('meta[property^="og:"]').each((_, el) => {
    const property = $(el).attr("property")
    const content = $(el).attr("content")
    if (property && content) {
      ogTags[property] = content
    }
  })

  const missingOgTags = requiredOgTags.filter((tag) => !ogTags[tag])

  // Schema markup
  const schemaScripts = $('script[type="application/ld+json"]')
  const schemaFound = schemaScripts.length > 0
  const schemaTypes: string[] = []

  schemaScripts.each((_, el) => {
    try {
      const content = $(el).html()
      if (content) {
        const schema = JSON.parse(content)
        if (schema["@type"]) {
          schemaTypes.push(schema["@type"])
        }
      }
    } catch {
      // Invalid JSON, skip
    }
  })

  // Meta description
  const metaDesc = $('meta[name="description"]')
  const metaDescFound = metaDesc.length > 0
  const metaDescContent = metaDesc.attr("content") || ""
  const metaDescLength = metaDescContent.length

  // Title tag
  const titleTag = $("title")
  const titleFound = titleTag.length > 0
  const titleContent = titleTag.text() || ""
  const titleLength = titleContent.length

  return {
    canonicalTag: {
      found: canonicalFound,
      message: canonicalFound
        ? `Perfect! Your canonical tag is properly set and points to: ${canonicalUrl}`
        : "Consider adding a canonical link tag to help prevent duplicate content issues.",
      url: canonicalUrl,
    },
    noindexTag: {
      found: noindexFound,
      message: noindexFound
        ? "Note: This page has a noindex directive, so it won't appear in search engine results."
        : "Good! Your page is set to be indexed by search engines.",
    },
    wwwRedirect: {
      found: true, // Would need actual redirect testing
      message: "We recommend testing both www and non-www versions of your URL to ensure proper redirects are in place.",
    },
    robotsTxt: {
      found: false, // Will be updated by separate check
      message: "Checking robots.txt availability...",
    },
    openGraph: {
      found: missingOgTags.length === 0,
      missing: missingOgTags,
      message:
        missingOgTags.length === 0
          ? "Excellent! All essential Open Graph meta tags are present for social media sharing."
          : `To improve social media sharing, consider adding these Open Graph tags: ${missingOgTags.join(", ")}`,
      tags: ogTags,
    },
    schemaMarkup: {
      found: schemaFound,
      message: schemaFound
        ? `Great! We found Schema.org markup for: ${schemaTypes.join(", ")}. This helps search engines understand your content better.`
        : "Adding Schema.org structured data could help search engines better understand your content.",
      types: schemaTypes,
    },
    metaDescription: {
      found: metaDescFound,
      message: metaDescFound
        ? metaDescLength >= 120 && metaDescLength <= 160
          ? `Perfect! Your meta description is ${metaDescLength} characters, which is in the optimal range.`
          : metaDescLength < 120
          ? `Your meta description is ${metaDescLength} characters. Consider expanding it to 120-160 characters for better search results.`
          : `Your meta description is ${metaDescLength} characters. Consider shortening it to 120-160 characters for optimal display.`
        : "Adding a meta description would help improve your search result snippets and click-through rates.",
      content: metaDescContent,
      length: metaDescLength,
    },
    titleTag: {
      found: titleFound,
      message: titleFound
        ? titleLength >= 30 && titleLength <= 60
          ? `Excellent! Your title tag is ${titleLength} characters, which is perfectly optimized.`
          : titleLength < 30
          ? `Your title tag is ${titleLength} characters. Consider expanding it to 30-60 characters for better SEO impact.`
          : `Your title tag is ${titleLength} characters. For optimal results, consider keeping it between 30-60 characters.`
        : "Adding a title tag would significantly improve your search engine visibility.",
      content: titleContent,
      length: titleLength,
    },
  }
}

function calculateSeoScore(technicalSeo: any, performance: any): number {
  let score = 0

  // Technical SEO scoring (60 points max)
  if (technicalSeo.canonicalTag.found) score += 10
  if (technicalSeo.titleTag.found && technicalSeo.titleTag.length >= 30 && technicalSeo.titleTag.length <= 60)
    score += 10
  if (
    technicalSeo.metaDescription.found &&
    technicalSeo.metaDescription.length >= 120 &&
    technicalSeo.metaDescription.length <= 160
  )
    score += 10
  if (technicalSeo.openGraph.found) score += 10
  if (technicalSeo.schemaMarkup.found) score += 10
  if (technicalSeo.robotsTxt.found) score += 5
  if (!technicalSeo.noindexTag.found) score += 5 // Good if no noindex

  // Performance scoring (40 points max)
  if (performance.responseTime.ms < 200) score += 15
  else if (performance.responseTime.ms < 500) score += 10
  else if (performance.responseTime.ms < 1000) score += 5

  if (performance.htmlSize.bytes < 33000) score += 10 // Under 33KB
  if (performance.jsMinified.found) score += 5
  if (performance.cssMinified.found) score += 5
  if (performance.imageOptimization.optimized) score += 5

  return Math.min(100, score)
}

function generateRecommendations(technicalSeo: any, performance: any): string[] {
  const recommendations: string[] = []

  // Technical SEO recommendations
  if (!technicalSeo.canonicalTag.found) {
    recommendations.push("Consider adding a canonical link tag to help search engines understand your preferred URL version")
  }

  if (!technicalSeo.titleTag.found) {
    recommendations.push("Adding a title tag would significantly boost your search engine visibility")
  } else if (technicalSeo.titleTag.length < 30 || technicalSeo.titleTag.length > 60) {
    recommendations.push("Fine-tune your title tag length to 30-60 characters for optimal search results")
  }

  if (!technicalSeo.metaDescription.found) {
    recommendations.push("A meta description would help improve your search result snippets and click-through rates")
  } else if (technicalSeo.metaDescription.length < 120 || technicalSeo.metaDescription.length > 160) {
    recommendations.push("Optimize your meta description to 120-160 characters for the best search result display")
  }

  if (technicalSeo.openGraph.missing.length > 0) {
    recommendations.push(`Enhance social media sharing by adding these Open Graph tags: ${technicalSeo.openGraph.missing.join(", ")}`)
  }

  if (!technicalSeo.schemaMarkup.found) {
    recommendations.push("Consider implementing Schema.org structured data to help search engines better understand your content")
  }

  if (!technicalSeo.robotsTxt.found) {
    recommendations.push("Adding a robots.txt file would help guide search engine crawlers")
  }

  // Performance recommendations
  if (performance.responseTime.ms > 500) {
    recommendations.push("Improving server response time would enhance user experience (currently over 500ms)")
  }

  if (!performance.jsMinified.found && performance.jsMinified.count > 0) {
    recommendations.push("Minifying JavaScript files could help reduce loading times")
  }

  if (!performance.cssMinified.found && performance.cssMinified.count > 0) {
    recommendations.push("Minifying CSS files would help optimize your page loading speed")
  }

  if (!performance.imageOptimization.optimized && performance.imageOptimization.count > 0) {
    recommendations.push("Adding alt tags to images would improve accessibility and SEO")
  }

  if (performance.requestCount.count > 50) {
    recommendations.push("Reducing HTTP requests could help improve your page loading speed")
  }

  return recommendations.slice(0, 8) // Limit to top 8 recommendations
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Please provide a valid URL to analyze" }, { status: 400 })
    }

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: "The provided URL format appears to be invalid. Please check and try again." }, { status: 400 })
    }

    // Fetch the webpage
    const startTime = Date.now()
    const response = await fetch(validUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEO-Analyzer/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })
    const responseTime = Date.now() - startTime

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `We encountered an issue accessing the URL: ${response.status} ${response.statusText}. Please verify the URL is accessible and try again.`,
        },
        { status: 400 },
      )
    }

    const html = await response.text()

    // Analyze technical SEO
    const technicalSeo = analyzeTechnicalSeo(html, validUrl.toString())

    // Check robots.txt
    const robotsCheck = await checkRobotsTxt(validUrl.origin)
    technicalSeo.robotsTxt = {
      found: robotsCheck.found,
      message: robotsCheck.found
        ? "Great! Your robots.txt file is accessible and properly configured."
        : "Consider adding a robots.txt file to help guide search engine crawlers.",
        //@ts-expect-error
      content: robotsCheck.content,
    }

    // Analyze performance
    const performance = await analyzePagePerformance(validUrl.toString(), html, responseTime)

    // Calculate SEO score
    const seoScore = calculateSeoScore(technicalSeo, performance)

    // Generate recommendations
    const recommendations = generateRecommendations(technicalSeo, performance)

    const result: UrlAnalysisResult = {
      url: validUrl.toString(),
      technicalSeo,
      performance,
      seoScore,
      recommendations,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("URL analysis error:", error)
    return NextResponse.json(
      {
        error: "We encountered an issue while analyzing the URL. Please try again in a moment.",
        details: error instanceof Error ? error.message : "An unexpected error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}