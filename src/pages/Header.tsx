import { css } from "@emotion/css";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  return (
    <div
      className={css`
        padding: 1rem 1rem;
        border-bottom: 1px solid #ddd;
        display: flex;
        align-items: center;
      `}
    >
      {window.location.pathname ==="/" ? null : (
        <button
          name="Back"
          onClick={() => navigate("/")}
          className={css`
            background-color: transparent;
            border: none;
            margin-right: 1rem;
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={css`
              width: 1.5rem;
              height: 1.5rem;
            `}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
            />
          </svg>
        </button>
      )}

      <h1
        className={css`
          margin: 0;
          margin-right: auto;
        `}
      >
        Header
      </h1>
      {window.location.pathname.includes("/add") ? null : (
        <button
          name="Add"
          onClick={() => navigate("/add")}
          className={css`
            background-color: transparent;
            border: none;
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={css`
              width: 2rem;
              height: 2rem;
            `}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
