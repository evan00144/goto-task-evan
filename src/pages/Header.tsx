/* eslint-disable @typescript-eslint/no-explicit-any */
import { css } from "@emotion/css";
import { useNavigate } from "react-router-dom";

export default function Header({handleSubmit}:any) {
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
          onClick={() => navigate(-1)}
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
        {window.location.pathname.includes("/add") &&! window.location.pathname.includes("/add/") &&"Add Contact"}
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
      {window.location.pathname.includes("/add") &&(

         <button onClick={handleSubmit} className={
          css`
            background-color: white;
            border-radius: 50%;
            height: 2rem;
            width: 2rem;
          `
         }>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              height={24}
              className=
              {
                css`
                  color: #00850b;
                `
              }
            >
              <path
                fillRule="evenodd"
                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                clipRule="evenodd"
              />
            </svg>
          </button>
      )}
    </div>
  );
}
