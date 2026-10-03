import { Link } from "react-router-dom";

export default function Brand() {
  return (
    <Link to="/" className="brand" aria-label="ShotNode home">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M8 8h7v7H8zM17 17h7v7h-7z" fill="currentColor" />
          <path
            d="m13 12 7 8M21 8v5M8 21h5"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <circle cx="23" cy="8" r="3" fill="currentColor" />
          <circle cx="8" cy="23" r="3" fill="currentColor" />
        </svg>
      </span>
      ShotNode<span className="brand-period">®</span>
    </Link>
  );
}
