import React from "react";
import { Link } from "react-router-dom";


const AdminLeftBar: React.FC = () => {
  return (
    <nav className="leftbar">
      <ul className="leftbar-list">
        <li>
          <Link to="/admin/actors">Actors</Link>
        </li>
        <li>
          <Link to="/admin/tags">Tags</Link>
        </li>
        <li>
          <Link to="/admin/categories">Categories</Link>
        </li>
        <li>
          <Link to="/admin/new-videos">New Videos</Link>
        </li>
      </ul>
    </nav>
  );
};

export default AdminLeftBar;
