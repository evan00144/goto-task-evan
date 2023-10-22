/* eslint-disable @typescript-eslint/no-explicit-any */
import { gql, useMutation, useQuery } from "@apollo/client";
import { css } from "@emotion/css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

export default function ContactListPage() {
  const [dataChanged, setDataChanged] = useState(false);
  // const [pagination, setPagination] = useState({
  //   limit: 0,
  //   offset: 0,
  // });
  const navigate = useNavigate();
  const [indexDelete, setIndexDelete] = useState<number | null>(null);
  const GET_CONTACT = gql`
    query GetConctactList {
      contact {
        created_at
        first_name
        id
        last_name
        phones {
          number
        }
      }
    }
  `;
  // query GetConctactList($limit: Int!, $offset: Int!) {
  //   contact(limit: $limit, offset: $offset) {
  //     created_at
  //     first_name
  //     id
  //     last_name
  //     phones {
  //       number
  //     }
  //   }
  // }

  const DELETE_CONTACT = gql`
    mutation delete_contact_by_pk($id: Int!) {
      delete_contact_by_pk(id: $id) {
        id
      }
    }
  `;

  const [delete_contact_by_pk, { data: deleteData }] = useMutation(
    DELETE_CONTACT,
    {
      refetchQueries: [GET_CONTACT, "GetConctactList"],
    }
  );

  useEffect(() => {
    if (!deleteData?.delete_contact_by_pk?.id) {
      if (indexDelete !== null) {
        console.log(123);
        const favorite = JSON.parse(localStorage.getItem("favorite") as string);
        favorite.splice(indexDelete, 1);
        localStorage.setItem("favorite", JSON.stringify(favorite));
        setDataChanged(!dataChanged);
        setIndexDelete(null);
      }
    }
  }, [deleteData, indexDelete, setDataChanged, dataChanged]);

  const deleteContact = useCallback(
    async (id: string, index: number | null = null) => {
      setIndexDelete(index);
      delete_contact_by_pk({
        variables: { id },
      });
    },
    [delete_contact_by_pk]
  );

  const navigateToEdit = useCallback(
    (id: string) => {
      navigate(`/add/${id}`);
    },
    [navigate]
  );

  const { loading, error, data } = useQuery(GET_CONTACT, {
    // variables: { ...pagination },
  });

  const renderData = useMemo(() => {
    const favorite = (localStorage.getItem("favorite") as string)
      ? JSON.parse(localStorage.getItem("favorite") as string)
      : null;
    let result = data?.contact;
    if (favorite) {
      result = result?.filter(
        (item: any) =>
          !favorite.some((favorite: any) => favorite.id === item.id)
      );
    }
    const groupedData: any = {};

    result?.forEach((item: any) => {
      const firstLetter =
        typeof item.first_name[0] === "string"
          ? item.first_name[0].toUpperCase()
          : item.first_name[0];
      if (!groupedData[firstLetter]) {
        groupedData[firstLetter] = [];
      }
      groupedData[firstLetter].push(item);
    });

    return (
      <>
        {Object.keys(groupedData).map((alphabet: any, index: number) => {
          return (
            <React.Fragment key={index}>
              <h2
                className={css`
                  margin: 0;
                  font-size: 1rem;
                `}
              >
                {alphabet}
              </h2>
              <div
                className={css`
                  background: white;
                  display: flex;
                  flex-direction: column;
                  border-radius: 0.8rem;
                  padding: 0rem 20px;
                `}
              >
                {result?.map((contact: any) => {
                  const firstLetter =
                    typeof contact.first_name[0] === "string"
                      ? contact.first_name[0].toUpperCase()
                      : contact.first_name[0];
                  if (firstLetter !==( typeof alphabet === "string"
                  ? alphabet.toUpperCase()
                  : alphabet)) return null;
                  return (
                    <React.Fragment key={contact?.id}>
                      <ContactCard
                        contact={contact}
                        setDataChanged={setDataChanged}
                        dataChanged={dataChanged}
                        onClickDelete={() => deleteContact(contact.id)}
                        navigateToEdit={() => navigateToEdit(contact.id)}
                      />
                    </React.Fragment>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </>
    );
  }, [data, dataChanged, deleteContact, navigateToEdit]);

  const renderFavorite = useMemo(() => {
    const favorite = (localStorage.getItem("favorite") as string)
      ? JSON.parse(localStorage.getItem("favorite") as string)
      : null;
    return (
      <>
        {favorite?.length > 0 && (
          <>
            <h2
              className={css`
                margin: 0;
                font-size: 1rem;
              `}
            >
              Favorites
            </h2>
            <div
              className={css`
                background: white;
                display: flex;
                flex-direction: column;
                border-radius: 0.8rem;
                padding: 0 20px;
              `}
            >
              {favorite?.map((contact: any, index: number) => (
                <React.Fragment key={contact?.id}>
                  <ContactCard
                    contact={contact}
                    setDataChanged={setDataChanged}
                    onClickDelete={() => deleteContact(contact.id, index)}
                    dataChanged={dataChanged}
                    navigateToEdit={() => navigateToEdit(contact.id)}
                  />
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </>
    );
  }, [dataChanged, deleteContact, navigateToEdit]);

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
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
          `}
        >
          {renderFavorite}
          {loading ? <p>Loading...</p> : renderData}
          {error && <p>Error :{error.message}</p>}
        </div>
      </div>
    </>
  );
}

// const Button = styled.button`
//   border: none;
//   border-radius: 0.8rem;
//   // padding: 0.2rem 0.4rem;
//   background-color: transparent;
//   line-height: 1;
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

const ContactCard = ({ contact }: any) => {
  const navigate = useNavigate();
  const favorite = JSON.parse(localStorage.getItem("favorite") as string);
  return (
    <div
      key={contact?.id}
      className={css`
        padding: 0.8rem 0;
        border-bottom: 2px solid #f7f7f7;
        height: 100%;
        display: flex;
        cursor: pointer;
        flex-direction: row;
        justify-content: between;
        align-items: center;
        &:last-child {
          border-bottom: none;
        }
      `}
      onClick={() => navigate(`/detail/${contact?.id}`)}
    >
      <div
        className={css`
          // circle
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background-color: #f7f7f7;
          color: #00850b !important;
          display: flex;
          justify-content: center;
          align-items: center;
          line-height: 1;
          text-transform: uppercase;
          font-weight: bold;
          margin-right: 0.5rem;
        `}
      >
        <span>{contact?.first_name[0]}</span>
        <span>{contact?.last_name[0]}</span>
      </div>
      <div
        className={css`
          font-size: 14px;
        `}
      >
        <div
          className={css`
            font-weight: bold;
            margin-bottom: 0.2rem;
            text-transform: capitalize;
          `}
        >
          <span>{contact?.first_name}</span> <span>{contact?.last_name}</span>
        </div>
        <div
          className={css`
            font-size: 0.7rem;
            font-weight: 300;
          `}
        >
          {contact?.phones[0]?.number || "No phone number"}
        </div>
      </div>
      {/* <Button
        name="Edit"
        className={css`
          margin-left: auto;
        `}
        onClick={navigateToEdit}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={css`
            width: 1rem;
            height: 1rem;
          `}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
      </Button>
      <Button
        name="Delete"
        className={css`
          margin-left: 0.5rem;
        `}
        onClick={onClickDelete}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={css`
            width: 1rem;
            height: 1rem;
          `}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      </Button>*/}
      {favorite?.find((item: any) => item.id === contact.id) && (
        <button
          name="Favorite"
          className={css`
            margin-left: auto;
            border: none;
            border-radius: 0.8rem;
            background-color: transparent;
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={css`
              width: 1.2rem;
              height: 1.2rem;
              color: #f59e0b;
            `}
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
