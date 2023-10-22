/* eslint-disable @typescript-eslint/no-explicit-any */
import { gql, useMutation, useQuery } from "@apollo/client";
import { css } from "@emotion/css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { styled } from "styled-components";
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
    const localData =
      (localStorage.getItem("localData") as string) !== undefined
        ? JSON.parse(localStorage.getItem("localData") as string)
        : null;
    if (localData) {
      if (data) {
        const tempData = data?.contact?.filter((item: any) =>
          !localData?.some((local: any) => local.id === item.id)
        );
        console.log(tempData)
        const result = [...tempData, ...localData];
        localStorage.setItem("localData", JSON.stringify(result));
      }
    } else {
      if (data) {
        localStorage.setItem("localData", JSON.stringify(data?.contact));
      }
    }
    const favorite = (localStorage.getItem("favorite") as string)
      ? JSON.parse(localStorage.getItem("favorite") as string)
      : null;
    let result = (localStorage.getItem("localData") as string) !== undefined
    ? JSON.parse(localStorage.getItem("localData") as string)
    : null;
    if (favorite) {
      result = result?.filter(
        (item: any) =>
          !favorite.some((favorite: any) => favorite.id === item.id)
      );
    }
    return (
      <>
        {favorite?.length > 0 && (
          <h2
            className={css`
              margin: 0;
              font-size: 1rem;
            `}
          >
            Favorites
          </h2>
        )}
        <div
          className={css`
            background: white;
            display: flex;
            flex-direction: column;
            border-radius: 0.8rem;
            padding: 0.5rem 20px;
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

        <h2
          className={css`
            margin-bottom: 0;
            font-size: 1rem;
          `}
        >
          Regular Contact
        </h2>
        <div
          className={css`
            background: white;
            display: flex;
            flex-direction: column;
            border-radius: 0.8rem;
            padding: 0.5rem 20px;
          `}
        >
          {result?.map((contact: any) => (
            <React.Fragment key={contact?.id}>
              <ContactCard
                contact={contact}
                setDataChanged={setDataChanged}
                dataChanged={dataChanged}
                onClickDelete={() => deleteContact(contact.id)}
                navigateToEdit={() => navigateToEdit(contact.id)}
              />
            </React.Fragment>
          ))}
        </div>
      </>
    );
  }, [data, dataChanged, deleteContact, navigateToEdit]);

  return (
    <>
      <Header />
      <div
        className={css`
          padding: 1rem;
        `}
      >
        <div
          className={css`
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
          `}
        >
          {loading ? <p>Loading...</p> : renderData}
          {error && <p>Error :{error.message}</p>}
        </div>
      </div>
    </>
  );
}

const Button = styled.button`
  border: none;
  border-radius: 0.8rem;
  // padding: 0.2rem 0.4rem;
  background-color: transparent;
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContactCard = ({
  contact,
  setDataChanged,
  dataChanged,
  onClickDelete,
  navigateToEdit,
}: any) => {
  const favorite = JSON.parse(localStorage.getItem("favorite") as string);
  const addToFavorite = (contact: any) => {
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
          JSON.stringify(favorite.filter((item: any) => item.id !== contact.id))
        );
      }
    } else {
      localStorage.setItem("favorite", JSON.stringify([contact]));
    }
  };
  return (
    <div
      key={contact?.id}
      className={css`
        padding: 0.8rem 0;
        border-bottom: 2px solid #f7f7f7;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: between;
        align-items: center;
        &:last-child {
          border-bottom: none;
        }
      `}
    >
      <div
        className={css`
          // circle
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background-color: #f7f7f7;
          color: #00850b;
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
      <Button
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
      </Button>
      <Button
        name="Favorite"
        className={css`
          margin-left: 0.5rem;
        `}
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
            color: ${favorite?.find((fav: any) => fav.id == contact?.id)
              ? "#F59E0B"
              : "#222"};
          `}
          onClick={() => addToFavorite(contact)}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      </Button>
    </div>
  );
};
