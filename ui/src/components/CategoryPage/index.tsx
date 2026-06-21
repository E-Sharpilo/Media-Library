import { Box, CircularProgress, Pagination, Stack } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Video } from "../../types";
import { getPageFromSearch, getTagsFromSearch } from "../../utils";
import TagsFilter from "../TagsFilter";
import VideoCard from "../VideoCard";

const PAGE_SIZE = 20;

interface CategoryPageProps {
  favorite?: boolean;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ favorite }) => {
  const { id: categoryId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(() => getPageFromSearch(searchParams));
  const [selectedTags, setSelectedTags] = useState<number[]>(() =>
    getTagsFromSearch(searchParams)
  );

  const updateSearch = useCallback(
    (nextPage: number, nextTags: number[]) => {
      const nextSearchParams = new URLSearchParams(searchParams);

      if (nextPage > 1) {
        nextSearchParams.set("page", String(nextPage));
      } else {
        nextSearchParams.delete("page");
      }

      if (nextTags.length > 0) {
        nextSearchParams.set("tags", nextTags.join(","));
      } else {
        nextSearchParams.delete("tags");
      }

      setSearchParams(nextSearchParams);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    setPage(getPageFromSearch(searchParams));
    setSelectedTags(getTagsFromSearch(searchParams));
  }, [searchParams]);

  const loadVideos = useCallback(async () => {
    setLoading(true);

    const offset = (page - 1) * PAGE_SIZE;
    const tagsQuery = selectedTags.length
      ? `&tags=${selectedTags.join(",")}`
      : "";
    const favQuery = favorite ? `&favorite=1` : "";
    const catQuery = !favorite && categoryId ? `&category=${categoryId}` : "";

    const res = await fetch(
      `/api/videos?includeTotal=1&limit=${PAGE_SIZE}&offset=${offset}${catQuery}${tagsQuery}${favQuery}`
    );

    const data: { videos: Video[]; total: number } = await res.json();

    setVideos(data.videos);
    setTotalCount(data.total);
    setLoading(false);
  }, [page, selectedTags, categoryId, favorite]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
      updateSearch(totalPages, selectedTags);
    }
  }, [page, selectedTags, totalPages, updateSearch]);

  return (
    <div>
      <TagsFilter
        selectedTags={selectedTags}
        onChange={(tags) => {
          setPage(1);
          setSelectedTags(tags);
          updateSearch(1, tags);
        }}
      />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
            xl: "repeat(5, 1fr)",
          },
          "& > *": { minWidth: 0 },
        }}
      >
        {videos.map((video) => (
          <div key={video.id}>
            <VideoCard video={video} />
          </div>
        ))}
      </Box>

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
            onChange={(_, value) => {
              setPage(value);
              updateSearch(value, selectedTags);
            }}
            siblingCount={0}
            boundaryCount={2}
          />
        </Stack>
      )}
    </div>
  );
};

export default React.memo(CategoryPage);
