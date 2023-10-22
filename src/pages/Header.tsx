/* eslint-disable @typescript-eslint/no-explicit-any */
import { css } from "@emotion/css";
import { useNavigate } from "react-router-dom";

export default function Header({ clickBack }:any) {
  const navigate = useNavigate();
  return (
    <div
      className={css`
        padding: 2rem 1rem;
        display: flex;
        align-items: center;
      `}
    >
      {window.location.pathname === "/" ? null : (
        <button
          name="Back"
          onClick={() => {
            if (clickBack) {
              clickBack();
              return;
            }
            navigate("/");
          }}
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
            height={20}
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>
      )}

      <h4
        className={css`
          margin: 0;
          font-weight: bold;
          margin-right: auto;
          font-size: ${window.location.pathname == "/" ? "1.2rem" : "1rem"};
        `}
      >
        {window.location.pathname.includes("/add") &&
          !window.location.pathname.includes("/add/") &&
          "Add Contact"}
        {window.location.pathname.includes("/add/") && "Edit Contact"}
        {window.location.pathname == "/" && "Contact"}
        {window.location.pathname.includes("/detail") && "Detail Contact"}
      </h4>
      {window.location.pathname.includes("/add") ||
      window.location.pathname.includes("/detail") ? null : (
        <button
          name="Add"
          onClick={() => navigate("/add")}
          className={css`
            background-color: transparent;
            border: none;
            color: #00850b !important;
            background-color: white;
            border-radius: 50%;
            height: 2.3rem;
            width: 2.3rem;
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
