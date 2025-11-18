"use client";
import Header from "@/components/Header";
import { NotificationProvider } from "@/components/Notification";
import VideoFeed from "@/components/VideoFeed";
import { IVideo } from "@/models/Video";
import { apiClient } from "@/utils/api-client";
import { useEffect, useState } from "react";

export default function Home() {
  const [videos, setVideos] = useState<IVideo[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await apiClient.getVideos();
        setVideos(data as IVideo[]);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="">
      <NotificationProvider>
        <Header />
        <div>
          <VideoFeed videos={videos} />
        </div>
      </NotificationProvider>
    </div>
  );
}
