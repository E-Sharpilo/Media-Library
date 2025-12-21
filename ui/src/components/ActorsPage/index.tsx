import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const ActorsPage: React.FC<Props> = ({ isAdminMode }) => {
  const [actors, setActors] = useState<Actor[]>([]);
  const [filteredActors, setFilteredActors] = useState<Actor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeActor, setActiveActor] = useState<Actor | null>(null);

  const navigate = useNavigate();

  const deleteActor = async (id: number) => {
    if (!window.confirm("Delete actor permanently?")) return;

    const res = await fetch(`/api/actors/${id}`, {
      method: "DELETE",
    });

    if (res.ok) loadActors();
  };

  const loadActors = () => {
    fetch("/api/actors")
      .then((r) => r.json())
      .then((data: Actor[]) => {
        setActors(data);
        setFilteredActors(data);
      });
  };

  useEffect(() => {
    loadActors();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredActors(actors);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredActors(
        actors.filter((actor) => actor.name.toLowerCase().includes(term))
      );
    }
  }, [searchTerm, actors]);

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
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "25%",
          marginBottom: "16px",
          padding: "8px",
          fontSize: "14px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />

      <div className="actors-grid">
        {filteredActors.map((actor) => (
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
