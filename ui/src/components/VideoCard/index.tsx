import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video } from "../../types";

type Props = {
  video: Video;
};

const VideoCard: React.FC<Props> = ({ video }) => {
  const navigate = useNavigate();
  const [favorite, setFavorite] = useState(!!video.favorite);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetch(`/api/videos/play/${video.id}`);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const newValue = favorite ? 0 : 1;
    setFavorite(!favorite); // optimistic UI

    try {
      await fetch(`/api/videos/${video.id}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: newValue }),
      });
    } catch {
      setFavorite(favorite);
    }
  };

  return (
    <Card sx={{ width: "100%", position: "relative" }}>
      <CardActionArea onClick={() => navigate(`/videos/${video.id}`)}>
        <CardMedia
          component="img"
          sx={{ aspectRatio: "16 / 9" }}
          image={
            video.thumbnail
              ? `/thumbnails/${video.thumbnail}`
              : "/assets/no-image.svg"
          }
        />
        <CardContent
          sx={{
            p: 1,
            height: 40,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" noWrap>
            {video.title}
          </Typography>
        </CardContent>
      </CardActionArea>

      {video.category_name && (
        <Typography
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            px: 1,
            py: 0.25,
            fontSize: 12,
            background: "rgba(0,0,0,0.65)",
            color: "white",
            borderRadius: 1,
            pointerEvents: "none",
          }}
        >
          {video.category_name}
        </Typography>
      )}

      {/* ▶ Play */}
      <IconButton
        onClick={handlePlay}
        sx={{
          position: "absolute",
          bottom: 8,
          right: 8,
          background: "rgba(0,0,0,0.6)",
          color: "white",
          "&:hover": { background: "rgba(0,0,0,0.8)" },
        }}
      >
        <PlayArrowIcon />
      </IconButton>

      <IconButton
        onClick={toggleFavorite}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "rgba(0,0,0,0.6)",
          color: favorite ? "yellow" : "white",
          "&:hover": { background: "rgba(0,0,0,0.8)" },
        }}
      >
        {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Card>
  );
};

export default memo(VideoCard);
