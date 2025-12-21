import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  CardMedia,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Actor, Tag, Video } from "../../types";

interface VideoCardProps {
  video: Video;
  allActors: Actor[];
  allTags: Tag[];
  onSave: (data: {
    title: string;
    rating: string;
    thumbnailFile?: File;
    path: string;
    release_date: string;
    actors: number[];
    tags: number[];
  }) => void;
}

const NewVideoCard: React.FC<VideoCardProps> = ({
  video,
  allActors,
  allTags,
  onSave,
}) => {
  const [title, setTitle] = useState(video.title || "");
  const [rating, setRating] = useState(video.rating || "");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState(
    video.thumbnail ? `/thumbnails/${video.thumbnail}` : ""
  );
  const [releaseDate, setReleaseDate] = useState(video.release_date || "");

  const [selectedActors, setSelectedActors] = useState<Actor[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // 🔁 id -> objects
  useEffect(() => {
    if (video.actors?.length) {
      setSelectedActors(allActors.filter((a) => video.actors!.includes(a.id)));
    }
    if (video.tags?.length) {
      setSelectedTags(allTags.filter((t) => video.tags!.includes(t.id)));
    }
  }, [video.actors, video.tags, allActors, allTags]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSaveClick = () => {
    onSave({
      title,
      rating,
      thumbnailFile: thumbnail || undefined,
      path: video.path,
      release_date: releaseDate,
      actors: selectedActors.map((a) => a.id),
      tags: selectedTags.map((t) => t.id),
    });
  };

  return (
    <Card sx={{ display: "flex", mb: 2 }}>
      <CardMedia
        component="img"
        sx={{ width: 400 }}
        image={preview || "/assets/no-image.svg"}
      />

      <CardContent sx={{ flex: 1 }}>
        <Stack spacing={1}>
          <Typography variant="caption">Path: {video.path}</Typography>

          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
          />

          <TextField
            label="Rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            size="small"
          />

          <TextField
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            size="small"
          />

          {/* 🎭 Actors */}
          <Autocomplete
            multiple
            options={allActors}
            value={selectedActors}
            getOptionLabel={(o) => o.name}
            onChange={(_, v) => setSelectedActors(v)}
            renderInput={(params) => (
              <TextField {...params} label="Actors" size="small" />
            )}
          />

          {/* 🏷 Tags */}
          <Autocomplete
            multiple
            options={allTags}
            value={selectedTags}
            getOptionLabel={(o) => o.name}
            onChange={(_, v) => setSelectedTags(v)}
            renderInput={(params) => (
              <TextField {...params} label="Tags" size="small" />
            )}
          />

          <Button variant="outlined" component="label" size="small">
            Upload Preview
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleThumbnailChange}
            />
          </Button>

          <Button variant="contained" onClick={handleSaveClick}>
            Save
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default React.memo(NewVideoCard);
