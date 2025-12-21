import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Category } from "../../types";

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const startEdit = (id: number, name: string) => {
    setEditId(id);
    setEditName(name);
  };

  const saveEdit = (id: number) => {
    fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: editName }),
    })
      .then((res) => res.json())
      .then(() => {
        setCategories(
          categories.map((c) =>
            c.id === id ? { ...c, display_name: editName } : c
          )
        );
        setEditId(null);
        setEditName("");
      })
      .catch(console.error);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Categories
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Folder Name</TableCell>
              <TableCell>Display Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.display_name}</TableCell>
                <TableCell>
                  {editId === cat.id ? (
                    <TextField
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      size="small"
                    />
                  ) : (
                    cat.display_name
                  )}
                </TableCell>
                <TableCell align="right">
                  {editId === cat.id ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => saveEdit(cat.id)}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => startEdit(cat.id, cat.display_name)}
                    >
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default React.memo(CategoriesPage);
