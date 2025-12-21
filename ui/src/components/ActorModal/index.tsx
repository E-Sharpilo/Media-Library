import React, { useState } from "react";
import "./ActorModal.css";

type Actor = {
  id?: number;
  name: string;
  description?: string;
  photo?: string;
};

type Props = {
  actor?: Actor;
  onClose: () => void;
  onSaved: () => void;
};

const ActorModal: React.FC<Props> = ({ actor, onClose, onSaved }) => {
  const [name, setName] = useState(actor?.name || "");
  const [description, setDescription] = useState(actor?.description || "");
  const [photo, setPhoto] = useState<File | null>(null);

  const isEdit = Boolean(actor?.id);

  const handleSave = async () => {
    if (!name) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (photo) formData.append("photo", photo);

    const res = await fetch(
      isEdit ? `/api/actors/${actor!.id}` : "/api/actors",
      {
        method: isEdit ? "PUT" : "POST",
        body: formData,
      }
    );

    if (res.ok) {
      onSaved();
      onClose();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{isEdit ? "Edit actor" : "Add actor"}</h3>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
        />

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button className="primary-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ActorModal);
