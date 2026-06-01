import { useState } from "react";
import ImageGrid from "./components/ImageGrid";
import SearchBar from "./components/SearchBar";
import useDebounce from "./hooks/useDebounce";
import "./App.css";

function App() {
  const [query, setQuery] = useState("nature");
  const debouncedQuery = useDebounce(query, 500);

  return (
    <div className="App">
      <h1>Image Gallery</h1>
      <SearchBar onSearch={(value) => setQuery(value)} />
      <ImageGrid key={debouncedQuery} query={debouncedQuery} />
    </div>
  );
}

export default App;
