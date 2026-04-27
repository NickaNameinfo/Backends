import * as React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface IModalprops {
  isOpen: boolean;
  onOpenChange: (isOpen?: boolean) => void;
  headerIcon?: any;
  heading: string;
  content: any;
  footerContent: any;
}

const ModalUI = (props: IModalprops) => {
  return (
    <>
      <Modal
        isDismissable={false}
        isOpen={props?.isOpen}
        onOpenChange={props?.onOpenChange}
        placement="top-center"
        size="sm"
      >
        <ModalContent className="p-0 m-0">
          {() => (
            <>
              <ModalHeader className="flex self-center flex-col gap-1 p-0 m-0 pt-2">
                <div className="flex justify-center">{props?.headerIcon}</div>
                <div className="self-center  font-bold text-2xl mt-0">
                  {props?.heading}
                </div>
              </ModalHeader>
              <ModalBody>{props?.content}</ModalBody>
              <ModalFooter className="p-0 m-0">
                {props?.footerContent}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalUI;
