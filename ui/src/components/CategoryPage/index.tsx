import { Box, CircularProgress, Grid, Pagination, Stack } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Video } from "../../types";
import TagsFilter from "../TagsFilter";
import VideoCard from "../VideoCard";

const PAGE_SIZE = 20;

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

  const loadVideos = useCallback(async () => {
    setLoading(true);

    const offset = (page - 1) * PAGE_SIZE;
    const tagsQuery = selectedTags.length
      ? `&tags=${selectedTags.join(",")}`
      : "";
    const favQuery = favorite ? `&favorite=1` : "";
    const catQuery = !favorite && categoryId ? `&category=${categoryId}` : "";

    const res = await fetch(
      `/api/videos?limit=${PAGE_SIZE}&offset=${offset}${catQuery}${tagsQuery}${favQuery}`
    );

    const data = await res.json();

    setVideos(data);

    const isLastPage = data.length < PAGE_SIZE;
    setTotalCount(
      isLastPage ? (page - 1) * PAGE_SIZE + data.length : page * PAGE_SIZE + 1
    );
    setLoading(false);
  }, [page, selectedTags, categoryId, favorite]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <TagsFilter
        selectedTags={selectedTags}
        onChange={(tags) => {
          setPage(1);
          setSelectedTags(tags);
        }}
      />

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
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {totalPages > 1 && (
        <Stack alignItems="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            siblingCount={0}
            boundaryCount={2}
          />
        </Stack>
      )}
    </div>
  );
};

export default React.memo(CategoryPage);
