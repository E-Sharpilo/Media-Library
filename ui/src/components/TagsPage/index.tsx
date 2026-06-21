import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";

type Tag = {
  id: number;
  name: string;
};

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTags = () => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then(setTags)
      .catch(console.error);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const filteredTags = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(term));
  }, [searchTerm, tags]);

  const handleAdd = () => {
    const name = newTagName.trim();
    if (!name) return;

    fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewTagName("");
        fetchTags();
      });
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleEditSave = () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) return;

    fetch(`/api/tags/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then(() => {
      cancelEdit();
      fetchTags();
    });
  };

  const handleDelete = (id: number) => {
    fetch(`/api/tags/${id}`, { method: "DELETE" }).then(() => fetchTags());
  };

  return (
    <Box sx={{ p: 2, maxWidth: 980 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Tags
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tags.length} total
          </Typography>
        </Box>

        <TextField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tags"
          size="small"
          sx={{ width: { xs: "100%", sm: 280 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: 1,
          mb: 2,
          borderRadius: 1,
          backgroundColor: "#fafafa",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            label="New tag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            size="small"
            fullWidth
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ flexShrink: 0 }}
          >
            Add
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: 1,
        }}
      >
        {filteredTags.map((tag) => {
          const isEditing = editingId === tag.id;

          return (
            <Paper
              key={tag.id}
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
                p: 1,
                borderRadius: 1,
                transition: "border-color 0.15s ease, background-color 0.15s ease",
                "&:hover": {
                  borderColor: "primary.light",
                  backgroundColor: "#fbfdff",
                },
              }}
            >
              {isEditing ? (
                <TextField
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditSave();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  size="small"
                  autoFocus
                  fullWidth
                />
              ) : (
                <Chip
                  label={tag.name}
                  variant="outlined"
                  sx={{
                    minWidth: 0,
                    maxWidth: "100%",
                    "& .MuiChip-label": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  }}
                />
              )}

              <Stack direction="row" spacing={0.25} sx={{ ml: "auto" }}>
                {isEditing ? (
                  <>
                    <Tooltip title="Save">
                      <IconButton size="small" color="success" onClick={handleEditSave}>
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel">
                      <IconButton size="small" onClick={cancelEdit}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => startEdit(tag)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(tag.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default React.memo(TagsPage);
