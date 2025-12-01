import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, CheckCircle } from 'lucide-react'
import { getUploadUrl } from '../services/api'
import toast from 'react-hot-toast'

interface UploadZoneProps {
  onUploadSuccess?: () => void
}

export default function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        // Validate file type
        if (!file.name.endsWith('.fastq') && !file.name.endsWith('.fastq.gz')) {
          toast.error(`${file.name} is not a valid FASTQ file`)
          continue
        }

        try {
          setUploading(true)
          setUploadProgress(0)

          // Get signed URL from API
          const { signed_url, filename } = await getUploadUrl(file.name)

          // Upload to GCS using signed URL
          const xhr = new XMLHttpRequest()

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100
              setUploadProgress(percentComplete)
            }
          })

          await new Promise<void>((resolve, reject) => {
            xhr.addEventListener('load', () => {
              if (xhr.status === 200 || xhr.status === 204) {
                resolve()
              } else {
                reject(new Error(`Upload failed with status ${xhr.status}`))
              }
            })

            xhr.addEventListener('error', () => {
              reject(new Error('Upload failed'))
            })

            xhr.open('PUT', signed_url)
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
            xhr.send(file)
          })

          setUploadedFiles((prev) => [...prev, filename])
          toast.success(`${file.name} uploaded successfully`)
          setUploadProgress(0)

          // Trigger refresh after a delay to allow processing
          if (onUploadSuccess) {
            setTimeout(() => {
              onUploadSuccess()
            }, 2000)
          }
        } catch (error) {
          console.error('Upload error:', error)
          toast.error(`Failed to upload ${file.name}`)
        } finally {
          setUploading(false)
        }
      }
    },
    [onUploadSuccess]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.fastq', '.fastq.gz'],
    },
    disabled: uploading,
  })

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Upload FASTQ Files
      </h3>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-primary-600 dark:text-primary-400 font-medium">
            Drop the files here...
          </p>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag & drop FASTQ files here, or click to select
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Supports .fastq and .fastq.gz files
            </p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {uploadProgress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Recently Uploaded
          </h4>
          <div className="space-y-2">
            {uploadedFiles.slice(-5).map((filename, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-900 dark:text-white">{filename}</span>
                </div>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

