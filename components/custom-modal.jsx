import React, { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

export function CustomModal({ openModal, subComponent, heading }) {
  let { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (openModal) onOpen();
  }, [openModal]);

  return (
    <>
      <Modal isOpen={isOpen} size="3xl" onClose={onClose} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {heading}
              </ModalHeader>
              <ModalBody>{subComponent}</ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
