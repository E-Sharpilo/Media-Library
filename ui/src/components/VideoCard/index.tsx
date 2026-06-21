import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Box,
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
    e.preventDefault();
    fetch(`/api/videos/play/${video.id}`);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const newValue = favorite ? 0 : 1;
    setFavorite(!favorite);

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
    <Card
      sx={{
        width: "100%",
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.16s ease, box-shadow 0.16s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 24px rgba(16, 24, 40, 0.12)",
        },
      }}
    >
      <CardActionArea onClick={() => navigate(`/videos/${video.id}`)}>
        <Box sx={{ position: "relative", aspectRatio: "16 / 9" }}>
          <CardMedia
            component="img"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              backgroundColor: "#eef2f6",
            }}
            image={
              video.thumbnail
                ? `/thumbnails/${video.thumbnail}`
                : "/assets/no-image.svg"
            }
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(16,24,40,0.44) 0%, rgba(16,24,40,0.05) 45%, rgba(16,24,40,0.34) 100%)",
              opacity: 0,
              transition: "opacity 0.16s ease",
              ".MuiCard-root:hover &": { opacity: 1 },
            }}
          />

          {video.category_name && (
            <Typography
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                maxWidth: "calc(100% - 54px)",
                px: 1,
                py: 0.25,
                fontSize: 12,
                fontWeight: 650,
                background: "rgba(16,24,40,0.74)",
                color: "white",
                borderRadius: 1,
                pointerEvents: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {video.category_name}
            </Typography>
          )}

          <IconButton
            onClick={toggleFavorite}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 34,
              height: 34,
              background: "rgba(16,24,40,0.74)",
              color: favorite ? "#facc15" : "white",
              backdropFilter: "blur(8px)",
              "&:hover": { background: "rgba(16,24,40,0.9)" },
            }}
          >
            {favorite ? (
              <FavoriteIcon fontSize="small" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
          </IconButton>

          <IconButton
            onClick={handlePlay}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 48,
              height: 48,
              transform: "translate(-50%, -50%) scale(0.96)",
              background: "rgba(255,255,255,0.94)",
              color: "#1d4ed8",
              boxShadow: "0 10px 24px rgba(16,24,40,0.22)",
              opacity: 0,
              transition: "opacity 0.16s ease, transform 0.16s ease",
              ".MuiCard-root:hover &": {
                opacity: 1,
                transform: "translate(-50%, -50%) scale(1)",
              },
              "&:hover": {
                background: "#ffffff",
              },
            }}
          >
            <PlayArrowIcon />
          </IconButton>
        </Box>

        <CardContent
          sx={{
            p: 1,
            height: 40,
            display: "flex",
            alignItems: "center",
            minWidth: 0,
            backgroundColor: "#ffffff",
          }}
        >
          <Typography variant="body2" noWrap sx={{ minWidth: 0, width: "100%" }}>
            {video.title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default memo(VideoCard);
