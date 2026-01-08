"use client";

/**
 * Dialog component - Backwards-compatible wrapper around Modal
 *
 * This file re-exports Modal components with Dialog naming for backwards compatibility.
 * New code should prefer using Modal directly.
 *
 * @deprecated Use Modal, ModalHeader, ModalBody, ModalFooter instead
 */

import { Modal, ModalHeader, ModalBody, ModalFooter } from "./Modal";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

/**
 * @deprecated Use Modal instead
 */
function Dialog({
  open,
  onClose,
  children,
  className,
  size = "md",
}: DialogProps) {
  return (
    <Modal isOpen={open} onClose={onClose} size={size}>
      <div className={className}>{children}</div>
    </Modal>
  );
}

/**
 * @deprecated Use ModalHeader instead
 */
const DialogHeader = ModalHeader;

/**
 * @deprecated Use ModalBody instead
 */
const DialogBody = ModalBody;

/**
 * @deprecated Use ModalFooter instead
 */
const DialogFooter = ModalFooter;

export { Dialog, DialogHeader, DialogBody, DialogFooter };
