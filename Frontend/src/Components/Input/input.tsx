import { Input } from "@nextui-org/react";
import * as React from "react";
import { EyeFilledIcon, EyeSlashFilledIcon } from "../../Icons";

interface InputFieldProps {
  label?: any;
  onChange: (value: any) => void;
  // onValueChange?: (value: string) => void;
  variant?: "flat" | "bordered" | "faded" | "underlined";
  type?:
    | "text"
    | "number"
    | "search"
    | "url"
    | "tel"
    | "email"
    | "password"
    | (string & {});
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  validationBehavior?: "native" | "aria";
  labelPlacement?: "inside" | "outside" | "outside-left";
  isClearable?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  disableAnimation?: boolean;
  startContent?: any;
  errorMessage?: any;
  placeholder?: string;
  endContent?: any;
  description?: any;
  className?: any;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const InputNextUI = (props: InputFieldProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  return (
    <>
      <Input
        {...props}
        classNames={{
          label: "text-black/60 dark:text-white/60",
          input: [
            "bg-transparent",
            "text-black/90 dark:text-white/100",
            "placeholder:text-default-100/30 dark:placeholder:text-white/10",
            "font-normal",
          ],
          innerWrapper: "bg-transparent",
          inputWrapper: [
            // "shadow-xl",
            "bg-transparent",
            "dark:bg-transparent",
            "backdrop-blur-xl",
            "backdrop-saturate-50",
            "hover:bg-transparent",
            `${props?.errorMessage && "hover:border-gray-600/20"}`,
            "focus-within:!bg-transparent",
            "dark:hover:bg-transparent",
            "dark:focus-within:!bg-transparent",
            "!cursor-text",
            "shadow-none",
            "border-1",
            `${!props?.errorMessage && "data-[hover=true]:border-gray-600/20"}`,
            `${
              !props?.errorMessage &&
              "dark:data-[hover=true]:border-gray-600/20"
            }`,
          ],
        }}
        className={`${props.className ?? ""}`}
        variant={props?.variant ?? "faded"}
        color={props?.errorMessage ? "danger" : props?.color ?? "default"}
        validationBehavior={props.validationBehavior}
        size={props?.size ?? "sm"}
        radius={props?.radius}
        label={props?.label}
        description={props?.description}
        startContent={props?.startContent}
        endContent={
          props?.type === "password" ? (
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <EyeSlashFilledIcon
                  className="text-2xl text-default-400 pointer-events-none"
                  fill="#8E99A4"
                />
              ) : (
                <EyeFilledIcon
                  className="text-2xl text-default-400 pointer-events-none"
                  fill="#8E99A4"
                />
              )}
            </button>
          ) : (
            props?.endContent
          )
        }
        isInvalid={props?.errorMessage}
        isClearable={props?.isClearable ?? false}
        isDisabled={props?.isDisabled}
        isReadOnly={props?.isReadOnly}
        isRequired={props?.isRequired}
        labelPlacement={props?.labelPlacement ?? "inside"}
        placeholder={props?.placeholder}
        disableAnimation={props?.disableAnimation}
        errorMessage={props?.errorMessage}
        // type={props?.type}
        type={isVisible ? "text" : props?.type}
        // onClear={() => console.log("input cleared")}
        // onValueChange={(value) => {
        //   props.onValueChange(value);
        // }}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      />
    </>
  );
};

export default InputNextUI;
