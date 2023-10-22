/* eslint-disable @typescript-eslint/no-explicit-any */
import { css } from "@emotion/css";
import styled from "styled-components";
// Define styles for the modal
const modalStyles = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  padding: 20px;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const modalContentStyles = css`
  background: white;
  padding: 20px;
  border-radius: .5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
`;

const ModalWrapper = styled.div`
  ${modalStyles};
`;

const ModalContent = styled.div`
  ${modalContentStyles};
`;


const Modal = ({ isOpen , children }:any) => {
  if (!isOpen) return null;

  return (
    <>
      <ModalWrapper className={modalStyles}>
        <ModalContent className={modalContentStyles}>
          {children}
        </ModalContent>
      </ModalWrapper>
    </>
  );
};

export default Modal;
