import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Tag } from "../../types";

type Props = {
  selectedTags: number[];
  onChange: (tags: number[]) => void;
  maxVisible?: number;
};

const TagsFilter: React.FC<Props> = ({
  selectedTags,
  onChange,
  maxVisible = 5,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then(setTags)
      .catch(console.error);
  }, []);

  const toggleTag = (tagId: number) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    onChange(newTags);
  };

  return (
    <div
      style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8 }}
    >
      {tags.slice(0, maxVisible).map((tag) => (
        <Button
          key={tag.id}
          variant={selectedTags.includes(tag.id) ? "contained" : "outlined"}
          size="small"
          onClick={() => toggleTag(tag.id)}
        >
          {tag.name}
        </Button>
      ))}

      {tags.length > maxVisible && (
        <Accordion sx={{ minWidth: 120 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">More...</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tags.slice(maxVisible).map((tag) => (
              <Button
                key={tag.id}
                variant={
                  selectedTags.includes(tag.id) ? "contained" : "outlined"
                }
                size="small"
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
              </Button>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </div>
  );
};

export default TagsFilter;
