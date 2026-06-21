import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import FolderIcon from "@mui/icons-material/Folder";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
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
import { Category } from "../../types";

type CategoryRow = Category & {
  folder_name?: string;
};

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return categories;

    return categories.filter((category) => {
      return (
        category.display_name.toLowerCase().includes(term) ||
        category.folder_name?.toLowerCase().includes(term)
      );
    });
  }, [categories, searchTerm]);

  const startEdit = (category: CategoryRow) => {
    setEditId(category.id);
    setEditName(category.display_name);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
  };

  const saveEdit = (id: number) => {
    const displayName = editName.trim();
    if (!displayName) return;

    fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName }),
    })
      .then((res) => res.json())
      .then(() => {
        setCategories((prev) =>
          prev.map((category) =>
            category.id === id
              ? { ...category, display_name: displayName }
              : category
          )
        );
        cancelEdit();
      })
      .catch(console.error);
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
            Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {categories.length} total
          </Typography>
        </Box>

        <TextField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search categories"
          size="small"
          sx={{ width: { xs: "100%", sm: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 1,
        }}
      >
        {filteredCategories.map((category) => {
          const isEditing = editId === category.id;

          return (
            <Paper
              key={category.id}
              variant="outlined"
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr auto",
                  md: "minmax(180px, 260px) minmax(0, 1fr) auto",
                },
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
              <Chip
                icon={<FolderIcon />}
                label={category.folder_name || category.display_name}
                variant="outlined"
                sx={{
                  justifyContent: "flex-start",
                  maxWidth: "100%",
                  minWidth: 0,
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />

              <Box sx={{ minWidth: 0, gridColumn: { xs: "1 / -1", md: "auto" } }}>
                {isEditing ? (
                  <TextField
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(category.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    size="small"
                    autoFocus
                    fullWidth
                  />
                ) : (
                  <Typography
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                    }}
                  >
                    {category.display_name}
                  </Typography>
                )}
              </Box>

              <Stack
                direction="row"
                spacing={0.25}
                sx={{
                  justifySelf: "end",
                  gridColumn: { xs: "2", md: "auto" },
                  gridRow: { xs: "1", md: "auto" },
                }}
              >
                {isEditing ? (
                  <>
                    <Tooltip title="Save">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => saveEdit(category.id)}
                      >
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
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => startEdit(category)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default React.memo(CategoriesPage);
