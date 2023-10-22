/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";
import { css } from "@emotion/css";
import Header from "./Header";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";

export default function DetailContactPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const GET_CONTACT = gql`
    query GetContactDetail($id: Int!) {
      contact_by_pk(id: $id) {
        last_name
        id
        first_name
        created_at
        phones {
          number
        }
      }
    }
  `;
  const { data } = useQuery(GET_CONTACT, {
    variables: { id },
  });

  const [dataChanged, setDataChanged] = useState(false);
  const favorite = JSON.parse(localStorage.getItem("favorite") as string);
  const addToFavorite = useCallback(
    (contact: any) => {
      setDataChanged(!dataChanged);
      const favorite = JSON.parse(localStorage.getItem("favorite") as string);
      if (favorite) {
        const exist = favorite.find((item: any) => item.id === contact.id);
        if (!exist) {
          localStorage.setItem(
            "favorite",
            JSON.stringify([...favorite, contact])
          );
        } else {
          localStorage.setItem(
            "favorite",
            JSON.stringify(
              favorite.filter((item: any) => item.id !== contact.id)
            )
          );
        }
      } else {
        localStorage.setItem("favorite", JSON.stringify([contact]));
      }
    },
    [dataChanged]
  );
  const renderFavorite = useMemo(() => {
    return (
      <div onClick={() => addToFavorite(data?.contact_by_pk)}>
        {favorite &&
        favorite?.find((item: any) => item.id === data?.contact_by_pk?.id) ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            height={32}
            className={css`
              color: #ffba08;
            `}
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            height={32}
            className={css`
              color: #ffba08;
            `}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        )}
      </div>
    );
  }, [addToFavorite, data?.contact_by_pk, favorite]);

  const DELETE_CONTACT = gql`
    mutation delete_contact_by_pk($id: Int!) {
      delete_contact_by_pk(id: $id) {
        id
      }
    }
  `;
  const [delete_contact_by_pk] = useMutation(
    DELETE_CONTACT,
    {
      refetchQueries: [GET_CONTACT, "GetConctactList"],
    }
  );

  const deleteContact = useCallback(
    async (id: string | null = null) => {
      const confirm = window.confirm("Are you sure to delete this contact?");
      if (!confirm) return;
      const favorite = (localStorage.getItem("favorite") as string)
        ? JSON.parse(localStorage.getItem("favorite") as string)
        : null;
      if (favorite) {
        localStorage.setItem(
          "favorite",
          JSON.stringify(
            favorite.filter((item: any) => item.id !== data?.contact_by_pk?.id)
          )
        );
      }
      delete_contact_by_pk({
        variables: { id },
      });
      window.location.href = "/";
    },
    [delete_contact_by_pk, data?.contact_by_pk?.id]
  );

  return (
    <>
      <Header />
      <div
        className={css`
          padding: 0 1rem 1rem 1rem;
        `}
      >
        <div
          className={css`
            background: white;
            display: flex;
            flex-direction: column;
            border-radius: 0.8rem;
            padding: 1.25rem;
          `}
        >
          <div
            className={css`
              display: flex;
              justify-content: space-between;
            `}
          >
            <div
              className={css`
                // circle
                width: 4rem;
                height: 4rem;
                border-radius: 50%;
                background-color: #f7f7f7;
                color: #00850b !important;
                display: flex;
                justify-content: center;
                align-items: center;
                line-height: 1;
                font-size: 1.5rem;
                text-transform: uppercase;
                font-weight: bold;
                margin-right: 0.5rem;
              `}
            >
              <span>{data?.contact_by_pk?.first_name[0]}</span>
              <span>{data?.contact_by_pk?.last_name[0]}</span>
            </div>
            {renderFavorite}
          </div>
          <h4
            className={css`
              text-transform: capitalize;
              margin-bottom: 0.5rem;
            `}
          >
            {data?.contact_by_pk?.first_name} {data?.contact_by_pk?.last_name}
          </h4>
          {/* phone */}
          {data?.contact_by_pk?.phones.length <= 0 && "No Phone Number"}
          {data?.contact_by_pk?.phones.map((phone: any, index: number) => (
            <div
              key={index}
              className={css`
                display: flex;
                align-items: center;
                margin-bottom: 0.5rem;
              `}
            >
              {phone.number}
            </div>
          ))}
        </div>
        <div
          className={css`
            background: white;
            display: flex;
            flex-direction: column;
            margin-top: 1rem;
            border-radius: 0.8rem;
            padding: 0 1.25rem;
          `}
        >
          <div
            onClick={() => navigate(`/add/${id}`)}
            className={css`
              padding: 0.8rem 0;
              border-bottom: 2px solid #f7f7f7;
              height: 100%;
              display: flex;
              cursor: pointer;
              flex-direction: row;
              justify-content: between;
              align-items: center;
              font-weight: bold;
              &:last-child {
                border-bottom: none;
              }
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              height={20}
              width={20}
              strokeWidth="1.5"
              stroke="currentColor"
              className={css`
                color: #00850b !important;
                margin-right: 0.5rem;
              `}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            Edit
          </div>
          <div
            onClick={() => deleteContact(id as string)}
            className={css`
              padding: 0.8rem 0;
              border-bottom: 2px solid #f7f7f7;
              height: 100%;
              display: flex;
              cursor: pointer;
              flex-direction: row;
              justify-content: between;
              align-items: center;
              font-weight: bold;
              &:last-child {
                border-bottom: none;
              }
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              height={20}
              width={20}
              strokeWidth={1.5}
              stroke="currentColor"
              className={css`
                color: #9e0e18;
                margin-right: 0.5rem;
              `}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            Delete
          </div>
        </div>
      </div>
    </>
  );
}
