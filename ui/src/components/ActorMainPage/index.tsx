import { Grid, Pagination, Stack } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Actor, Video } from "../../types";
import { getPageFromSearch } from "../../utils";
import VideoCard from "../VideoCard";
import "./ActorMainPage.css";

const ITEMS_PER_PAGE = 12;

const ActorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [actor, setActor] = useState<Actor | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(() => getPageFromSearch(searchParams));

  useEffect(() => {
    fetch(`/api/actors/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setActor(res.actor);
        setVideos(res.videos);
      });
  }, [id]);

  useEffect(() => {
    setPage(getPageFromSearch(searchParams));
  }, [searchParams]);

  const pageCount = Math.ceil(videos.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (pageCount > 0 && page > pageCount) {
      const nextPage = pageCount;
      setPage(nextPage);
      setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {});
    }
  }, [page, pageCount, setSearchParams]);

  const paginatedVideos = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return videos.slice(start, start + ITEMS_PER_PAGE);
  }, [videos, page]);

  if (!actor) return <p>Loading...</p>;

  return (
    <div className="actor-page">
      <div className="actor-header">
        <img
          className="actor-photo"
          src={`/actors_photos/${actor.photo}`}
          alt={actor.name}
          width={360}
          height={520}
          loading="eager"
          decoding="async"
        />
        <div className="actor-info">
          <h2>{actor.name}</h2>
          <p>{actor.description}</p>
        </div>
      </div>

      <div className="actor-videos">
        <h3>Films featuring {actor.name}</h3>

        <Grid container spacing={2}>
          {paginatedVideos.map((video) => (
            <Grid key={video.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <VideoCard video={video} />
            </Grid>
          ))}
        </Grid>

        {pageCount > 1 && (
          <Stack alignItems="center" mt={4}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, value) => {
                setPage(value);
                setSearchParams(value > 1 ? { page: String(value) } : {});
              }}
              color="primary"
              shape="rounded"
            />
          </Stack>
        )}
      </div>
    </div>
  );
};

export default ActorPage;
