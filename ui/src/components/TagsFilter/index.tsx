import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Button, Menu } from "@mui/material";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tag } from "../../types";

type Props = {
  selectedTags: number[];
  onChange: (tags: number[]) => void;
};

const GAP = 8;
const MORE_BUTTON_RESERVED_WIDTH = 80;

const TagsFilter: React.FC<Props> = ({ selectedTags, onChange }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then(setTags)
      .catch(console.error);
  }, []);

  const toggleTag = (tagId: number) => {
    onChange(
      selectedTags.includes(tagId)
        ? selectedTags.filter((id) => id !== tagId)
        : [...selectedTags, tagId]
    );
  };

  useLayoutEffect(() => {
    if (!containerRef.current || !measureRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const buttons = Array.from(measureRef.current.children) as HTMLElement[];

    let usedWidth = 0;
    let count = 0;

    for (const btn of buttons) {
      usedWidth += btn.offsetWidth + GAP;
      if (usedWidth > containerWidth - MORE_BUTTON_RESERVED_WIDTH) break;
      count++;
    }

    setVisibleCount(count);
  }, [tags]);

  return (
    <>
      <div
        ref={measureRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          height: 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {tags.map((tag) => (
          <Button key={tag.id} size="small">
            {tag.name}
          </Button>
        ))}
      </div>

      <div
        ref={containerRef}
        style={{
          display: "flex",
          gap: GAP,
          width: "100%",
          overflow: "hidden",
          paddingBottom: 10,
        }}
      >
        {tags.slice(0, visibleCount).map((tag) => (
          <Button
            key={tag.id}
            size="small"
            variant={selectedTags.includes(tag.id) ? "contained" : "outlined"}
            onClick={() => toggleTag(tag.id)}
          >
            {tag.name}
          </Button>
        ))}

        {visibleCount < tags.length && (
          <>
            <Button
              size="small"
              endIcon={<ExpandMoreIcon />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              More
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  p: 1,
                  maxWidth: 320,
                }}
              >
                {tags.slice(visibleCount).map((tag) => (
                  <Button
                    key={tag.id}
                    size="small"
                    variant={
                      selectedTags.includes(tag.id) ? "contained" : "outlined"
                    }
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Button>
                ))}
              </Box>
            </Menu>
          </>
        )}
      </div>
    </>
  );
};

export default TagsFilter;
