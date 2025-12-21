import { Grid, Pagination, Stack } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Actor, Video } from "../../types";
import VideoCard from "../VideoCard";
import "./ActorMainPage.css";

const ITEMS_PER_PAGE = 12; // 3 rows x 4 cards

const ActorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [actor, setActor] = useState<Actor | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/actors/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setActor(res.actor);
        setVideos(res.videos);
        setPage(1); // скидаємо сторінку при зміні актора
      });
  }, [id]);

  const pageCount = Math.ceil(videos.length / ITEMS_PER_PAGE);

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
              onChange={(_, value) => setPage(value)}
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
