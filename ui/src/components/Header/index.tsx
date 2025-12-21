import React from "react";
import SyncButton from "../SyncButton";
import "./Header.css";
interface HeaderProps {
  isAdmin: boolean;
  toggleAdmin: () => void;
}
const Header: React.FC<HeaderProps> = ({ isAdmin, toggleAdmin }) => {
  return (
    <header className="app-header">
      {isAdmin && <SyncButton />}
      <button className="admin-toggle" onClick={toggleAdmin}>
        ⚙️ {isAdmin ? "Exit Admin" : "Admin Mode"}{" "}
      </button>
    </header>
  );
};

export default Header;
