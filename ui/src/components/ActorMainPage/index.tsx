import { Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Actor, Video } from "../../types";
import VideoCard from "../VideoCard";
import "./ActorMainPage.css";

const ActorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [actor, setActor] = useState<Actor | null>(null);
  console.log("🚀 ~ ActorPage ~ actor:", actor);
  const [videos, setVideos] = useState<Video[]>([]);
  console.log("🚀 ~ ActorPage ~ videos:", videos);

  useEffect(() => {
    fetch(`/api/actors/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setActor(res.actor);
        setVideos(res.videos);
      });
  }, [id]);

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
          {videos.map((video) => (
            <Grid
              key={video.id}
              size={{
                sm: 3,
              }}
            >
              <VideoCard video={video} />
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default ActorPage;
