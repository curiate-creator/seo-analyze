# Text Analysis API Code Explaination


## Endpoint

**POST** `/api/analyze` 

## Features

### Core Analysis Capabilities
* **Content Metrics**: Word count, sentence count, paragraph analysis
* **Readability Assessment**: Flesch Reading Ease and Flesch-Kincaid Grade Level
* **SEO Scoring**: Comprehensive 100-point SEO analysis with detailed breakdown
* **Keyword Extraction**: Intelligent keyword identification with relevance scoring
* **Entity Recognition**: Named entity extraction and classification
* **Topic Analysis**: Automatic topic detection and relevance scoring
* **Sentiment Analysis**: Content sentiment evaluation with confidence scores
* **Content Structure**: Analysis of headings, lists, links, and multimedia elements

### TextRazor Integration
* Advanced natural language processing
* Entity extraction with DBpedia and Freebase type mapping
* Dependency parsing and grammatical analysis
* Topic modeling and classification
* Automatic retry logic with rate limiting handling

## Request Format

### Required Parameters
```json
{
  "text": "string (required, 10-50,000 characters)"
}
```

### Optional Parameters
```json
{
  "targetKeyword": "string (optional)",
  "url": "string (optional, for future use)"
}
```

### Example Request
```json
{
  "text": "Your content here...",
  "targetKeyword": "SEO optimization"
}
```

## Response Format

The API returns a comprehensive analysis object with the following structure:

### Basic Metrics
```json
{
  "wordCount": 1250,
  "sentenceCount": 68,
  "paragraphCount": 12,
  "avgWordsPerSentence": 18.4,
  "avgSentencesPerParagraph": 5.7
}
```

### Readability Analysis
```json
{
  "readability": {
    "fleschScore": 72,
    "fleschGrade": 8.2,
    "readabilityLevel": "Fairly Easy"
  }
}
```

### Keyword Analysis
```json
{
  "keywords": [
    {
      "text": "content optimization",
      "relevanceScore": 0.95,
      "confidence": 0.87,
      "frequency": 8,
      "positions": [45, 156, 234],
      "type": "entity"
    }
  ],
  "keywordDensity": [
    {
      "keyword": "SEO",
      "density": 2.3,
      "count": 12,
      "type": "entity"
    }
  ]
}
```

### Entity Recognition
```json
{
  "entities": [
    {
      "text": "Google",
      "type": "Company",
      "relevanceScore": 0.92,
      "confidence": 0.89
    }
  ]
}
```

### Topic Analysis
```json
{
  "topics": [
    {
      "label": "Search Engine Optimization",
      "score": 0.87,
      "wikiLink": "https://en.wikipedia.org/wiki/Search_engine_optimization"
    }
  ]
}
```

### Sentiment Analysis
```json
{
  "sentiment": {
    "score": 0.15,
    "label": "positive",
    "confidence": 0.78
  }
}
```

### Content Structure
```json
{
  "contentStructure": {
    "hasHeadings": true,
    "headingCount": 6,
    "listCount": 3,
    "linkCount": 8,
    "imageCount": 2,
    "hasParagraphs": true
  }
}
```

### SEO Analysis
```json
{
  "seoAnalysis": {
    "score": 85,
    "grade": "A",
    "breakdown": {
      "Content Length": {
        "score": 18,
        "maxScore": 20,
        "reason": "1250 words (300+ recommended for SEO)"
      }
    },
    "titleSuggestions": [
      "Complete SEO Guide: Everything You Need to Know",
      "How to Master Content Marketing in 2025"
    ],
    "metaDescriptionSuggestion": "Learn advanced SEO techniques...",
    "recommendations": [
      "✓ Excellent readability for your target audience",
      "Add more internal links to improve navigation"
    ]
  }
}
```

### Target Keyword Analysis (when provided)
```json
{
  "targetKeywordAnalysis": {
    "keyword": "SEO optimization",
    "frequency": 12,
    "density": 0.96,
    "inTitle": true,
    "firstParagraph": true,
    "distribution": 1.0
  }
}
```

## SEO Scoring System

The API uses a comprehensive 100-point SEO scoring system across six categories:

### Scoring Categories
1. **Content Length** (0-20 points)
   * 300+ words: 8 points
   * 600+ words: +6 points
   * 1200+ words: +6 points

2. **Readability** (0-20 points)
   * Flesch score 40+: 10 points
   * Flesch score 60+: +10 points

3. **Sentence Structure** (0-15 points)
   * ≤20 words per sentence: 8 points
   * ≤15 words per sentence: +4 points
   * 5+ sentences: +3 points

4. **Content Organization** (0-20 points)
   * Multiple paragraphs: 5 points
   * Headings present: 10 points
   * Lists present: 3 points
   * 5+ paragraphs: +2 points

5. **Keyword Usage** (0-15 points)
   * 5+ keywords: 5 points
   * 1-3% keyword density: 8 points
   * 10+ keywords: +2 points

6. **Multimedia & Links** (0-10 points)
   * Links present: 3 points
   * Images present: 4 points
   * Multiple links/images: bonus points

### Grade Scale
* **A**: 80-100 points (Excellent)
* **B**: 70-79 points (Good)
* **C**: 60-69 points (Average)
* **D**: 50-59 points (Needs Improvement)
* **F**: <50 points (Poor)

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Text content is required"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to analyze text",
  "details": "TextRazor API error: 429 - Rate limit exceeded",
  "timestamp": "2025-06-06T10:30:00.000Z"
}
```

### Input Validation
* Text must be 10-50,000 characters
* Text content is required and must be a string
* API automatically handles HTML cleanup and text normalization

## Configuration

### Required Environment Variables
```env
TEXTRAZOR_API_KEY=your_textrazor_api_key_here
```

### TextRazor API Settings
* **Extractors**: entities, topics, words, phrases, dependency-trees, sentiment, relations
* **Entity Filtering**: Person, Place, Organisation, Company, Work, Event
* **Cleanup Mode**: cleanHTML enabled
* **Enrichment**: DBpedia and Freebase type mapping

## Rate Limiting and Reliability

### Built-in Retry Logic
* Automatic retry on rate limit (HTTP 429)
* Maximum 2 retries with exponential backoff
* 1-second base delay between retries

### Performance Considerations
* Average processing time: 2-5 seconds
* Maximum text length: 50,000 characters
* Concurrent request handling supported



### Frontend Integration
```javascript
const analyzeText = async (content) => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: content,
      targetKeyword: 'your keyword'
    })
  });

  return await response.json();
};
```

### Batch Processing
```javascript
const analyzeBatch = async (articles) => {
  const results = await Promise.all(
    articles.map(article => 
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: article.content })
      }).then(res => res.json())
    )
  );
  return results;
};
```

## Technical Implementation

### Key Components
* **Stop Words Filtering**: 150+ common words excluded from analysis
* **Syllable Counting**: Vowel-based approximation for readability
* **Keyword Extraction**: Multi-source approach (entities, POS tagging, frequency)
* **Content Structure Detection**: Markdown and HTML parsing
* **Sentiment Normalization**: Score range -1 to +1

### Performance Optimizations
* Response data limiting (top 10-15 results per category)
* Efficient text processing with regex optimization
* Memory-conscious array operations
* Structured error handling with detailed logging

## Limitations

### TextRazor API Constraints
* Rate limiting applies based on your TextRazor plan
* Language support depends on TextRazor capabilities
* Entity recognition accuracy varies by domain

### Content Restrictions
* Maximum 50,000 characters per request
* Minimum 10 characters required
* HTML content is automatically cleaned

### Accuracy Considerations
* Readability scores are approximations
* Keyword relevance based on frequency and position
* SEO scoring reflects general best practices
