"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink } from "lucide-react"
import { useState } from "react"

interface SearchPreviewProps {
  title?: string
  description?: string
  url?: string
  onUpdate?: (data: { title: string; description: string; url: string }) => void
}

export default function SearchPreview({
  title = "Your Page Title Here",
  description = "Your meta description will appear here. Make it compelling and under 160 characters.",
  url = "https://yoursite.com/page-url",
  onUpdate,
}: SearchPreviewProps) {
  const [editableTitle, setEditableTitle] = useState(title)
  const [editableDescription, setEditableDescription] = useState(description)
  const [editableUrl, setEditableUrl] = useState(url)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    onUpdate?.({
      title: editableTitle,
      description: editableDescription,
      url: editableUrl,
    })
    setIsEditing(false)
  }

  const getTitleColor = () => {
    if (editableTitle.length > 60) return "text-red-600"
    if (editableTitle.length > 50) return "text-orange-600"
    return "text-blue-600"
  }

  const getDescriptionColor = () => {
    if (editableDescription.length > 160) return "text-red-600"
    if (editableDescription.length > 150) return "text-orange-600"
    return "text-gray-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Google Search Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Search Result Preview */}
        <div className="border rounded-lg p-4 bg-white">
          <div className="space-y-1">
            {/* URL */}
            <div className="flex items-center gap-1 text-sm">
              <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              </div>
              <span className="text-green-700 text-sm">{editableUrl.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </div>

            {/* Title */}
            <h3 className={`text-xl hover:underline cursor-pointer ${getTitleColor()}`}>{editableTitle}</h3>

            {/* Description */}
            <p className={`text-sm leading-5 ${getDescriptionColor()}`}>{editableDescription}</p>
          </div>
        </div>

        {/* Character Counts */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span>Title Length:</span>
            <span className={getTitleColor()}>{editableTitle.length}/60</span>
          </div>
          <div className="flex justify-between">
            <span>Description Length:</span>
            <span className={getDescriptionColor()}>{editableDescription.length}/160</span>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing ? (
          <div className="space-y-3 border-t pt-4">
            <div>
              <label className="text-sm font-medium">Title Tag</label>
              <Input
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                placeholder="Enter your page title"
                maxLength={70}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Meta Description</label>
              <Textarea
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
                placeholder="Enter your meta description"
                maxLength={170}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL</label>
              <Input
                value={editableUrl}
                onChange={(e) => setEditableUrl(e.target.value)}
                placeholder="https://yoursite.com/page-url"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
            Edit Preview
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
