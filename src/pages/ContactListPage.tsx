/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { gql, useMutation, useQuery } from "@apollo/client";
import { css } from "@emotion/css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

export default function ContactListPage() {
  const [dataChanged, setDataChanged] = useState(false);
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
  });

  const [searchData, setSearchData] = useState("");

  const [pagination, setPagination] = useState({
    perPage: 15,
    page: 1,
    totalPages: 0,
    total: 0,
  });
  const renderData = useMemo(() => {
    const favorite = (localStorage.getItem("favorite") as string)
      ? JSON.parse(localStorage.getItem("favorite") as string)
      : null;
    let result = data?.contact;
    console.log(result);


    if (favorite) {
      result = result?.filter(
        (item: any) =>
          !favorite.some((favorite: any) => favorite.id === item.id)
      );
    }

    let copyOfArray: any = result ? [...result] : null;
    copyOfArray?.sort((a: any, b: any) => {
      const nameA = a.first_name.toUpperCase();
      const nameB = b.first_name.toUpperCase();

      if (nameA < nameB) {
        return -1;
      } else if (nameA > nameB) {
        return 1;
      } else {
        return 0;
      }
    });
    console.log(copyOfArray);
    if (pagination && copyOfArray) {
      const total = copyOfArray?.length;
      const totalPages = Math.ceil(total / pagination.perPage);
      const offset = (pagination.page - 1) * pagination.perPage;
      setPagination((prev) => ({
        ...prev,
        total: total,
        totalPages: totalPages,
      }));
      copyOfArray = copyOfArray?.slice(offset, offset + pagination.perPage);
    }
    console.log(copyOfArray);
    if (searchData) {
      copyOfArray = copyOfArray?.filter((item: any) => {
        const name = (item.first_name + item.last_name).toUpperCase();

        return name.includes(searchData.toUpperCase());
      });
    }

    const groupedData: any = {};
    copyOfArray?.forEach((item: any) => {
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
                {copyOfArray?.map((contact: any) => {
                  const firstLetter =
                    typeof contact.first_name[0] === "string"
                      ? contact.first_name[0].toUpperCase()
                      : contact.first_name[0];
                  if (
                    firstLetter !==
                    (typeof alphabet === "string"
                      ? alphabet.toUpperCase()
                      : alphabet)
                  )
                    return null;
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
  }, [
    data,
    dataChanged,
    deleteContact,
    navigateToEdit,
    searchData,
    pagination.page,
  ]);

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
  function generatePagination(currentPage:any, totalPages:any) {
    const paginationArray = [currentPage];

    if (currentPage > 1) {
      paginationArray.unshift(currentPage - 1);
      if (currentPage - 1 > 2) {
        paginationArray.unshift('...');
      } else if (currentPage - 1 === 2) {
        paginationArray.unshift(1);
      }
    }

    if (currentPage < totalPages) {
      paginationArray.push(currentPage + 1);
      if (currentPage + 1 < totalPages - 1) {
        paginationArray.push('...');
      } else if (currentPage + 1 === totalPages - 1) {
        paginationArray.push(totalPages);
      }
    }

    return paginationArray;


  }
  
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
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
            background-color: white;
            padding: 0.6rem 0;
            border-radius: 0.5rem;
          `}
        >
          <div
            className={css`
              color: #b9b9b9;
              padding: 0 1rem;
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              height={24}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <div
            className={css`
              flex: 1;
            `}
          >
            <input
              type="text"
              placeholder="Find Contact"
              value={searchData}
              onChange={(e) => setSearchData(e.target.value)}
              className={css`
                border: none;
                outline: none;
                &::placeholder {
                  color: #b9b9b9;
                }
                font-weight: 600;
              `}
            />
          </div>
        </div>
        <div
          className={css`
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            font-weight: bold;
          `}
        >
          {renderFavorite}
          {loading ? <p>Loading...</p> : renderData}
          {error && <p>Error :{error.message}</p>}
          {/* Pagination */}
          <div
            className={css`
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 1rem;
            `}
          >
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                height={20}
                onClick={
                  pagination?.page > 1
                    ? () =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                    : undefined
                }
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </div>

            <div
              className={css`
                display: flex;
                justify-content: space-between;
                align-items: center;
              `}
            >
              {generatePagination(pagination?.page, pagination?.totalPages).map((item) => {
                return(
                  <>
                    <span
                      onClick={() => {
                        if(item !== '...'){
                          
                          setPagination((prev) => ({
                            ...prev,
                            page: item,
                          }))
                        }}
                      }
                      className={css`
                        background-color: ${pagination?.page === item
                          ? "#00850B"
                          : "transparent"};
                        color: ${pagination?.page === item
                          ? "white"
                          : ""};
                        border-radius: 50%;
                        min-width: 2rem;
                        min-height: 2rem;
                        display: flex;
                        line-height: 1;
                        justify-content: center;
                        align-items: center;
                      `}
                    >
                     {item}
                    </span>
                </>
                )
              })}
            </div>

            <div
              onClick={
                pagination?.page < pagination?.totalPages
                  ? () =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                  : undefined
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                height={20}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


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
          min-width: 3rem;
          min-height: 3rem;
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
