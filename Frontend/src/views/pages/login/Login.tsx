import React from "react";
import { Button, useDisclosure, Checkbox, Link } from "@nextui-org/react";
import { IconLogin, IconLoginSVG, IconProfile } from "../../../Icons";
import InputNextUI from "../../../Components/Input/input";
import ModalUI from "../../../Components/Modal";
import { useDispatch } from "react-redux";
import {
  onOpenForget,
  onOpenLogin,
  onOpenResigter,
  updateLoginDetails,
} from "../../../Components/Common/globalSlice";
import { useAppSelector } from "../../../Components/Common/hooks";
import { Register } from "./Register";
import { Controller, useForm } from "react-hook-form";
import { useLoginMutation } from "./Service.mjs";
import { authenticate } from "../../../Components/Common/CustomHooks";
import { ForgotPassword } from "./ForgotPassword";
const Login = () => {
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const formData = watch();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const isOpenRegister = useAppSelector(
    (state) => state.globalConfig.isOpenRegister
  );
  const isOpenRegisterSuccessModal = useAppSelector(
    (state) => state.globalConfig.isOpenRegisterSuccessModal
  );
  const isOpenLogin = useAppSelector((state) => state.globalConfig.isOpenLogin);
  const isOpenForget = useAppSelector((state) => state.globalConfig.isOpenForget);

  const onCloseModal = () => {
    onClose()
    dispatch(onOpenLogin(false));
  };

  const onClickRegister = () => {
    onClose()
    dispatch(onOpenResigter(true));
    dispatch(onOpenLogin(false));
  };

  const onClickForget = () => {
    onClose()
    dispatch(onOpenResigter(false));
    dispatch(onOpenLogin(false));
    dispatch(onOpenForget(true))
  };

  const onSubmit = async () => {
    try {
      const payload = {
        email: String(formData?.email ?? "").trim(),
        password: String(formData?.password ?? "").trim(),
      };
      const result = await login(payload);
      if (result?.data?.success) {
        authenticate(result?.data, () => {
          dispatch(onOpenLogin(false));
          dispatch(updateLoginDetails(result?.data));
          location.reload()
        });
        return;
      }
      const msg =
        result?.error?.data?.message ||
        (Array.isArray(result?.error?.data?.errors) ? result.error.data.errors.join(", ") : null) ||
        result?.error?.error ||
        "Login failed";
      alert(msg);
    } catch (error) {
      console.log(error, "Error");
      alert("Login failed");
    }
  };

  return (
    <div>
      <Button
        isIconOnly
        color="primary"
        className="bg-warning"
        aria-label="Take a photo"
        onPress={() => dispatch(onOpenLogin(true))}
      >
        <IconProfile color="whtie"/>
      </Button>

      <ModalUI
        isOpen={isOpenLogin}
        onOpenChange={onCloseModal}
        heading={"Login"}
        headerIcon={<IconLoginSVG width="200px" height="155px" />}
        content={
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-3 m-0">
              <div className="mt-2">
                <div className="flex justify-center mb-4">
                  <Controller
                    name="email" // Changed to reflect a text input
                    control={control}
                    rules={{ required: "Please select a user name" }} // Validation rule with custom message
                    render={({ field }) => (
                      <InputNextUI
                        type="text"
                        label="Email"
                        {...field}
                        errorMessage={errors.email?.message}
                      />
                    )}
                  />
                </div>
                <div className="flex justify-center  mt-3">
                  <Controller
                    name="password" // Changed to reflect a text input
                    control={control}
                    rules={{ required: "Please select a password" }} // Validation rule with custom message
                    render={({ field }) => (
                      <InputNextUI
                        type="password"
                        label="Password"
                        {...field}
                        errorMessage={errors.password?.message}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="w-full flex pt-5">
                <div className="flex w-1/2">
                  <Checkbox
                    className="justify-center flex"
                    color="primary"
                    radius="sm"
                    classNames={{
                      label: ["text-small", "text-gray-400", "font-light"],
                      wrapper: ["before:border-1", "before:border-gray-300"],
                    }}
                  >
                    Remember Me
                  </Checkbox>
                </div>
                <div className="w-1/2 justify-end flex ">
                  <Link
                    className="cursor-pointer p-0 m-0 #7358D7 max-w-md"
                    style={{
                      color: "var(--brand-primary)",
                    }}
                    // color="foreground"
                    onPress={() => onClickForget ()}
                    size="sm"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <div className="w-full justify-center pt-5">
                <Button
                  type="submit"
                  size="sm"
                  className="w-full  font-normal "
                  isDisabled={isLoggingIn}
                  style={{
                    padding: 0,
                    margin: 0,
                    background: "var(--brand-primary)",
                    color: "#FFFFFF",
                  }}
                >
                  {"LOGIN"}
                  <IconLogin fill="white" />
                </Button>
              </div>
            </div>
          </form>
        }
        footerContent={
          <div className="w-full flex justify-center">
            <div className="flex items-center my-3">
              <p
                className="text-sm pe-2 Iconweb"
                style={{
                  color: "#A5A5A5",
                }}
              >
                {"Not A Member ? "} 
                
              </p>
              <Link
                className="cursor-pointer font-medium p-0 m-0"
                style={{
                  color: "var(--brand-primary)",
                }}
                onPress={() => onClickRegister()}
                size="sm"
              >
                {"Register Now"}
              </Link>
            </div>
          </div>
        }
      />
      {(isOpenRegister || isOpenRegisterSuccessModal) && <Register />}
      {isOpenForget && <ForgotPassword />}
    </div>
  );
};

export default Login;
