import { Pagination, Stack } from "@mui/material";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPageFromSearch } from "../../utils";
import ActorModal from "../ActorModal";
import "./ActorsPage.css";

type Actor = {
  id: number;
  name: string;
  description?: string;
  photo?: string;
};

type Props = {
  isAdminMode: boolean;
};

const CARD_MIN_WIDTH = 180;
const CARD_HEIGHT = 270;
const GRID_GAP = 16;
const PAGINATION_RESERVED_HEIGHT = 64;

const ActorsPage: React.FC<Props> = ({ isAdminMode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(() => getPageFromSearch(searchParams));
  const [pageSize, setPageSize] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("search") || ""
  );
  const [activeActor, setActiveActor] = useState<Actor | null>(null);

  const navigate = useNavigate();

  const updateSearch = useCallback(
    (nextPage: number, nextSearchTerm: string) => {
      const nextSearchParams = new URLSearchParams();
      const trimmedSearch = nextSearchTerm.trim();

      if (nextPage > 1) {
        nextSearchParams.set("page", String(nextPage));
      }

      if (trimmedSearch) {
        nextSearchParams.set("search", trimmedSearch);
      }

      setSearchParams(nextSearchParams);
    },
    [setSearchParams]
  );

  const deleteActor = async (id: number) => {
    if (!window.confirm("Delete actor permanently?")) return;

    const res = await fetch(`/api/actors/${id}`, {
      method: "DELETE",
    });

    if (res.ok) loadActors();
  };

  const loadActors = useCallback(() => {
    if (!pageSize) return;

    const params = new URLSearchParams({
      limit: String(pageSize),
      offset: String((page - 1) * pageSize),
    });

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    fetch(`/api/actors?${params.toString()}`)
      .then((r) => r.json())
      .then((data: { actors: Actor[]; total: number }) => {
        setActors(data.actors);
        setTotalCount(data.total);
      });
  }, [page, pageSize, searchTerm]);

  const updatePageSize = useCallback(() => {
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const availableWidth = gridRef.current.clientWidth;
    const availableHeight = Math.max(
      CARD_HEIGHT,
      window.innerHeight - rect.top - PAGINATION_RESERVED_HEIGHT
    );

    const columns = Math.max(
      1,
      Math.floor((availableWidth + GRID_GAP) / (CARD_MIN_WIDTH + GRID_GAP))
    );
    const rows = Math.max(
      1,
      Math.floor((availableHeight + GRID_GAP) / (CARD_HEIGHT + GRID_GAP))
    );

    const nextPageSize = columns * rows;
    setPageSize((currentPageSize) =>
      currentPageSize === nextPageSize ? currentPageSize : nextPageSize
    );
  }, []);

  useLayoutEffect(() => {
    updatePageSize();

    if (!gridRef.current) return;

    const resizeObserver = new ResizeObserver(updatePageSize);
    resizeObserver.observe(gridRef.current);
    window.addEventListener("resize", updatePageSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePageSize);
    };
  }, [updatePageSize]);

  useEffect(() => {
    loadActors();
  }, [loadActors]);

  useEffect(() => {
    setPage(getPageFromSearch(searchParams));
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  const totalPages = pageSize ? Math.ceil(totalCount / pageSize) : 0;

  useEffect(() => {
    if (pageSize && totalPages > 0 && page > totalPages) {
      setPage(totalPages);
      updateSearch(totalPages, searchTerm);
    }
  }, [page, pageSize, searchTerm, totalPages, updateSearch]);

  return (
    <div className="actors-page">
      <div className="actors-header">
        <h2>Actors</h2>

        {isAdminMode && (
          <button
            className="primary-btn"
            onClick={() =>
              setActiveActor({ name: "", description: "" } as Actor)
            }
          >
            + Add actor
          </button>
        )}
      </div>

      <input
        className="search"
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => {
          const nextSearchTerm = e.target.value;
          setPage(1);
          setSearchTerm(nextSearchTerm);
          updateSearch(1, nextSearchTerm);
        }}
        style={{
          width: "25%",
          marginBottom: "16px",
          padding: "8px",
          fontSize: "14px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />

      <div className="actors-grid" ref={gridRef}>
        {actors.map((actor) => (
          <div
            key={actor.id}
            className="actor-card"
            onClick={() => !isAdminMode && navigate(`/actor/${actor.id}`)}
          >
            <img
              src={
                actor.photo
                  ? `/actors_photos/${actor.photo}`
                  : "/assets/no-image.svg"
              }
              alt={actor.name}
              width={220}
              height={190}
              loading="eager"
              decoding="async"
            />

            <div className="actor-info">
              <strong>{actor.name}</strong>

              {isAdminMode && (
                <div className="actor-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveActor(actor);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteActor(actor.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {pageSize && totalPages > 1 && (
        <Stack alignItems="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => {
              setPage(value);
              updateSearch(value, searchTerm);
            }}
            siblingCount={0}
            boundaryCount={2}
          />
        </Stack>
      )}

      {activeActor && (
        <ActorModal
          actor={activeActor.id ? activeActor : undefined}
          onClose={() => setActiveActor(null)}
          onSaved={loadActors}
        />
      )}
    </div>
  );
};

export default React.memo(ActorsPage);
