"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Zap,
  Target,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Sparkles,
  Edit3,
  Eye,
} from "lucide-react";
import { verifyEmail } from "./Actions/verifyEmail";

const SEOAnalyzer = () => {
  const [content, setContent] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  interface Analysis {
    seoAnalysis: {
      score: number;
      grade: string;
      breakdown: Record<
        string,
        { score: number; maxScore: number; reason: string }
      >;
      recommendations: string[];
    };
    keywords: Array<{
      text: string;
      relevanceScore: number;
      frequency: number;
      type: string;
    }>;
    entities: Array<{
      text: string;
      type: string;
      relevanceScore: number;
    }>;
    wordCount: number;
    readability: {
      fleschScore: number;
      readabilityLevel: string;
    };
    targetKeywordAnalysis: {
      keyword: string;
      frequency: number;
      density: number;
      inTitle: boolean;
      firstParagraph: boolean;
    } | null;
  }

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [optimization, setOptimization] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState("analyze");
  const [selectedKeywords, setSelectedKeywords] = useState(new Set<string>());
  const [optimizationType, setOptimizationType] = useState("comprehensive");
  const [urlToAnalyze, setUrlToAnalyze] = useState("");
  const [urlAnalysis, setUrlAnalysis] = useState<any>(null);
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(userEmail);

  // Sample content for demo
  const sampleContent = `Artificial Intelligence is transforming the way businesses operate in the digital age. Machine learning algorithms are becoming increasingly sophisticated, enabling companies to automate complex processes and make data-driven decisions.

AI applications span across various industries, from healthcare to finance, revolutionizing traditional workflows. Deep learning models can now process vast amounts of data, identifying patterns that humans might miss.

The future of AI looks promising, with advancements in natural language processing and computer vision opening new possibilities for innovation.`;

  const analyzeContent = async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    try {
      // Simulate API call to your analysis endpoint
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, targetKeyword }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysis(result);
        setActiveTab("results");
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      // Demo data for visualization
      setAnalysis({
        seoAnalysis: {
          score: 72,
          grade: "B",
          breakdown: {
            "Content Length": {
              score: 16,
              maxScore: 20,
              reason: "145 words (300+ recommended)",
            },
            Readability: {
              score: 18,
              maxScore: 20,
              reason: "Flesch score: 65 (good)",
            },
            "Keyword Usage": {
              score: 10,
              maxScore: 15,
              reason: "8 keywords, 2.1% density",
            },
            "Content Organization": {
              score: 14,
              maxScore: 20,
              reason: "2 headings, 0 lists",
            },
            "Multimedia & Links": {
              score: 4,
              maxScore: 10,
              reason: "1 link, 0 images",
            },
            "Content Quality": {
              score: 8,
              maxScore: 10,
              reason: "Good sentiment and balance",
            },
          },
          recommendations: [
            "Add more content - aim for at least 300 words",
            "Include more headings (H2, H3) to structure content",
            "Add bullet points or numbered lists",
            "✓ Good readability score",
          ],
        },
        keywords: [
          {
            text: "artificial intelligence",
            relevanceScore: 0.95,
            frequency: 3,
            type: "entity",
          },
          {
            text: "machine learning",
            relevanceScore: 0.88,
            frequency: 2,
            type: "entity",
          },
          {
            text: "deep learning",
            relevanceScore: 0.82,
            frequency: 1,
            type: "entity",
          },
          {
            text: "data-driven",
            relevanceScore: 0.76,
            frequency: 1,
            type: "adjective",
          },
          {
            text: "algorithms",
            relevanceScore: 0.71,
            frequency: 2,
            type: "noun",
          },
          {
            text: "digital transformation",
            relevanceScore: 0.69,
            frequency: 1,
            type: "noun",
          },
          {
            text: "automation",
            relevanceScore: 0.65,
            frequency: 1,
            type: "noun",
          },
          {
            text: "innovation",
            relevanceScore: 0.63,
            frequency: 1,
            type: "noun",
          },
        ],
        entities: [
          {
            text: "Artificial Intelligence",
            type: "Technology",
            relevanceScore: 0.95,
          },
          {
            text: "Machine Learning",
            type: "Technology",
            relevanceScore: 0.88,
          },
          { text: "Deep Learning", type: "Technology", relevanceScore: 0.82 },
        ],
        wordCount: 145,
        readability: { fleschScore: 65, readabilityLevel: "Standard" },
        targetKeywordAnalysis: targetKeyword
          ? {
              keyword: targetKeyword,
              frequency: 2,
              density: 1.4,
              inTitle: false,
              firstParagraph: true,
            }
          : null,
      });
      setActiveTab("results");
    }
    setIsAnalyzing(false);
  };

  type OptimizationType = "keywords" | "content" | "meta";
  const optimizeContent = async (type: OptimizationType) => {
    if (!isEmailVerified) {
      setOptimizationType(type);
      setShowEmailModal(true);
      return;
    }

    setIsOptimizing(true);
    setOptimizationType(type);

    try {
      const response = await fetch("/api/ai-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          targetKeyword,
          optimizationType: type,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setOptimization(result);
      }
    } catch (error) {
      // Demo optimization result
      const optimizations = {
        keywords: `**Primary Keywords (High Priority):**
- artificial intelligence (AI)
- machine learning algorithms
- deep learning models
- AI automation solutions
- data-driven decision making

**Long-tail Keywords:**
- AI applications in business
- machine learning for enterprises
- artificial intelligence transformation
- automated business processes
- AI-powered data analysis

**Semantic Variations:**
- intelligent automation
- predictive analytics
- cognitive computing
- smart algorithms
- digital intelligence

**Placement Recommendations:**
- Title: Include "AI" or "Artificial Intelligence"
- H1: Feature primary keyword
- First paragraph: Use 2-3 primary keywords naturally
- Body: Distribute long-tail keywords throughout
- Meta description: Include top 2 keywords`,

        content: `# Artificial Intelligence: Transforming Business Through Machine Learning

Artificial Intelligence (AI) is revolutionizing how businesses operate in today's digital landscape. Machine learning algorithms have become increasingly sophisticated, enabling companies to implement AI automation solutions and make data-driven decisions with unprecedented accuracy.

## AI Applications Across Industries

AI applications span various sectors, from healthcare to finance, fundamentally transforming traditional workflows. Deep learning models can now process vast datasets, identifying patterns and insights that human analysis might overlook.

### Key Benefits of AI Implementation:
- Automated business processes
- Enhanced predictive analytics
- Improved decision-making speed
- Reduced operational costs
- Better customer experiences

## The Future of Artificial Intelligence

The future of AI looks promising, with continuous advancements in natural language processing and computer vision opening new possibilities for innovation and intelligent automation.

*Ready to transform your business with AI? Contact our experts today.*`,

        meta: `**Title Options:**
1. "AI & Machine Learning: Transform Your Business in 2024"
2. "Artificial Intelligence Solutions for Modern Enterprises" 
3. "Complete Guide to AI Implementation & Automation"

**Meta Descriptions:**
1. "Discover how artificial intelligence and machine learning are transforming businesses. Learn about AI applications, benefits, and implementation strategies."
2. "Explore AI automation solutions and data-driven decision making. Transform your business with machine learning algorithms and intelligent systems."

**Additional Meta Elements:**
- URL: /artificial-intelligence-business-transformation
- Keywords: AI, machine learning, artificial intelligence, automation
- Open Graph Title: "AI & Machine Learning Business Transformation Guide"`,
      };

      setOptimization({
        optimization: optimizations[type] || optimizations.keywords,
        type,
      });
    }
    setIsOptimizing(false);
  };

  const analyzeUrl = async () => {
    if (!urlToAnalyze.trim()) return;

    setIsAnalyzingUrl(true);
    try {
      const response = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToAnalyze }),
      });

      if (response.ok) {
        const result = await response.json();
        setUrlAnalysis(result);
      }
    } catch (error) {
      console.error("URL analysis failed:", error);
      // Demo data for URL analysis
      setUrlAnalysis({
        url: urlToAnalyze,
        technicalSeo: {
          canonicalTag: {
            found: false,
            message: "No canonical link tag found on the page.",
          },
          noindexTag: {
            found: false,
            message:
              "The page does not contain any noindex header or meta tag.",
          },
          wwwRedirect: {
            found: true,
            message:
              "Both the www and non-www versions of the URL are redirected to the same site.",
          },
          robotsTxt: {
            found: false,
            message: "The robots.txt file is missing or unavailable.",
          },
          openGraph: {
            found: false,
            missing: ["og:title", "og:type", "og:image", "og:url"],
            message: "Some Open Graph meta tags are missing.",
          },
          schemaMarkup: {
            found: false,
            message: "No Schema.org data was found on your page.",
          },
        },
        performance: {
          expiresHeaders: {
            found: false,
            message:
              'The server is not using "expires" headers for the images.',
          },
          jsMinified: {
            found: true,
            message: "All Javascript files appear to be minified.",
          },
          cssMinified: {
            found: true,
            message: "All CSS files appear to be minified.",
          },
          requestCount: { count: 19, message: "The page makes 19 requests." },
          htmlSize: {
            size: "9 Kb",
            message:
              "The size of the HTML document is 9 Kb. This is under the average of 33 Kb.",
          },
          responseTime: {
            time: "0.2s",
            message: "The response time is under 0.2 seconds.",
          },
        },
        seoScore: 68,
        recommendations: [
          "Add canonical link tag to prevent duplicate content issues",
          "Implement Open Graph meta tags for better social sharing",
          "Add Schema.org structured data markup",
          "Create and configure robots.txt file",
          "Optimize images with proper expires headers",
        ],
      });
    }
    setIsAnalyzingUrl(false);
  };

  const insertSelectedKeywords = () => {
    if (selectedKeywords.size === 0) return;

    const keywordsToInsert = Array.from(selectedKeywords);
    const sentences = content.split(". ");

    let optimizedContent = content;
    keywordsToInsert.forEach((keyword, index) => {
      const sentenceIndex = Math.min(index + 1, sentences.length - 1);
      if (
        sentenceIndex < sentences.length &&
        !sentences[sentenceIndex].toLowerCase().includes(keyword.toLowerCase())
      ) {
        optimizedContent = optimizedContent.replace(
          sentences[sentenceIndex],
          `${sentences[sentenceIndex]} This relates to ${keyword}.`
        );
      }
    });

    setContent(optimizedContent);
    setSelectedKeywords(new Set());
  };

  useEffect(() => {
  // Check for previously verified email in session storage
  const storedEmail = sessionStorage.getItem('verifiedEmail');
  if (storedEmail) {
    setUserEmail(storedEmail);
    setIsEmailVerified(true);
  }
}, []);

// Update your email verification success handler to store the email
const handleEmailVerificationSuccess = (email: string) => {
  setUserEmail(email);
  setIsEmailVerified(true);
  sessionStorage.setItem('verifiedEmail', email);
  setShowEmailModal(false);
  
  if (optimizationType) {
    optimizeContent(optimizationType as OptimizationType);
  }
};

  // Email Verification Modal Component
const EmailVerificationModal = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const isAuthorized = await verifyEmail(email);
      
      if (isAuthorized) {
        setUserEmail(email);
        setIsEmailVerified(true);
        setShowEmailModal(false);

        // Proceed with the AI optimization that was requested
        if (optimizationType) {
          optimizeContent(optimizationType as OptimizationType);
        }
      } else {
        setError("This email is not authorized to use AI features. Please contact support if you believe this is an error.");
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#ECDFCC] p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-[#1E201E] mb-4">
          Verify Email for AI Features
        </h3>
        <p className="text-sm text-[#3C3D37] mb-4">
          Please enter your authorized email address to access AI-powered optimization features.
        </p>
        <form onSubmit={handleVerification} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1E201E] mb-2">
              Email Address
            </label>
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-[#697565] rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowEmailModal(false)}
              className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

  const ScoreCircle = ({
    score,
    size = 80,
  }: {
    score: number;
    size?: number;
  }) => {
    const radius = size / 2 - 6;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getScoreColor = (score: number): string => {
      if (score >= 80) return "#10B981";
      if (score >= 60) return "#F59E0B";
      return "#EF4444";
    };

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getScoreColor(score)}
            strokeWidth="6"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-[#1E201E]">{score}</div>
            <div className="text-xs text-[#3C3D37]">Score</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className=" bg-[#1E201E] flex items-center justify-center p-2 sm:h-dvh lg:min-h-screen">
        <div className="bg-[#3C3D37] rounded-lg shadow-lg overflow-hidden w-full max-w-5xl h-[calc(100dvh-1rem)] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3C3D37] to-purple-600 text-white p-2">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Search className="w-5 h-5" />
              SEO Analyzer & Optimizer
            </h1>
            <p className="text-sm opacity-90">
              Analyze your content and optimize it for better search rankings
            </p>
          </div>

          {/* Navigation */}
          <div className="bg-[#3C3D37] border-b border-[#697565]">
            <div className="flex">
              {[
                { id: "analyze", label: "Analyze", icon: Search },
                {
                  id: "results",
                  label: "Results",
                  icon: TrendingUp,
                  disabled: !analysis,
                },
                {
                  id: "optimize",
                  label: "Optimize",
                  icon: Sparkles,
                  disabled: !analysis,
                },
                { id: "url-analysis", label: "URL Check", icon: Eye },
              ].map(({ id, label, icon: Icon, disabled }) => (
                <button
                  key={id}
                  onClick={() => !disabled && setActiveTab(id)}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === id
                      ? "bg-[#ECDFCC] text-blue-600 border-b-2 border-blue-600"
                      : disabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#ECDFCC] hover:text-[#1E201E] hover:bg-[#697565]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-2 flex-1 overflow-y-auto">
            {activeTab === "analyze" && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-[#ECDFCC] mb-1">
                    Content to Analyze
                  </label>
                  <div className="relative">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Paste your content here or try the sample content..."
                      className="w-full h-32 p-2 text-sm border border-[#697565] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y bg-[#ECDFCC] text-[#1E201E]"
                    />
                    <button
                      onClick={() => setContent(sampleContent)}
                      className="absolute top-2 right-2 px-2 py-1 text-xs bg-[#697565] hover:bg-[#3C3D37] rounded transition-colors text-[#ECDFCC]"
                    >
                      Sample
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#ECDFCC] mb-1">
                    Target Keyword (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    placeholder="e.g., artificial intelligence"
                    className="w-full p-2 text-sm border border-[#697565] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#ECDFCC] text-[#1E201E]"
                  />
                </div>

                <button
                  onClick={analyzeContent}
                  disabled={isAnalyzing || !content.trim()}
                  className="mx-auto w-fit bg-[#181C14] hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Analyze SEO
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === "results" && analysis && (
              <div className="space-y-2 animate-slideUp">
                {/* SEO Score Overview */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[#1E201E] mb-1">
                        SEO Analysis Results
                      </h2>
                      <p className="text-sm text-[#3C3D37]">
                        Grade:{" "}
                        <span className="font-semibold">
                          {analysis.seoAnalysis.grade}
                        </span>
                      </p>
                    </div>
                    <ScoreCircle score={analysis.seoAnalysis.score} />
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div
                  className="grid md:grid-cols-2 gap-2 animate-slideUp"
                  style={{ animationDelay: "0.1s" }}
                >
                  <div className="bg-[#ECDFCC] border border-[#697565] rounded-lg p-3">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-[#1E201E]">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Score Breakdown
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(analysis.seoAnalysis.breakdown).map(
                        ([category, data]) => (
                          <div
                            key={category}
                            className="flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-[#1E201E]">
                                  {category}
                                </span>
                                <span className="text-xs text-[#3C3D37]">
                                  {data.score}/{data.maxScore}
                                </span>
                              </div>
                              <div className="w-full bg-[#697565] rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${
                                      (data.score / data.maxScore) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <p className="text-xs text-[#3C3D37] mt-1">
                                {data.reason}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-[#ECDFCC] border border-[#697565] rounded-lg p-3">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-[#1E201E]">
                      <Lightbulb className="w-4 h-4 text-yellow-600" />
                      Recommendations
                    </h3>
                    <div className="space-y-1">
                      {analysis.seoAnalysis.recommendations.map(
                        (rec, index) => (
                          <div key={index} className="flex items-start gap-2">
                            {rec.startsWith("✓") ? (
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                            )}
                            <span className="text-xs text-[#1E201E]">
                              {rec.replace("✓ ", "")}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Keywords Section */}
                <div
                  className="bg-[#ECDFCC] border border-[#697565] rounded-lg p-3 animate-slideUp"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-[#1E201E]">
                      <Target className="w-4 h-4 text-green-600" />
                      Keywords ({analysis.keywords.length})
                    </h3>
                    <button
                      onClick={insertSelectedKeywords}
                      disabled={selectedKeywords.size === 0}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded text-xs font-medium transition-colors"
                    >
                      Insert ({selectedKeywords.size})
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {analysis.keywords.map((keyword, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          const newSelected = new Set(selectedKeywords);
                          if (newSelected.has(keyword.text)) {
                            newSelected.delete(keyword.text);
                          } else {
                            newSelected.add(keyword.text);
                          }
                          setSelectedKeywords(newSelected);
                        }}
                        className={`p-2 border rounded cursor-pointer transition-all hover:shadow-sm animate-slideUp ${
                          selectedKeywords.has(keyword.text)
                            ? "border-green-500 bg-green-50"
                            : "border-[#697565] hover:border-[#3C3D37]"
                        }`}
                        style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#1E201E]">
                            {keyword.text}
                          </span>
                          <span
                            className={`px-1 py-0.5 rounded text-xs font-medium ${
                              keyword.type === "entity"
                                ? "bg-blue-100 text-blue-800"
                                : keyword.type === "noun"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-[#697565] text-[#1E201E]"
                            }`}
                          >
                            {keyword.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-[#3C3D37]">
                            {Math.round(keyword.relevanceScore * 100)}%
                          </span>
                          <span className="text-xs text-[#3C3D37]">
                            x{keyword.frequency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Keyword Analysis */}
                {analysis.targetKeywordAnalysis && (
                  <div
                    className="bg-[#ECDFCC] border border-[#697565] rounded-lg p-3 animate-slideUp"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-[#1E201E]">
                      <Target className="w-4 h-4 text-red-600" />
                      Target Keyword: {analysis.targetKeywordAnalysis.keyword}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="text-center p-2 bg-[#697565] rounded">
                        <div className="text-lg font-bold text-[#1E201E]">
                          {analysis.targetKeywordAnalysis.frequency}
                        </div>
                        <div className="text-xs text-[#3C3D37]">Frequency</div>
                      </div>
                      <div className="text-center p-2 bg-[#697565] rounded">
                        <div className="text-lg font-bold text-[#1E201E]">
                          {analysis.targetKeywordAnalysis.density}%
                        </div>
                        <div className="text-xs text-[#3C3D37]">Density</div>
                      </div>
                      <div className="text-center p-2 bg-[#697565] rounded">
                        <div
                          className={`text-lg font-bold ${
                            analysis.targetKeywordAnalysis.inTitle
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {analysis.targetKeywordAnalysis.inTitle ? "✓" : "✗"}
                        </div>
                        <div className="text-xs text-[#3C3D37]">In Title</div>
                      </div>
                      <div className="text-center p-2 bg-[#697565] rounded">
                        <div
                          className={`text-lg font-bold ${
                            analysis.targetKeywordAnalysis.firstParagraph
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {analysis.targetKeywordAnalysis.firstParagraph
                            ? "✓"
                            : "✗"}
                        </div>
                        <div className="text-xs text-[#3C3D37]">First Para</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div
                  className="flex flex-wrap gap-2 animate-slideUp"
                  style={{ animationDelay: "0.5s" }}
                >
                  <button
                    onClick={() => setActiveTab("optimize")}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI Optimize
                  </button>
                  <button
                    onClick={() => optimizeContent("meta")}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    Meta Tags
                  </button>
                  <button
                    onClick={() => optimizeContent("keywords")}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Target className="w-3 h-3" />
                    Keywords
                  </button>
                </div>
              </div>
            )}

            {activeTab === "optimize" && analysis && (
              <div className="space-y-2 animate-slideUp">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3">
                  <h2 className="text-lg font-bold text-[#1E201E] mb-1 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI-Powered Optimization
                  </h2>
                  <p className="text-sm text-[#3C3D37]">
                    Choose how you want to optimize your content
                  </p>
                </div>

                <div
                  className="grid md:grid-cols-2 gap-2 animate-slideUp"
                  style={{ animationDelay: "0.1s" }}
                >
                  {[
                    {
                      type: "content",
                      title: "Optimize Content",
                      desc: "Rewrite for better SEO",
                      icon: Edit3,
                    },
                    {
                      type: "keywords",
                      title: "Keyword Research",
                      desc: "Get targeted keywords",
                      icon: Target,
                    },
                    {
                      type: "meta",
                      title: "Meta Tags",
                      desc: "Generate titles & descriptions",
                      icon: FileText,
                    },
                    {
                      type: "structure",
                      title: "Content Structure",
                      desc: "Improve organization",
                      icon: TrendingUp,
                    },
                  ].map(({ type, title, desc, icon: Icon }, index) => (
                    <button
                      key={type}
                      //@ts-expect-error
                      onClick={() => optimizeContent(type)}
                      disabled={isOptimizing}
                      className="p-3 bg-[#ECDFCC] border-2 border-[#697565] hover:border-purple-300 rounded-lg text-left transition-all hover:shadow-md disabled:opacity-50 group animate-slideUp"
                      style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="text-sm font-semibold text-[#1E201E] mb-1">
                            {title}
                          </h3>
                          <p className="text-xs text-[#3C3D37]">{desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {optimization && (
                  <div
                    className="bg-[#ECDFCC] border border-[#697565] rounded-lg p-3 animate-slideUp"
                    style={{ animationDelay: "0.3s" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold flex items-center gap-2 text-[#1E201E]">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        AI Results
                      </h3>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        {optimization.type}
                      </span>
                    </div>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-xs text-white bg-[#3C3D37] p-3 rounded overflow-auto max-h-64">
                        {optimization.optimization}
                      </pre>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            optimization.optimization
                          )
                        }
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => setOptimization(null)}
                        className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-xs font-medium transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {isOptimizing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center animate-slideUp">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                    <p className="text-blue-800 text-sm font-medium">
                      AI is optimizing your content...
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "url-analysis" && (
              <div className="space-y-2 animate-slideUp">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-3">
                  <h2 className="text-lg font-bold text-[#1E201E] mb-1 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    URL SEO Analysis
                  </h2>
                  <p className="text-sm text-[#3C3D37]">
                    Analyze any website URL for technical SEO issues
                  </p>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-[#ECDFCC] mb-1">
                      Website URL to Analyze
                    </label>
                    <input
                      type="url"
                      value={urlToAnalyze}
                      onChange={(e) => setUrlToAnalyze(e.target.value)}
                      placeholder="https://example.com/blog-post"
                      className="w-full p-2 text-sm border border-[#697565] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#ECDFCC] text-[#1E201E]"
                    />
                  </div>

                  <button
                    onClick={analyzeUrl}
                    disabled={isAnalyzingUrl || !urlToAnalyze.trim()}
                    className="mx-auto w-fit bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isAnalyzingUrl ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Analyze URL
                      </>
                    )}
                  </button>
                </div>

                {urlAnalysis && (
                  <div
                    className="space-y-2 animate-slideUp"
                    style={{ animationDelay: "0.1s" }}
                  >
                    {/* SEO Score */}
                    <div className="bg-[#ECDFCC] border border-[#697565] rounded-lg p-3 text-center">
                      <ScoreCircle score={urlAnalysis.seoScore} size={60} />
                      <p className="text-xs text-[#3C3D37] mt-1">
                        Overall SEO Score
                      </p>
                    </div>

                    {/* Technical SEO Issues */}
                    <div
                      className="bg-[#ECDFCC] border border-[#697565] rounded-lg p-3 animate-slideUp"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-[#1E201E]">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        Technical SEO Issues
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(urlAnalysis.technicalSeo).map(
                          ([key, data]: [string, any], index) => (
                            <div
                              key={key}
                              className="flex items-start gap-2 p-2 bg-[#697565] rounded animate-slideUp"
                              style={{
                                animationDelay: `${0.3 + index * 0.05}s`,
                              }}
                            >
                              {data.found ? (
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              )}
                              <div>
                                <h4 className="text-xs font-medium text-white capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}
                                </h4>
                                <p className="text-xs text-gray-300 mt-1">
                                  {data.message}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Performance Analysis */}
                    <div
                      className="bg-[#ECDFCC] border border-[#697565] rounded-lg p-3 animate-slideUp"
                      style={{ animationDelay: "0.4s" }}
                    >
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-[#1E201E]">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        Performance
                      </h3>
                      <div className="grid md:grid-cols-2 gap-2">
                        {Object.entries(urlAnalysis.performance).map(
                          ([key, data]: [string, any], index) => (
                            <div
                              key={key}
                              className="flex items-start gap-2 p-2 bg-[#697565] rounded animate-slideUp"
                              style={{
                                animationDelay: `${0.5 + index * 0.05}s`,
                              }}
                            >
                              {data.found ||
                              data.time === "0.2s" ||
                              data.size === "9 Kb" ? (
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                              )}
                              <div>
                                <h4 className="text-xs font-medium text-white capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}
                                </h4>
                                <p className="text-xs text-gray-300">
                                  {data.message}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div
                      className="bg-[#ECDFCC] border border-[#697565] rounded-lg p-3 animate-slideUp"
                      style={{ animationDelay: "0.6s" }}
                    >
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-[#1E201E]">
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                        Recommendations
                      </h3>
                      <div className="space-y-1">
                        {urlAnalysis.recommendations.map(
                          (rec: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 animate-slideUp"
                              style={{
                                animationDelay: `${0.7 + index * 0.05}s`,
                              }}
                            >
                              <AlertCircle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-[#1E201E]">
                                {rec}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {showEmailModal && <EmailVerificationModal />}
        <style jsx>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-slideUp {
            animation: slideUp 0.4s ease-out forwards;
          }
        `}</style>
      </div>
    </>
  );
};

export default SEOAnalyzer;
