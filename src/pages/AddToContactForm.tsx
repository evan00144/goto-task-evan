/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { css } from "@emotion/css";
import Header from "./Header";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  //  useNavigate,
  useParams,
} from "react-router-dom";

const inputStyles = css`
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid transparent;
  margin-bottom: 10px;
  margin-top: 0.5rem;
  &:focus {
    border: 1px solid #00850b;
  }
  &:focus-visible {
    outline: none;
  }
`;

const buttonStyles = css`
  background-color: transparent;
  color: #00850b;
  font-weight: 600;
  border: none;
  margin-top: 1rem;
  cursor: pointer;
`;

export default function AddToContactForm() {
  const { id } = useParams();
  // const navigate = useNavigate();
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

  const [addContact, { error: errorData, data: addData }] =
    useMutation(ADD_CONTACT);
  const [editContact, { data: editData }] = useMutation(EDIT_CONTACT);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  console.log(errorData);
  console.log(addData);
  useEffect(() => {
    if (errorData) {
      alert("Phone Number must be unique");
      return;
    } else {
      if (addData?.insert_contact || editData?.update_contact_by_pk) {
        window.location.href = "/";
      }
    }
  }, [errorData, addData, editData]);

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
    if (!formData.first_name || !formData.last_name) {
      return alert("Please fill all fields");
    }
    if (!id) {
      if (!formData.phones[0].number) return alert("Please fill phone number");
    }
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
    // window.location.href = "/";
  };

  return (
    <>
      <Header handleSubmit={handleSubmit} />
      <form
        noValidate
        className={css`
          padding: 0 1rem 1rem 1rem;
        `}
        onSubmit={handleSubmit}
      >
        <div>
          <label
            className={css`
              font-weight: bold;
              font-size: 0.8rem;
            `}
            htmlFor="first_name"
          >
            First Name
          </label>
          <input
            required
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={inputStyles}
          />
        </div>

        <div>
          <label
            className={css`
              font-weight: bold;
              font-size: 0.8rem;
            `}
            htmlFor="last_name"
          >
            Last Name
          </label>
          <input
            required
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={inputStyles}
          />
        </div>
        <label
          className={css`
            font-weight: bold;
            font-size: 0.8rem;
          `}
        >
          Phone
        </label>
        {formData.phones.length <= 0 && (
          <div
            className={css`
              font-size: 0.7rem;
            `}
          >
            No Phone Number
          </div>
        )}
        {formData.phones.map((phone, index) => (
          <div key={index}>
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
                required
                type="number"
                id={`phone${index}`}
                name={index.toString()}
                value={phone.number}
                onChange={handlePhoneChange}
                className={css`
                  width: 100%;
                  padding: 8px;
                  border-radius: 5px;
                  border: 1px solid transparent;
                  margin-bottom: 10px;
                  margin-top: 0.5rem;
                  &:focus {
                    border: 1px solid #00850b;
                  }
                  &:focus-visible {
                    outline: none;
                  }
                `}
              />
            )}
          </div>
        ))}
        <div
          className={css`
            display: flex;
            gap: 0.5rem;
          `}
        >
          {!id && (
            <button type="button" className={buttonStyles} onClick={addPhone}>
              Add Phone
            </button>
          )}

          {/* <button type="submit" className={buttonStyles}>
            {id ? "Edit" : "Add"} Contact
          </button> */}
        </div>
      </form>
    </>
  );
}
