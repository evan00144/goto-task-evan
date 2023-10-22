/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { css } from "@emotion/css";
import Header from "./Header";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import Modal from "./ModalComponent";

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
  padding: 0;
  margin-top: 1rem;
  font-size: 0.75rem;
  cursor: pointer;
`;

export default function AddToContactForm() {
  const { id } = useParams();
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
      const phones = contact_by_pk.phones.map((phone: any) => ({
        number: phone.number,
      }));
      setFormData({
        first_name: contact_by_pk.first_name,
        last_name: contact_by_pk.last_name,
        phones: phones,
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

  const EDIT_PHONE = gql`
    mutation EditPhoneNumber(
      $pk_columns: phone_pk_columns_input!
      $new_phone_number: String!
    ) {
      update_phone_by_pk(
        pk_columns: $pk_columns
        _set: { number: $new_phone_number }
      ) {
        contact {
          id
          last_name
          first_name
          created_at
          phones {
            number
          }
        }
      }
    }
  `;


  const [addContact, { error: errorData, data: addData }] =
    useMutation(ADD_CONTACT);
  const [editContact, { data: editData, error: editContactError }] =
    useMutation(EDIT_CONTACT);
  const [editPhone, { data: editPhoneData, error: editPhoneError }] =
    useMutation(EDIT_PHONE);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  useEffect(() => {
    if (errorData || editContactError || editPhoneError) {
      alert("Phone Number must be unique");
      return;
    } else {
      console.log(addData?.insert_contact?.returning[0])
      if (
        (addData?.insert_contact?.returning[0] || editData?.update_contact_by_pk||
        editPhoneData?.update_phone_by_pk)
      ) {
        console.log('123123123123124512512512')
        window.location.href = "/";
      }
    }
  }, [
    errorData,
    addData,
    editData,
    editContactError,
    editPhoneError,
    editPhoneData,
  ]);

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
      if (!formData?.phones[0]?.number)
        return alert("Please fill phone number");
    }
    if (id) {
      if (data?.contact_by_pk) {
        setModalConfig({
          isOpen: true,
          title: "Edit Contact",
          description: "Are you sure you want to save these changes?",
          type: "add",
          onClose: () => {
            setModalConfig({
              ...modalConfig,
              isOpen: false,
            });
          },
          onConfirm: () => {
            editContact({
              variables: {
                id,
                _set: {
                  first_name: formData.first_name,
                  last_name: formData.last_name,
                },
              },
            });
            formData.phones.forEach((phone, index) => {
              editPhone({
                variables: {
                  pk_columns: {
                    contact_id: id,
                    number: data?.contact_by_pk?.phones[index]?.number || "",
                  },
                  new_phone_number: phone.number,
                },
              });
            });
            setModalConfig({
              ...modalConfig,
              isOpen: false,
            });
          },
        });
      
      } else {
        setModalConfig({
          isOpen: true,
          title: "Edit Contact",
          description: "Are you sure you want to save these changes?",
          type: "add",
          onClose: () => {
            setModalConfig({
              ...modalConfig,
              isOpen: false,
            });
          },
          onConfirm: () => {
            
        const favorite = JSON.parse(localStorage.getItem("favorite") as string);
        const index = favorite.findIndex((item: any) => item.id === Number(id));
        favorite[index].first_name = formData.first_name;
        favorite[index].last_name = formData.last_name;
        favorite[index].phones = formData.phones;
        localStorage.setItem("favorite", JSON.stringify(favorite));
            setModalConfig({
              ...modalConfig,
              isOpen: false,
            });
            window.location.href = "/";
          },
        });
      }
    } else {
      setModalConfig({
        isOpen: true,
        title: "Add Contact",
        description: "Would you like to save this contact to your device?",
        type: "add",
        onClose: () => {
          setModalConfig({
            ...modalConfig,
            isOpen: false,
          });
        },
        onConfirm: () => {
          addContact({
            variables: {
              first_name: formData.first_name,
              last_name: formData.last_name,
              phones: formData.phones,
            },
          });
          setModalConfig({
            ...modalConfig,
            isOpen: false,
          });
        },
      });
    }
  };
  const navigate = useNavigate()
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    onClose: () => {},
    onConfirm: () => {},
    description: "",
    type: "",
  });

  return (
    <>
      <Header clickBack={()=>{
         setModalConfig({
          isOpen: true,
          title: "Your changes won't be saved",
          description: "Are you sure you want to cancel and go back? Any changes you've made will be discarded.",
          type: "cancel",
          onClose: () => {
            setModalConfig({
              ...modalConfig,
              isOpen: false,
            });
          },
          onConfirm: () => {
            navigate(-1)
          },
        });
      }} />
      <Modal isOpen={modalConfig?.isOpen}>
        <h3
          className={css`
            text-align: center;
          `}
        >
          {modalConfig?.title}
        </h3>
        <p
          className={css`
            text-align: center;
            font-size: 0.8rem;
          `}
        >
          {modalConfig?.description}
        </p>
        <div
          className={css`
            display: flex;
            gap: 0.5rem;
          `}
        >
          <button
            type="button"
            className={css`
              background-color: #f7f7f7;
              border-radius: 30rem;
              padding: 0.7rem 1rem;
              width: 100%;
              font-weight: 700;
            `}
            onClick={modalConfig?.onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={css`
              background-color: ${modalConfig?.type === "add" ? "#00850b" : "#9E0E18"};
              color: white;
              border-radius: 30rem;
              padding: 0.7rem 1rem;
              width: 100%;
              font-weight: 700;
            `}
            onClick={modalConfig?.onConfirm}
          >
          {modalConfig?.type === "add" ? "Save" : "Discard"}
          </button>
        </div>
      </Modal>
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

        {formData.phones.map((phone, index) => (
          <div key={index}>
            <div
              className={css`
                display: flex;
                align-items: center;
              `}
            >
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
              {!id && (
                <span
                  onClick={() => {
                    const { phones } = formData;
                    phones.splice(index, 1);
                    setFormData({
                      ...formData,
                      phones,
                    });
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    height={20}
                    className={css`
                      margin-left: 0.5rem;
                    `}
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </div>
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
        </div>
        <button
          type="submit"
          className={css`
            background-color: #00850b;
            color: white;
            border-radius: 30rem;
            padding: 0.7rem 4.5rem;
            font-weight: 700;
            float: right;
          `}
        >
          {/* {id ? "Edit" : "Add"} */}
          Save
        </button>
      </form>
    </>
  );
}
