import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./LeftBar.css";

interface Category {
  id: number;
  display_name: string;
}

const LeftBar: React.FC = () => {
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  const getActive = (path: string) => {
    if (location.pathname === "/" && path === "home") return true;
    if (location.pathname === "/favorites" && path === "favorites") return true;
    if (location.pathname === "/actors" && path === "actors") return true;
    if (location.pathname.startsWith("/category") && path.startsWith("cat-")) {
      return location.pathname === `/category/${path.split("-")[1]}`;
    }
    return false;
  };

  return (
    <nav className="leftbar">
      <ul className="leftbar-list">
        <li className={getActive("home") ? "active" : ""}>
          <Link to="/">Home</Link>
        </li>
        <li className={getActive("favorites") ? "active" : ""}>
          <Link to="/favorites">Favorites</Link>
        </li>
        <li className={getActive("actors") ? "active" : ""}>
          <Link to="/actors">Actors</Link>
        </li>

        <li className="categories-title">Categories</li>
        {categories.map((cat) => (
          <li
            key={cat.id}
            className={getActive(`cat-${cat.id}`) ? "active" : ""}
          >
            <Link to={`/category/${cat.id}`}>{cat.display_name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default React.memo(LeftBar);
