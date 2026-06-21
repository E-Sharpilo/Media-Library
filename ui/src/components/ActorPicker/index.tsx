import {
  Autocomplete,
  Avatar,
  Box,
  Chip,
  ChipProps,
  TextField,
  Tooltip,
} from "@mui/material";
import React from "react";
import { Actor } from "../../types";

type Props = {
  label: string;
  options: Actor[];
  value: Actor[];
  onChange: (actors: Actor[]) => void;
};

const getActorPhoto = (actor: Actor) =>
  actor.photo ? `/actors_photos/${actor.photo}` : "/assets/no-image.svg";

const ActorPhotoPreview: React.FC<{ actor: Actor }> = ({ actor }) => (
  <Box
    component="img"
    src={getActorPhoto(actor)}
    alt={actor.name}
    sx={{
      width: 160,
      height: 220,
      objectFit: "cover",
      display: "block",
      borderRadius: 1,
      backgroundColor: "#eeeeee",
    }}
  />
);

type ActorChipProps = Omit<ChipProps, "avatar" | "label" | "size"> & {
  actor: Actor;
};

const ActorChip: React.FC<ActorChipProps> = ({ actor, ...chipProps }) => (
  <Tooltip title={<ActorPhotoPreview actor={actor} />} arrow placement="top">
    <Chip
      avatar={<Avatar src={getActorPhoto(actor)} alt={actor.name} />}
      label={actor.name}
      size="small"
      sx={{ maxWidth: 180 }}
      {...chipProps}
    />
  </Tooltip>
);

const ActorPicker: React.FC<Props> = ({ label, options, value, onChange }) => {
  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={options}
      value={value}
      getOptionLabel={(actor) => actor.name}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      onChange={(_, actors) => onChange(actors)}
      renderOption={(props, actor) => (
        <Box component="li" {...props} sx={{ gap: 1.5 }}>
          <Avatar
            src={getActorPhoto(actor)}
            alt={actor.name}
            variant="rounded"
            sx={{ width: 42, height: 56, flexShrink: 0 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {actor.name}
            </Box>
          </Box>
        </Box>
      )}
      renderTags={(actors, getTagProps) =>
        actors.map((actor, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return <ActorChip key={key} actor={actor} {...tagProps} />;
        })
      }
      renderInput={(params) => <TextField {...params} label={label} size="small" />}
    />
  );
};

export default React.memo(ActorPicker);
export { ActorChip };
