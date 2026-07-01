import { Box, CircularProgress } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Video } from "../../types";
import TagsFilter from "../TagsFilter";
import VideoCard from "../VideoCard";

const PAGE_SIZE = 30;

type Props = {
  categoryId?: number;
};

const VideosPage: React.FC<Props> = ({ categoryId }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const loadVideos = useCallback(
    async (reset = false) => {
      if (loadingRef.current || (!hasMoreRef.current && !reset)) return;

      loadingRef.current = true;
      setLoading(true);

      const params = new URLSearchParams();
      params.append("limit", PAGE_SIZE.toString());
      params.append("offset", reset ? "0" : offsetRef.current.toString());
      if (categoryId) params.append("category", categoryId.toString());
      if (selectedTags.length > 0)
        params.append("tags", selectedTags.join(","));

      try {
        const res = await fetch(`/api/videos?${params.toString()}`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Expected array from API but got:", data);
          setVideos([]);
          setHasMore(false);
          return;
        }

        setVideos((prev) => (reset ? data : [...prev, ...data]));
        offsetRef.current = reset
          ? data.length
          : offsetRef.current + data.length;
        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        console.error(err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [categoryId, selectedTags],
  );

  useEffect(() => {
    offsetRef.current = 0;
    setVideos([]);
    setHasMore(true);

    const id = window.setTimeout(() => {
      void loadVideos(true);
    }, 250);

    return () => window.clearTimeout(id);
  }, [categoryId, loadVideos, selectedTags]);

  // infinite scroll
  useEffect(() => {
    const target = observerRef.current;
    if (!target || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadVideos();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [categoryId, hasMore, loadVideos, loading, selectedTags]);

  return (
    <>
      <TagsFilter selectedTags={selectedTags} onChange={setSelectedTags} />

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

      {hasMore && (
        <div
          ref={observerRef}
          style={{ display: "flex", justifyContent: "center", padding: 32 }}
        >
          {loading && <CircularProgress />}
        </div>
      )}
    </>
  );
};

export default React.memo(VideosPage);
