import { type FormEvent, useState } from "react";
import "../styles/SearchBar.css";

type Props = {
  onSearch: (query: string) => void;
};

function SearchBar({ onSearch }: Props) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSearch(text);
  }

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        className="search-input"
        type="text"
        value={text}
        placeholder="Search images..."
        onChange={(e) => setText(e.target.value)}
      />

      <button className="search-button" type="submit">
        Search
      </button>
    </form>
  );
}

export default SearchBar;
