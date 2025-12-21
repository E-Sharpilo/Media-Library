import { Box, Button, CircularProgress, Grid } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Video } from "../../types";
import TagsFilter from "../TagsFilter";
import VideoCard from "../VideoCard";

const PAGE_SIZE = 30;

interface CategoryPageProps {
  favorite?: boolean;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ favorite }) => {
  const { id: categoryId } = useParams<{ id: string }>();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const loadVideos = useCallback(
    async (pageNumber = 1) => {
      setLoading(true);
      const offset = (pageNumber - 1) * PAGE_SIZE;
      const tagsQuery = selectedTags.length
        ? `&tags=${selectedTags.join(",")}`
        : "";
      const favQuery = favorite ? `&favorite=1` : "";
      const catQuery = !favorite && categoryId ? `&category=${categoryId}` : "";
      const res = await fetch(
        `/api/videos?limit=${PAGE_SIZE}&offset=${offset}${catQuery}${tagsQuery}${favQuery}`
      );
      const data = await res.json();

      setVideos(data.videos || data);
      setTotalCount(data.totalCount || data.length + offset);
      setLoading(false);
    },
    [categoryId, selectedTags, favorite]
  );

  useEffect(() => {
    setPage(1);
    loadVideos(1);
  }, [categoryId, selectedTags, favorite, loadVideos]);

  useEffect(() => {
    if (page > 1) loadVideos(page);
  }, [page, loadVideos]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <TagsFilter selectedTags={selectedTags} onChange={setSelectedTags} />

      <Grid
        container
        spacing={2}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
            xl: "repeat(5, 1fr)",
          },
        }}
      >
        {videos.map((video) => (
          <div key={video.id}>
            <VideoCard video={video} />
          </div>
        ))}
      </Grid>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            mt: 2,
            position: "sticky",
            bottom: 0,
            backgroundColor: "white",
            py: 1,
            zIndex: 10,
          }}
        >
          <Button
            variant="outlined"
            disabled={page === 1 || loading}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Prev
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", px: 1 }}>
            {page} / {totalPages}
          </Box>
          <Button
            variant="outlined"
            disabled={page === totalPages || loading}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </Box>
      )}
    </div>
  );
};

export default React.memo(CategoryPage);
