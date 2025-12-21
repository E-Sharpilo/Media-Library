import React, { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import ActorsPage from "./components/ActorsPage";
import HomePage from "./components/HomePage";
import NewVideosPage from "./components/NewVideosPage/NewVideosPage";

import "./App.css";
import ActorMainPage from "./components/ActorMainPage";
import AdminLeftBar from "./components/AdminLeftBar";
import CategoriesPage from "./components/CategoriesPage";
import CategoryPage from "./components/CategoryPage";
import Header from "./components/Header";
import LeftBar from "./components/LeftBar";
import TagsPage from "./components/TagsPage";
import VideoPage from "./components/VideoPage";

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
    if (isAdmin) {
      navigate("/");
    } else {
      navigate("/admin/actors");
    }
  };

  return (
    <div className="app-container">
      <Header isAdmin={isAdmin} toggleAdmin={toggleAdmin} />
      <div className="content-wrapper">
        {isAdmin ? <AdminLeftBar /> : <LeftBar />}
        <main className="main-content">
          <Routes>
            {isAdmin ? (
              <>
                <Route
                  path="/admin/actors"
                  element={<ActorsPage isAdminMode={isAdmin} />}
                />
                <Route path="/admin/tags" element={<TagsPage />} />
                <Route path="/admin/categories" element={<CategoriesPage />} />
                <Route path="/admin/new-videos" element={<NewVideosPage />} />
              </>
            ) : (
              <>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/actors"
                  element={<ActorsPage isAdminMode={isAdmin} />}
                />
                <Route path="/favorites" element={<CategoryPage favorite />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/actor/:id" element={<ActorMainPage />} />
                <Route path="/videos/:id" element={<VideoPage />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
