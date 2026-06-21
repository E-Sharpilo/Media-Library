import { Box, CircularProgress } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
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
  const observerRef = useRef<HTMLDivElement | null>(null);

  const loadVideos = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;
    setLoading(true);

    const params = new URLSearchParams();
    params.append("limit", PAGE_SIZE.toString());
    params.append("offset", reset ? "0" : offsetRef.current.toString());
    if (categoryId) params.append("category", categoryId.toString());
    if (selectedTags.length > 0) params.append("tags", selectedTags.join(","));

    try {
      const res = await fetch(`/api/videos?${params.toString()}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Expected array from API but got:", data);
        setVideos([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      setVideos((prev) => (reset ? data : [...prev, ...data]));
      offsetRef.current = reset ? data.length : offsetRef.current + data.length;
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => loadVideos(true), 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags, categoryId]);

  // infinite scroll
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadVideos();
      },
      { rootMargin: "200px" }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags, categoryId]);

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
        {videos.map((video, index) => {
          const isLast = index === videos.length - 1;
          return (
            <div key={video.id} ref={isLast ? observerRef : null}>
              <VideoCard video={video} />
            </div>
          );
        })}
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
