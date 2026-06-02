import { useState } from "react";
import ImageGrid from "./components/ImageGrid";
import SearchBar from "./components/SearchBar";
import useDebounce from "./hooks/useDebounce";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  const [query, setQuery] = useState("nature");
  const [darkMode, setDarkMode] = useState(true);

  const debouncedQuery = useDebounce(query, 500);

  return (
    <>
      <Toaster position="top-right" />

      <div className={darkMode ? "app dark" : "app light"}>
        <div className="header">
          <h1 className="title">Image Gallery</h1>
          <p className="subtitle">Discover beautiful images</p>

          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <SearchBar onSearch={(value) => setQuery(value)} />

        <ImageGrid key={debouncedQuery} query={debouncedQuery} />
      </div>
    </>
  );
}

export default App;
