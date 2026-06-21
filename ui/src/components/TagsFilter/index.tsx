import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Button, Menu } from "@mui/material";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Tag } from "../../types";

type Props = {
  selectedTags: number[];
  onChange: (tags: number[]) => void;
};

const GAP = 8;
const RIGHT_SAFE_AREA = 36;

const TagsFilter: React.FC<Props> = ({ selectedTags, onChange }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreMeasureRef = useRef<HTMLButtonElement>(null);

  const buttonSx = {
    minWidth: "auto",
    flexShrink: 0,
    whiteSpace: "nowrap",
    px: 1.25,
  } as const;

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

  const updateVisibleTags = useCallback(() => {
    if (!containerRef.current || !measureRef.current) return;

    const containerWidth = Math.max(
      0,
      containerRef.current.clientWidth - RIGHT_SAFE_AREA
    );
    const buttons = Array.from(measureRef.current.children).slice(
      0,
      tags.length
    ) as HTMLElement[];
    const moreButtonWidth = moreMeasureRef.current?.offsetWidth || 96;

    const getFitCount = (availableWidth: number) => {
      let usedWidth = 0;
      let count = 0;

      for (const btn of buttons) {
        const nextWidth = usedWidth + btn.offsetWidth + (count > 0 ? GAP : 0);
        if (nextWidth > availableWidth) break;

        usedWidth = nextWidth;
        count++;
      }

      return count;
    };

    const countWithoutMore = getFitCount(containerWidth);

    setVisibleCount(
      countWithoutMore >= tags.length
        ? tags.length
        : getFitCount(containerWidth - moreButtonWidth - GAP)
    );
  }, [tags.length]);

  useLayoutEffect(() => {
    updateVisibleTags();

    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(updateVisibleTags);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [tags, updateVisibleTags]);

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
          <Button key={tag.id} size="small" sx={buttonSx}>
            {tag.name}
          </Button>
        ))}
        <Button
          ref={moreMeasureRef}
          size="small"
          sx={buttonSx}
          endIcon={<ExpandMoreIcon />}
        >
          More
        </Button>
      </div>

      <div
        ref={containerRef}
        style={{
          display: "flex",
          alignItems: "center",
          gap: GAP,
          width: "100%",
          paddingRight: RIGHT_SAFE_AREA,
          height: 36,
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        {tags.slice(0, visibleCount).map((tag) => (
          <Button
            key={tag.id}
            size="small"
            sx={buttonSx}
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
              sx={buttonSx}
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
                  maxHeight: "50vh",
                  overflowY: "auto",
                }}
              >
                {tags.slice(visibleCount).map((tag) => (
                  <Button
                    key={tag.id}
                    size="small"
                    sx={buttonSx}
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
