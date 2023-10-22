/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { css } from "@emotion/css";
import Header from "./Header";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";

const inputStyles = css`
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
`;

const buttonStyles = css`
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
`;

export default function AddToContactForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phones: [{ number: "" }],
  });
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

  useEffect(() => {
    if (data?.contact_by_pk) {
      const { contact_by_pk } = data;
      setFormData({
        first_name: contact_by_pk.first_name,
        last_name: contact_by_pk.last_name,
        phones: contact_by_pk.phones,
      });
    } else {
      if (data) {
        const favorite = JSON.parse(localStorage.getItem("favorite") as string);
        const contact = favorite.find((item: any) => item.id === Number(id));
        setFormData({
          first_name: contact.first_name,
          last_name: contact.last_name,
          phones: contact.phones,
        });
      }
    }
  }, [data, id]);

  const ADD_CONTACT = gql`
    mutation AddContactWithPhones(
      $first_name: String!
      $last_name: String!
      $phones: [phone_insert_input!]!
    ) {
      insert_contact(
        objects: {
          first_name: $first_name
          last_name: $last_name
          phones: { data: $phones }
        }
      ) {
        returning {
          first_name
          last_name
          id
          phones {
            number
          }
        }
      }
    }
  `;

  const EDIT_CONTACT = gql`
    mutation EditContactById($id: Int!, $_set: contact_set_input) {
      update_contact_by_pk(pk_columns: { id: $id }, _set: $_set) {
        id
        first_name
        last_name
        phones {
          number
        }
      }
    }
  `;

  const [addContact, { data: addData }] = useMutation(ADD_CONTACT);
  const [editContact] = useMutation(EDIT_CONTACT);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePhoneChange = (e: any) => {
    const { name, value } = e.target;
    const { phones } = formData;
    phones[name].number = value;
    setFormData({
      ...formData,
      phones,
    });
  };

  const addPhone = () => {
    setFormData({
      ...formData,
      phones: [...formData.phones, { number: "" }],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      if (data?.contact_by_pk) {
        editContact({
          variables: {
            id,
            _set: {
              first_name: formData.first_name,
              last_name: formData.last_name,
            },
          },
        });
      } else {
        const favorite = JSON.parse(localStorage.getItem("favorite") as string);
        const index = favorite.findIndex((item: any) => item.id === Number(id));
        favorite[index].first_name = formData.first_name;
        favorite[index].last_name = formData.last_name;
        favorite[index].phones = formData.phones;
        localStorage.setItem("favorite", JSON.stringify(favorite));
      }
    } else {
      addContact({
        variables: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phones: formData.phones,
        },
      });
    }
    window.location.href="/";
    // navigate("/");
  };

  return (
    <>
      <Header />
      <form
        className={css`
          padding: 0 1rem 1rem 1rem;
        `}
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={inputStyles}
          />
        </div>

        <div>
          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={inputStyles}
          />
        </div>

        {formData.phones.map((phone, index) => (
          <div key={index}>
            <label htmlFor={`phone${index}`}>Phone</label>
            {id ? (
              <div>
                <span
                  className={css`
                    font-weight: bold;
                  `}
                >
                  {phone.number}
                </span>
              </div>
            ) : (
              <input
                type="text"
                id={`phone${index}`}
                name={index.toString()}
                value={phone.number}
                onChange={handlePhoneChange}
                className={inputStyles}
              />
            )}
          </div>
        ))}
        <div
          className={css`
            display: flex;
            // justify-content: flex-end;
            gap: 0.5rem;
          `}
        >
          {!id && (
            <button type="button" className={buttonStyles} onClick={addPhone}>
              Add Phone
            </button>
          )}
          <button type="submit" className={buttonStyles}>
            {id ? "Edit" : "Add"} Contact
          </button>
        </div>
      </form>
    </>
  );
}
