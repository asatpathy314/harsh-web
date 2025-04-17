"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface FileUploadProps {
  id: string
  onFileContent: (content: string) => void
  accept?: string
  label?: string
}

export function FileUpload({ id, onFileContent, label = "Upload File" }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsLoading(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      onFileContent(content)
      setIsLoading(false)
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => document.getElementById(id)?.click()}
          disabled={isLoading}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? "Loading..." : fileName || label}
        </Button>
      </div>
      <input id={id} type="file" onChange={handleFileChange} className="hidden" />
    </div>
  )
}
