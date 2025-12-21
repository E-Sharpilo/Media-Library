import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";

type Tag = {
  id: number;
  name: string;
};

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState("");

  const fetchTags = () => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then(setTags)
      .catch(console.error);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAdd = () => {
    if (!newTagName.trim()) return;
    fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTagName }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewTagName("");
        fetchTags();
      });
  };

  const handleEditSave = () => {
    if (!editTag) return;
    fetch(`/api/tags/${editTag.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editTag.name }),
    }).then(() => {
      setEditTag(null);
      fetchTags();
    });
  };

  const handleDelete = (id: number) => {
    fetch(`/api/tags/${id}`, { method: "DELETE" }).then(() => fetchTags());
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Tags</h2>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <TextField
          label="New Tag"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          size="small"
        />
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Add Tag
        </Button>
      </div>

      <List>
        {tags.map((tag) => (
          <ListItem key={tag.id} divider>
            <ListItemText primary={tag.name} />
            <Box ml="auto">
              <IconButton onClick={() => setEditTag(tag)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(tag.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>

      <Dialog open={!!editTag} onClose={() => setEditTag(null)}>
        <DialogTitle>Edit Tag</DialogTitle>
        <DialogContent>
          <TextField
            label="Tag Name"
            value={editTag?.name || ""}
            onChange={(e) =>
              setEditTag((prev) => prev && { ...prev, name: e.target.value })
            }
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTag(null)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default React.memo(TagsPage);
