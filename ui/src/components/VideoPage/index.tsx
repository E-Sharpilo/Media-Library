import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Actor, Tag, Video } from "../../types";
import ActorPicker, { ActorChip } from "../ActorPicker";

const VideoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formState, setFormState] = useState<
    Partial<Video> & {
      thumbnailFile?: File;
      thumbnailPreview?: string;
    }
  >({});
  const [actorsList, setActorsList] = useState<Actor[]>([]);
  const [tagsList, setTagsList] = useState<Tag[]>([]);
  const [allActors, setAllActors] = useState<Actor[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      const res = await fetch(`/api/videos/${id}`);
      const data: Video = await res.json();
      setVideo(data);
      setFormState({
        title: data.title,
        release_date: data.release_date,
        rating: data.rating,
        favorite: data?.favorite ?? 0,
        thumbnailPreview: data.thumbnail
          ? `/thumbnails/${data.thumbnail}`
          : undefined,
      });

      const actorsRes = await fetch("/api/actors");
      const actorsData: Actor[] = await actorsRes.json();
      setAllActors(actorsData);
      setActorsList(actorsData.filter((a) => data.actors?.includes(a.id)));

      const tagsRes = await fetch("/api/tags");
      const tagsData: Tag[] = await tagsRes.json();
      setAllTags(tagsData);
      setTagsList(tagsData.filter((t) => data.tags?.includes(t.id)));

      setLoading(false);
    };

    fetchVideo();
  }, [id]);

  const handleChange = (
    field: keyof Video | "thumbnailFile" | "thumbnailPreview",
    value: any
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!video) return;
    const body = new FormData();
    body.append("title", formState.title || "");
    body.append("release_date", formState.release_date || "");
    body.append("rating", String(formState.rating || 0));
    body.append("favorite", String(formState.favorite ? 1 : 0));
    body.append("path", video.path);
    if (formState.thumbnailFile) {
      body.append("thumbnail", formState.thumbnailFile);
    }

    const res = await fetch(`/api/videos/${id}`, { method: "PUT", body });
    if (res.ok) {
      setVideo((prev) => ({ ...prev!, ...formState }));
      setEditMode(false);
    }
  };

  const handlePlay = async () => {
    await fetch(`/api/videos/play/${id}`);
  };

  const handleDelete = async () => {
    if (!video) return;

    const confirmed = window.confirm(
      "Delete this video from the library? The original file on disk will not be removed."
    );
    if (!confirmed) return;

    const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
    if (res.ok) {
      navigate(-1);
    }
  };

  const addActor = async (actorId: number) => {
    await fetch(`/api/videos/${id}/actors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actor_id: actorId }),
    });
    const actor = allActors.find((a) => a.id === actorId);
    if (actor) setActorsList((prev) => [...prev, actor]);
  };

  const removeActor = async (actorId: number) => {
    await fetch(`/api/videos/${id}/actors/${actorId}`, { method: "DELETE" });
    setActorsList((prev) => prev.filter((a) => a.id !== actorId));
  };

  const updateActors = async (nextActors: Actor[]) => {
    const currentIds = new Set(actorsList.map((actor) => actor.id));
    const nextIds = new Set(nextActors.map((actor) => actor.id));

    await Promise.all([
      ...nextActors
        .filter((actor) => !currentIds.has(actor.id))
        .map((actor) => addActor(actor.id)),
      ...actorsList
        .filter((actor) => !nextIds.has(actor.id))
        .map((actor) => removeActor(actor.id)),
    ]);

    setActorsList(nextActors);
  };

  const addTag = async (tagId: number) => {
    await fetch(`/api/videos/${id}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag_id: tagId }),
    });
    const tag = allTags.find((t) => t.id === tagId);
    if (tag) setTagsList((prev) => [...prev, tag]);
  };

  const removeTag = async (tagId: number) => {
    await fetch(`/api/videos/${id}/tags/${tagId}`, { method: "DELETE" });
    setTagsList((prev) => prev.filter((t) => t.id !== tagId));
  };

  const updateTags = async (nextTags: Tag[]) => {
    const currentIds = new Set(tagsList.map((tag) => tag.id));
    const nextIds = new Set(nextTags.map((tag) => tag.id));

    await Promise.all([
      ...nextTags
        .filter((tag) => !currentIds.has(tag.id))
        .map((tag) => addTag(tag.id)),
      ...tagsList
        .filter((tag) => !nextIds.has(tag.id))
        .map((tag) => removeTag(tag.id)),
    ]);

    setTagsList(nextTags);
  };

  if (loading || !video) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 3fr" },
          gap: 2,
        }}
      >
        {/* Thumbnail + Play */}
        <Box>
          <img
            src={formState.thumbnailPreview || "/placeholder.jpg"}
            alt={video.title}
            style={{ width: "100%", borderRadius: 8 }}
          />
          {editMode && (
            <Box sx={{ mt: 1 }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleChange("thumbnailFile", e.target.files[0]);
                    handleChange(
                      "thumbnailPreview",
                      URL.createObjectURL(e.target.files[0])
                    );
                  }
                }}
              />
            </Box>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handlePlay}
          >
            ▶ Play
          </Button>
        </Box>

        {/* Info / Edit */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {editMode && (
            <>
              <TextField
                label="Title"
                value={formState.title}
                onChange={(e) => handleChange("title", e.target.value)}
                fullWidth
              />
              <TextField
                label="Release Date"
                type="date"
                value={formState.release_date}
                onChange={(e) => handleChange("release_date", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Rating"
                type="number"
                value={formState.rating}
                onChange={(e) => handleChange("rating", Number(e.target.value))}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!formState.favorite}
                    onChange={(e) => handleChange("favorite", e.target.checked)}
                  />
                }
                label="Favorite"
              />
              <Button variant="contained" color="success" onClick={handleSave}>
                Save
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </>
          )}

          {!editMode && (
            <>
              <Typography variant="h5">{video.title}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Category: {video.category_name || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Release Date: {video.release_date}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rating: {video.rating}
              </Typography>
            </>
          )}

          {/* Actors */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2">Actors:</Typography>
            {!editMode && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                {actorsList.map((actor) => (
                  <ActorChip key={actor.id} actor={actor} />
                ))}
              </Box>
            )}
            {editMode && (
              <Box sx={{ mt: 0.75 }}>
                <ActorPicker
                  label="Actors"
                  options={allActors}
                  value={actorsList}
                  onChange={updateActors}
                />
              </Box>
            )}
          </Box>

          {/* Tags */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2">Tags:</Typography>
            {!editMode &&
              tagsList.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  sx={{ mr: 0.5, mt: 0.5 }}
                />
              ))}
            {editMode && (
              <Box sx={{ mt: 0.75 }}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={allTags}
                  value={tagsList}
                  getOptionLabel={(tag) => tag.name}
                  isOptionEqualToValue={(option, selected) =>
                    option.id === selected.id
                  }
                  onChange={(_, tags) => updateTags(tags)}
                  renderInput={(params) => (
                    <TextField {...params} label="Tags" size="small" />
                  )}
                />
              </Box>
            )}
          </Box>

          {!editMode && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button variant="outlined" onClick={() => setEditMode(true)}>
                  Edit Info
                </Button>
                <Button variant="outlined" color="error" onClick={handleDelete}>
                  Delete
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Grid>
    </Box>
  );
};

export default React.memo(VideoPage);
