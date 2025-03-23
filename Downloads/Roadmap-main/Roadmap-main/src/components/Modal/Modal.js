import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

function Modal({ isOpen, onClose, title, children }) {
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

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>
        {title}
      </DialogTitle>

      <DialogContent dividers>{children}</DialogContent>

      <DialogActions>
      </DialogActions>
    </Dialog>
  );
}

export default Modal;
