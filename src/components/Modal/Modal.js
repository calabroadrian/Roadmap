import React, { useEffect } from "react";

function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    function handleEsc(event) {
      if (event.keyCode === 27) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return function cleanup() {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div>
      <div>{children}</div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default Modal;