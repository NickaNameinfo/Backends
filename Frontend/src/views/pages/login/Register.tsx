import {
  Button,
  Checkbox,
  Input,
  Link,
  Radio,
  RadioGroup,
  useDisclosure,
} from "@nextui-org/react";
import React from "react";
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
  onOpenLogin,
  onOpenRegisterSuccessModal,
  onOpenResigter,
} from "../../../Components/Common/globalSlice";
import { useDispatch } from "react-redux";
import Login from "./Login";
import { useNavigate } from "react-router-dom";
import { useAddVendorsMutation } from "../Vendor/Service.mjs";
import { useAddStoreMutation } from "../Store/Service.mjs";
import { useUpdateUserMutation } from "../../../Service.mjs";
import { submitRegistrationToCrm } from "../../../utils/crmPublicLead.mjs";

export const Register = () => {
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
  const navigate = useNavigate();
  const [register] = useRegisterMutation();
  const isOpenRegister = useAppSelector(
    (state) => state.globalConfig.isOpenRegister
  );
  const isOpenLogin = useAppSelector((state) => state.globalConfig.isOpenLogin);
  const isOpenRegisterSuccessModal = useAppSelector(
    (state) => state.globalConfig.isOpenRegisterSuccessModal
  );

  const [addStores] = useAddStoreMutation();
  const [updateUser] = useUpdateUserMutation();
  const [addVendors] = useAddVendorsMutation();

  const onSubmit = async () => {
    try {
      const tempApiValue = {
        ...formData,
        verify: formData?.role === "1" ? 1 : 0,
      };

      const result = await register(tempApiValue);

      if ("error" in result && result.error) {
        const err: any = result.error;
        const msg =
          err?.data?.message ||
          err?.data?.msg ||
          (Array.isArray(err?.data?.errors) ? err.data.errors[0] : null) ||
          "Registration failed. Please try again.";
        alert(msg);
        return;
      }

      if (!result?.data?.success) {
        alert(result?.data?.msg || "Registration failed. Please try again.");
        return;
      }

      const registeredUser = result?.data?.user;
      const userId = registeredUser?.id;
      const role = String(registeredUser?.role ?? formData?.role ?? "");

      if (!userId) {
        alert("Registration incomplete. Please try again.");
        return;
      }

      const finishStoreOrVendor = async () => {
        try {
          const crmResult = await submitRegistrationToCrm({
            formData,
            registrationType: "registration",
            notesExtra: `User ID: ${formData?.firstName} ${formData?.lastName} - ${formData?.email} - ${formData?.phoneNo}.`,
          });
          if (!crmResult) {
            console.warn("[CRM] Lead skipped (no API key or CRM unavailable).");
          }
        } catch (err) {
          console.warn("[CRM] Registration lead failed:", err);
        }
        dispatch(onOpenRegisterSuccessModal(true));
        dispatch(onOpenResigter(false));
        reset();
      };

      if (role === "3") {
        const apiFormData = {
          storename: formData?.firstName,
          email: formData?.email,
          phone: formData?.phoneNo,
          status: 0,
          ownername: formData?.firstName,
          password: formData?.password,
          areaId: 3,
        };
        const resultStore = await addStores(apiFormData);
        if (!resultStore?.data?.success) {
          alert(
            resultStore?.data?.msg ||
              "Could not create your store record. Please try again."
          );
          return;
        }

        const newStoreId = resultStore?.data?.data?.id;
        const userResult = await updateUser({
          id: userId,
          email: formData?.email,
          storeId: newStoreId,
        });
        if (!userResult?.data?.success) {
          console.error("User update failed:", userResult);
          alert(
            "Store was created but linking your account failed. Please contact support."
          );
          return;
        }

        await finishStoreOrVendor();
        return;
      }

      if (role === "2") {
        const apiFormData = {
          storename: formData?.firstName,
          email: formData?.email,
          phone: formData?.phoneNo,
          status: 0,
          ownername: formData?.firstName,
          password: formData?.password,
          areaId: [3],
        };
        const resultVendor = await addVendors(apiFormData);
        if (!resultVendor?.data?.success) {
          alert(
            resultVendor?.data?.msg ||
              "Could not create your vendor record. Please try again."
          );
          return;
        }

        const vendorRows = resultVendor?.data?.data;
        const vendorId = Array.isArray(vendorRows)
          ? vendorRows[0]?.vendorId
          : undefined;

        if (!vendorId) {
          alert(
            "Vendor was created but we could not read the vendor id. Please contact support."
          );
          return;
        }

        const userResult = await updateUser({
          id: userId,
          email: formData?.email,
          vendorId,
        });
        if (!userResult?.data?.success) {
          console.error("User update failed:", userResult);
          alert(
            "Vendor was created but linking your account failed. Please contact support."
          );
          return;
        }

        await finishStoreOrVendor();
        return;
      }

      dispatch(onOpenResigter(false));
      dispatch(onOpenLogin(true));
    } catch (error: any) {
      alert(error?.message || String(error));
    }
  };

  const onCloseModal = () => {
    dispatch(onOpenResigter(false));
  };

  const onClickLogin = () => {
    dispatch(onOpenResigter(false));
    dispatch(onOpenLogin(true));
  };

  return (
    <>
      <ModalUI
        isOpen={isOpenRegister}
        onOpenChange={onCloseModal}
        heading={"Register"}
        headerIcon={<IconRegisterSVG width="200px" height="155px" />}
        content={
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-3 m-0">
              <div className="mt-1 rounded-2xl bg-white/70 backdrop-blur-md border border-black/5 p-4">
                <p className="font-medium text-sm text-black/70 mb-2">
                  Register as
                </p>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Please select a role" }}
                  render={({ field }) => (
                    <div className="pb-2">
                      <RadioGroup
                        size="sm"
                        orientation="horizontal"
                        classNames={{
                          wrapper: ["gap-3"],
                        }}
                        {...field}
                      >
                        {[
                          { value: "1", label: "Customer" },
                          { value: "3", label: "Store" },
                          { value: "2", label: "Seller" },
                        ].map((opt) => (
                          <Radio
                            key={opt.value}
                            value={opt.value}
                            classNames={{
                              base: [
                                "m-0",
                                "px-3 py-2",
                                "rounded-xl",
                                "border border-black/10",
                                "data-[selected=true]:border-[var(--brand-primary)]",
                                "data-[selected=true]:bg-[rgba(76,134,249,0.08)]",
                              ].join(" "),
                              label: "text-sm font-semibold text-black/80",
                            }}
                          >
                            {opt.label}
                          </Radio>
                        ))}
                      </RadioGroup>
                      {errors.role && (
                        <p className="text-red-500 text-xs mt-2">
                          {String(errors.role.message)}
                        </p>
                      )}
                    </div>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Controller
                    name="firstName"
                    control={control}
                    rules={{ required: "Name is required" }}
                    render={({ field }) => (
                      <InputNextUI
                        type="text"
                        label="Name"
                        className="w-full"
                        {...field}
                        errorMessage={errors?.firstName?.["message"]}
                      />
                    )}
                  />

                  <Controller
                    name="email"
                    control={control}
                    rules={{ required: "Email is required" }}
                    render={({ field }) => (
                      <InputNextUI
                        type="email"
                        label="Email"
                        className="w-full"
                        {...field}
                        errorMessage={errors?.email?.["message"]}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <Controller
                    name="phoneNo"
                    control={control}
                    rules={{ required: "Phone Number is required" }}
                    render={({ field }) => (
                      <InputNextUI
                        type="number"
                        label="Mobile Number"
                        className="w-full"
                        {...field}
                        errorMessage={errors?.phoneNo?.["message"]}
                      />
                    )}
                  />

                  <Controller
                    name="password"
                    control={control}
                    rules={{ required: "Password is required" }}
                    render={({ field }) => (
                      <InputNextUI
                        type="password"
                        label="Password"
                        className="w-full"
                        {...field}
                        errorMessage={errors?.password?.["message"]}
                      />
                    )}
                  />
                </div>

                <Checkbox
                  className="pt-4"
                  classNames={{
                    label: ["text-xs", "text-black/50", "font-medium"],
                    wrapper: ["before:border-1", "before:border-gray-300"],
                  }}
                >
                  I agree to the{" "}
                  <Link
                    className="cursor-pointer font-semibold"
                    size="sm"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    Terms & Conditions
                  </Link>
                </Checkbox>
              </div>

              <div className="w-full justify-center pt-4">
                <Button
                  size="sm"
                  type="submit"
                  className="w-full font-semibold rounded-xl"
                  style={{
                    padding: 0,
                    margin: 0,
                    background: "var(--gradient-primary)",
                    color: "#FFFFFF",
                  }}
                >
                  Create account
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
      {/* Success Modal */}
      <ModalUI
        isOpen={!!isOpenRegisterSuccessModal}
        onOpenChange={(open) => {
          if (open === false) dispatch(onOpenRegisterSuccessModal(false));
        }}
        heading={"Thank You!"}
        headerIcon={
          <div className="flex justify-center items-center w-20 h-20 rounded-full bg-green-100">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        }
        content={
          <div className="text-center py-4">
            <p className="text-lg font-medium text-gray-700">
              Our team will reach you soon!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              We have received your registration and will contact you shortly.
            </p>
          </div>
        }
        footerContent={
          <div className="w-full flex justify-center pb-4">
            <Button
              color="primary"
              onPress={() => dispatch(onOpenRegisterSuccessModal(false))}
              className="w-full"
            >
              OK
            </Button>
          </div>
        }
      />
    </>
  );
};
