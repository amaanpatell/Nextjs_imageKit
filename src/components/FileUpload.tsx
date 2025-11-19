"use client";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { Upload, CheckCircle, X, Film } from "lucide-react";
import { useState, useRef } from "react";

interface FileUploadProps {
  onSuccess: (res: any) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
}

const FileUpload = ({ onSuccess, onProgress, fileType }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Please upload a valid video file");
        return false;
      }
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100 MB");
      return false;
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setSelectedFile(file);
    setUploading(true);
    setError(null);

    try {
      const authRes = await fetch("/api/auth/imagekit-auth");

      if (!authRes.ok) {
        throw new Error("Failed to get authentication parameters");
      }

      const auth = await authRes.json();

      // Upload file
      const res = await upload({
        file,
        fileName: file.name,
        publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
        signature: auth.signature,
        expire: auth.expire,
        token: auth.token,
        onProgress: (event) => {
          if (event.lengthComputable && onProgress) {
            const percent = (event.loaded / event.total) * 100;
            onProgress(Math.round(percent));
          }
        },
      });

      onSuccess(res);
    } catch (error) {
      console.error("Upload failed", error);

      if (error instanceof ImageKitInvalidRequestError) {
        setError("Invalid upload request. Please try again.");
      } else if (error instanceof ImageKitServerError) {
        setError("Server error. Please try again later.");
      } else if (error instanceof ImageKitUploadNetworkError) {
        setError("Network error. Please check your connection.");
      } else if (error instanceof ImageKitAbortError) {
        setError("Upload was cancelled.");
      } else {
        setError("Upload failed. Please try again.");
      }
      setSelectedFile(null);
      onProgress?.(0);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div
          onClick={handleClick}
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
            uploading
              ? "bg-base-100 border-primary cursor-not-allowed"
              : selectedFile
              ? "bg-success/5 border-success hover:bg-success/10"
              : "bg-base-100 hover:bg-base-200 border-base-300 hover:border-primary"
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 pointer-events-none">
            {selectedFile && !uploading ? (
              <>
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <p className="text-base font-semibold text-success mb-2 text-center break-all px-4">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-base-content/60">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <p className="text-xs text-base-content/50 mt-2">
                  Click to change file
                </p>
              </>
            ) : uploading ? (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                  <Film className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="text-base font-semibold text-primary mb-2">
                  Uploading...
                </p>
                <p className="text-sm text-base-content/60">
                  Please wait while we upload your video
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="mb-2 text-base text-base-content/80 text-center">
                  <span className="font-semibold text-primary">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-sm text-base-content/50">
                  MP4, WebM, AVI, MOV (MAX. 100MB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={fileType === "video" ? "video/*" : "image/*"}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error mt-4 shadow-lg">
          <div className="flex items-center gap-2">
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
