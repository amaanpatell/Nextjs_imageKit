"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Upload, Video, FileText, CheckCircle, X } from "lucide-react";
import { useNotification } from "./Notification";
import { apiClient, VideoFormData } from "@/utils/api-client";
import FileUpload from "./FileUpload";
import { useRouter } from "next/navigation";

export default function VideoUploadForm() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showNotification } = useNotification();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<VideoFormData>({
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
    },
  });

  const titleValue = watch("title");
  const descriptionValue = watch("description");

  const handleUploadSuccess = (response: any) => {
    setValue("videoUrl", response.filePath);
    setValue("thumbnailUrl", response.thumbnailUrl || response.filePath);
    showNotification("Video uploaded successfully!", "success");
  };

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  const onSubmit = async (data: VideoFormData) => {
    if (!data.videoUrl) {
      showNotification("Please upload a video first", "error");
      return;
    }

    setLoading(true);
    try {
      await apiClient.createVideo(data);
      showNotification("Video published successfully!", "success");
      reset();
      setUploadProgress(0);
      router.push("/");
      
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to publish video",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-base-content mb-3">
            Upload Your Video
          </h1>
          <p className="text-lg text-base-content/60">
            Share your content with the world
          </p>
        </div>

        {/* Form Card */}
        <div className="card bg-base-200 shadow-2xl border border-base-200">
          <div className="card-body p-8 md:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* File Upload Section */}
              <div className="form-control">
                <label className="label pb-3">
                  <span className="label-text text-base font-semibold text-base-content flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-primary" />
                    </div>
                    Video File
                  </span>
                  <span className="label-text-alt text-sm">
                    <span className="badge badge-ghost badge-sm">
                      Max 100MB
                    </span>
                  </span>
                </label>

                {/* Upload Area - Using FileUpload component that renders the drag-drop UI */}
                <FileUpload
                  fileType="video"
                  onSuccess={handleUploadSuccess}
                  onProgress={handleUploadProgress}
                />

                {/* Upload Success Message */}
                {uploadProgress === 100 && (
                  <div className="alert alert-success mt-4 shadow-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">
                        Video uploaded successfully!
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div className="form-control">
                <label className="label pb-3">
                  <span className="label-text text-base font-semibold text-base-content flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    Video Title
                  </span>
                  <span className="label-text-alt text-sm">
                    <span className="badge badge-ghost badge-sm">Required</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Give your video an engaging title..."
                    className={`input input-bordered w-full text-base h-14 pl-4 pr-12 transition-all ${
                      errors.title
                        ? "input-error focus:input-error"
                        : "focus:input-primary focus:border-2"
                    }`}
                    {...register("title", {
                      required: "Title is required",
                      minLength: {
                        value: 3,
                        message: "Title must be at least 3 characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "Title must be less than 100 characters",
                      },
                    })}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {titleValue && (
                      <span
                        className={`text-xs ${
                          titleValue.length > 100
                            ? "text-error"
                            : "text-base-content/40"
                        }`}
                      >
                        {titleValue.length}/100
                      </span>
                    )}
                  </div>
                </div>
                {errors.title ? (
                  <label className="label pt-2">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {errors.title.message}
                    </span>
                  </label>
                ) : (
                  <label className="label pt-2">
                    <span className="label-text-alt text-base-content/60">
                      Choose a clear, descriptive title for your video
                    </span>
                  </label>
                )}
              </div>

              {/* Description Textarea */}
              <div className="form-control">
                <label className="label pb-3">
                  <span className="label-text text-base font-semibold text-base-content flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    Description
                  </span>
                  <span className="label-text-alt text-sm">
                    <span className="badge badge-ghost badge-sm">Required</span>
                  </span>
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Describe what viewers can expect from your video..."
                    className={`textarea textarea-bordered w-full text-base min-h-[140px] p-4 leading-relaxed transition-all resize-none ${
                      errors.description
                        ? "textarea-error focus:textarea-error"
                        : "focus:textarea-primary focus:border-2"
                    }`}
                    {...register("description", {
                      required: "Description is required",
                      minLength: {
                        value: 10,
                        message: "Description must be at least 10 characters",
                      },
                      maxLength: {
                        value: 500,
                        message: "Description must be less than 500 characters",
                      },
                    })}
                  />
                  {descriptionValue && (
                    <div className="absolute right-4 bottom-4">
                      <span
                        className={`text-xs ${
                          descriptionValue.length > 500
                            ? "text-error"
                            : "text-base-content/40"
                        }`}
                      >
                        {descriptionValue.length}/500
                      </span>
                    </div>
                  )}
                </div>
                {errors.description ? (
                  <label className="label pt-2">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {errors.description.message}
                    </span>
                  </label>
                ) : (
                  <label className="label pt-2">
                    <span className="label-text-alt text-base-content/60">
                      Provide details about the content, context, and key points
                    </span>
                  </label>
                )}
              </div>

              {/* Divider */}
              <div className="divider my-8"></div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setUploadProgress(0);
                  }}
                  className="btn btn-ghost btn-lg flex-1 h-14"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg flex-1 h-14 text-base"
                  disabled={loading || uploadProgress === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Publish Video
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
