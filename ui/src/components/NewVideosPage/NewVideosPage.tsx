import { Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Actor, Tag, Video } from "../../types";
import NewVideoCard from "../NewVideoCard";

const VIDEO_EXTENSIONS = [
  ".avi",
  ".m4v",
  ".mkv",
  ".mov",
  ".mp4",
  ".mpeg",
  ".mpg",
  ".ts",
  ".webm",
  ".wmv",
];

const isVideoPath = (path: string) =>
  VIDEO_EXTENSIONS.some((extension) => path.toLowerCase().endsWith(extension));

const NewVideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetch("/api/videos/new")
      .then((res) => res.json())
      .then((data: Video[]) =>
        setVideos(data.filter((video) => isVideoPath(video.path)))
      );

    fetch("/api/actors")
      .then((res) => res.json())
      .then(setActors);

    fetch("/api/tags")
      .then((res) => res.json())
      .then(setTags);
  }, []);

  const handleSave = async (
    video: Video,
    data: {
      title: string;
      rating: string;
      release_date: string;
      thumbnailFile?: File;
      actors: number[];
      tags: number[];
    }
  ) => {
    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("rating", data.rating);
      formData.append("release_date", data.release_date);
      formData.append("path", video.path);

      formData.append("actors", JSON.stringify(data.actors));
      formData.append("tags", JSON.stringify(data.tags));

      if (data.thumbnailFile) {
        formData.append("thumbnail", data.thumbnailFile);
      }

      const res = await fetch(`/api/videos/${video.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save");

      toast("Video saved ✅");
    } catch (err) {
      console.error(err);
      toast("Error saving video ❌");
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        New Videos
      </Typography>
      <Grid container spacing={2}>
        {videos.map((video) => (
          <Grid key={video.id} component={"div"}>
            <NewVideoCard
              video={video}
              onSave={(data) => handleSave(video, data)}
              allTags={tags}
              allActors={actors}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default React.memo(NewVideosPage);
