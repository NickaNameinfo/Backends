import {
  Button,
  Checkbox,
  Input,
  Link,
  Radio,
  RadioGroup,
  useDisclosure,
} from "@nextui-org/react";
import React, { useState } from "react";
import {
  EyeFilledIcon,
  EyeSlashFilledIcon,
  IconLogin,
  IconRegisterSVG,
} from "../../../Icons";
import { Controller, useForm } from "react-hook-form";
import { useRegisterMutation } from "../login/Service.mjs";
import InputNextUI from "../../../Components/Input/input";
import { useAppSelector } from "../../../Components/Common/hooks";
import ModalUI from "../../../Components/Modal";
import {
  onOpenForget,
  onOpenLogin,
  onOpenResigter,
} from "../../../Components/Common/globalSlice";
import { useDispatch } from "react-redux";
import Login from "./Login";
import { useNavigate } from "react-router-dom";
import { Otp } from "./Otp";
import { useConfirmPasswordResetMutation, useRequestPasswordResetMutation } from "./Service.mjs";


export const ForgotPassword = () => {
  const dispatch = useDispatch();
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const formData = watch();

  const [requestReset, requestResetState] = useRequestPasswordResetMutation();
  const [confirmReset, confirmResetState] = useConfirmPasswordResetMutation();

  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [enteredOtp, setEnteredOpt] = React.useState(null);
  const [step, setStep] = React.useState<"email" | "confirm">("email");

  const isOpenLogin = useAppSelector((state) => state.globalConfig.isOpenLogin);
  const isOpenForget = useAppSelector(
    (state) => state.globalConfig.isOpenForget
  );

  const onSubmit = async () => {
    try {
      if (step === "email") {
        const email = (formData?.email ?? "").toString().trim();
        if (!email) {
          alert("Please enter your email");
          return;
        }
        const result = await requestReset({ email });
        if ("error" in result && result.error) {
          const err: any = result.error;
          alert(err?.data?.message || "Could not send OTP. Please try again.");
          return;
        }
        setStep("confirm");
        return;
      }

      // confirm
      const email = (formData?.email ?? "").toString().trim();
      const otp = Array.isArray(enteredOtp) ? enteredOtp.join("") : "";
      const password = (formData?.password ?? "").toString();
      if (!otp || otp.length < 4) {
        alert("Please enter OTP");
        return;
      }
      if (!password || password.length < 5) {
        alert("Password must be at least 5 characters");
        return;
      }

      const result = await confirmReset({ email, otp, password });
      if ("error" in result && result.error) {
        const err: any = result.error;
        alert(err?.data?.message || "Could not reset password. Please try again.");
        return;
      }

      // success
      onClickLogin();
    } catch (error) {
      console.log(error, "Error");
    }
  };


  const onCloseModal = () => {
    onClose();
    setStep("email");
    dispatch(onOpenForget(false));
  };

  const onClickLogin = () => {
    dispatch(onOpenResigter(false));
    dispatch(onOpenLogin(true));
    dispatch(onOpenForget(false));
    setStep("email");
    reset();
  };

  return (
    <>
      <ModalUI
        isOpen={isOpenForget}
        onOpenChange={onCloseModal}
        heading={"Reset password"}
        headerIcon={<IconRegisterSVG width="200px" height="155px" />}
        content={
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-3 m-0">
              <div className="mt-1 rounded-2xl bg-white/70 backdrop-blur-md border border-black/5 p-4">
                <p className="text-sm font-medium text-black/70 mb-2">
                  {step === "email"
                    ? "Enter your email to receive an OTP"
                    : "Enter the OTP and set a new password"}
                </p>

                <Controller
                  name="email"
                  control={control}
                  rules={{ required: "Email is required" }}
                  render={({ field }) => (
                    <InputNextUI
                      type="email"
                      label="Email address"
                      className="w-full"
                      {...field}
                      errorMessage={errors.email?.message}
                      isReadOnly={step !== "email"}
                    />
                  )}
                />

                {step === "confirm" && (
                  <div className="mt-3">
                    <Otp enteredOtp={(value) => setEnteredOpt(value)} />
                  </div>
                )}

                {step === "confirm" && (
                  <div className="mt-3">
                    <Controller
                      name="password"
                      control={control}
                      rules={{ required: "Please enter new password" }}
                      render={({ field }) => (
                        <InputNextUI
                          type="password"
                          label="New password"
                          className="w-full"
                          {...field}
                          errorMessage={errors.password?.message}
                        />
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="w-full justify-center pt-4">
                <Button
                  size="sm"
                  type="submit"
                  className="w-full font-semibold rounded-xl"
                  isDisabled={requestResetState.isLoading || confirmResetState.isLoading}
                  style={{
                    padding: 0,
                    margin: 0,
                    background: "var(--gradient-primary)",
                    color: "#FFFFFF",
                  }}
                >
                  {step === "email" ? "Send OTP" : "Update password"}
                  <IconLogin fill="white" />
                </Button>
                {step === "confirm" ? (
                  <button
                    type="button"
                    className="w-full mt-2 text-sm font-semibold"
                    style={{ color: "var(--brand-primary)" }}
                    onClick={() => {
                      setStep("email");
                      setEnteredOpt(null);
                      setValue("password", "");
                    }}
                  >
                    Resend OTP
                  </button>
                ) : null}
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
                {"Already have a member ? "}
              </p>
              <Link
                className="cursor-pointer font-medium p-0 m-0"
                style={{
                  color: "var(--brand-primary)",
                }}
                onPress={() => onClickLogin()}
                size="sm"
              >
                {"Login"}
              </Link>
            </div>
          </div>
        }
      />
      {isOpenLogin && <Login />}
    </>
  );
};
