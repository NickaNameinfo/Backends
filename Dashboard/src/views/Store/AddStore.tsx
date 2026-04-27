import {
  Button,
  Chip,
  Image,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useAddStoreMutation,
  useGetStoresByIDQuery,
  useUpdateStoreMutation,
} from "./Service.mjs";
import { useAddSubcriptionMutation } from "../Subscriptions/Service.mjs"
import InputNextUI from "../../Components/Common/Input/input";
import TeaxtareaNextUI from "../../Components/Common/Input/Textarea";
import { getCookie, setCookie } from "../../JsFiles/CommonFunction.mjs";
import { useUpdatUserMutation, useUploadFileMutation } from "../../Service.mjs";
import { IconStep } from "../../icons";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2MB (prevents 413 upload errors)
const MAX_UPLOAD_LABEL = "2MB";
function validateUploadFile(file: File, opts: { label: string; maxBytes?: number; allowedTypes?: string[] }) {
  const maxBytes = opts.maxBytes ?? MAX_UPLOAD_BYTES;
  if (file.size > maxBytes) {
    return `${opts.label} is too large. Max allowed is ${MAX_UPLOAD_LABEL}.`;
  }
  if (opts.allowedTypes?.length && !opts.allowedTypes.includes(file.type)) {
    return `${opts.label} type not supported.`;
  }
  return null;
}

const AddStore = () => {
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const formData = watch();
  const [addStores] = useAddStoreMutation();
  const id = getCookie("id");
  const storeId = getCookie("storeId");
  const currentUserRole = getCookie("role");
  const { itemId } = useParams();
  const [createdStoreId, setCreatedStoreId] = React.useState<any>(null);
  const effectiveStoreId = itemId || storeId || createdStoreId;
  const { data, error, refetch } = useGetStoresByIDQuery(
    effectiveStoreId, { skip: !effectiveStoreId }
  );
  const [updateStores] = useUpdateStoreMutation();
  const [updateUser] = useUpdatUserMutation();
  const [uploadfile] = useUploadFileMutation();
  const [addSubCription] = useAddSubcriptionMutation();

  const [loading, setLoading] = React.useState(false);
  const [storeImagePreviewUrl, setStoreImagePreviewUrl] = React.useState<string | null>(null);
  const [verifyDocumentPreviewUrl, setVerifyDocumentPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (storeImagePreviewUrl) URL.revokeObjectURL(storeImagePreviewUrl);
      if (verifyDocumentPreviewUrl) URL.revokeObjectURL(verifyDocumentPreviewUrl);
    };
  }, [storeImagePreviewUrl, verifyDocumentPreviewUrl]);


  React.useEffect(() => {
    if (data?.data) {
      // Omit read-only API fields (e.g. subscription summary) from the form payload
      const {
        subscription: _sub,
        subscriptions: _subs,
        ...storeFields
      } = data.data as Record<string, unknown>;
      reset(storeFields);
      // Set areaId explicitly if it's not part of the fetched data or needs to be fixed
      setValue("areaId", 3);
    }
  }, [data, reset, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const isCreatingNew = !effectiveStoreId;

      // For NEW store creation, Government Document upload is required (and logo is required too).
      if (isCreatingNew) {
        if (!data?.password || String(data.password).trim().length < 5) {
          alert("Please enter a password (min 5 characters).");
          setLoading(false);
          return;
        }
        if (!(data?.verifyDocument instanceof File)) {
          alert("Please upload Government Document.");
          setLoading(false);
          return;
        }
        if (!(data?.storeImage instanceof File)) {
          alert("Please upload Store Logo.");
          setLoading(false);
          return;
        }
      }

      if (data?.storeImage instanceof File) {
        const msg = validateUploadFile(data.storeImage, {
          label: "Store Logo",
          allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
        });
        if (msg) {
          alert(msg);
          setLoading(false);
          return;
        }
      }
      if (data?.verifyDocument instanceof File) {
        const msg = validateUploadFile(data.verifyDocument, {
          label: "Government Document",
          allowedTypes: [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
          ],
        });
        if (msg) {
          alert(msg);
          setLoading(false);
          return;
        }
      }

      let storeImageUrl = data.storeImage; // File or existing URL
      let verifyDocumentUrl = data.verifyDocument; // File or existing URL

    // Handle storeImage upload if it's a new file
    if (data.storeImage instanceof File) {
      const storeImageFormData = new FormData();
      storeImageFormData.append("file", data.storeImage);
      storeImageFormData.append("storeName", String(effectiveStoreId || data?.id || data?.storename || "store"));
      const storeImageUploadResult = await uploadfile(storeImageFormData);
      if (storeImageUploadResult?.data?.success) {
        storeImageUrl = storeImageUploadResult.data.fileUrl;
      } else {
        alert("Failed to upload store image.");
        setLoading(false);
        return; // Stop submission if upload fails
      }
    } else if (!storeImageUrl) {
      // If it's not a file and not an existing URL, it means it's missing
      alert("Please upload store image.");
      setLoading(false);
      return;
    }

    // Handle verifyDocument upload if it's a new file
    if (data.verifyDocument instanceof File) {
      const verifyDocumentFormData = new FormData();
      verifyDocumentFormData.append("file", data.verifyDocument);
      verifyDocumentFormData.append("storeName", String(effectiveStoreId || data?.id || data?.storename || "store"));
      const verifyDocumentUploadResult = await uploadfile(verifyDocumentFormData);
      if (verifyDocumentUploadResult?.data?.success) {
        verifyDocumentUrl = verifyDocumentUploadResult.data.fileUrl;
      } else {
        alert("Failed to upload verification document.");
        setLoading(false);
        return; // Stop submission if upload fails
      }
    } else if (!verifyDocumentUrl) {
      // If it's not a file and not an existing URL, it means it's missing
      alert("Please upload verification document.");
      setLoading(false);
      return;
    }

      const apiParams = {
        ...data,
        storeImage: storeImageUrl,
        verifyDocument: verifyDocumentUrl,
        areaId: 3,
      };

      if (isCreatingNew) {
        // New store should use public create endpoint (no admin auth required)
        const createResult = await addStores(apiParams);
        if (createResult?.data?.success) {
          // Clear all fields after store created
          reset({ areaId: 3 });
          setCreatedStoreId(null);
          setCookie("storeId", "");
          if (storeImagePreviewUrl) URL.revokeObjectURL(storeImagePreviewUrl);
          if (verifyDocumentPreviewUrl) URL.revokeObjectURL(verifyDocumentPreviewUrl);
          setStoreImagePreviewUrl(null);
          setVerifyDocumentPreviewUrl(null);
          try {
            const fileLabel = document.getElementById("fileLabel");
            if (fileLabel) fileLabel.innerText = "No file selected";
            const verifyLabel = document.getElementById("verifyDocumentLabel");
            if (verifyLabel) verifyLabel.innerText = "No file selected";
          } catch { }
          alert("Store created successfully.");
          setLoading(false);
          navigate("/Stores/List");
          return;
        }
        alert(createResult?.data?.msg || "Failed to create store. Please try again.");
        setLoading(false);
        return;
      }

      // Existing store update path
      const updateParams = {
        ...apiParams,
        id: effectiveStoreId || data?.id,
      };
      const result = await updateStores(updateParams);
      if (result?.data?.success) {
        let tempAPIUserData = {
          id: updateParams?.users?.id,
          email: data?.["email"],
          password: data?.["password"],
          verify: updateParams?.status,
        };
        let userResult = await updateUser(tempAPIUserData);
        if (userResult) {
          refetch();
          afterStoreUpdate();
          setLoading(false);
          navigate("/Stores/List");
          return;
        }
      }

      setLoading(false);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const afterStoreUpdate = async () => {
    let tempApiValue = {
      subscriptionCount: 0,
      subscriptionPrice: 0,
      subscriptionType: "Plan0",
      subscriptionPlan: "PL0_000",
      customerId: effectiveStoreId,
      status: 1,
      freeCount: 5
    };

    // if (data?.success) {
    //   let result = await updatesubscription(tempApiValue);
    // } else {
    let result = await addSubCription(tempApiValue);
    // }
    refetch();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex justify-center"
    >
      <div className="w-5/6">
        {String(currentUserRole) === "0" ? <div className="flex items-center justify-between border-b pb-3 mt-2  mb-4">
          <Chip
            size="lg"
            classNames={{
              base: "bg-gradient-to-br  border-small border-white/60 ",
              content: "drop-shadow shadow-black text-white",
            }}
            startContent={<IconStep />}
            variant="faded"
            color="default"
          >
            <p className="font-medium  text-black/70"> Store Update</p>
          </Chip>
          <div className="text-center">
            <Button
              color="primary"
              type="submit"
              size="md"
              className="w-[90px]"
            >
              {loading ? "...Updating" : id ? "Update" : "Create"}
            </Button>
          </div>
        </div> : null}
        {String(currentUserRole) === "0" && effectiveStoreId && (
          <div className="mb-4 p-4 rounded-medium border border-default-200 bg-content2">
            <p className="text-sm font-semibold mb-3">Subscription details</p>
            {!(data?.data as any)?.subscriptions?.length && !(data?.data as any)?.subscription ? (
              <p className="text-sm text-default-500">No subscription records linked to this store.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {(
                  (data?.data as any)?.subscriptions?.length
                    ? (data?.data as any).subscriptions
                    : (data?.data as any)?.subscription
                      ? [(data?.data as any).subscription]
                      : []
                ).map((sub: any) => (
                  <div
                    key={sub.id}
                    className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm border-b border-default-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <span className="text-default-500 text-xs">Sub. ID</span>
                      <p className="font-medium">{String(sub.id ?? "—")}</p>
                    </div>
                    <div>
                      <span className="text-default-500 text-xs">Plan</span>
                      <p className="font-medium">{sub.subscriptionPlan}</p>
                    </div>
                    <div>
                      <span className="text-default-500 text-xs">Type</span>
                      <p className="font-medium">{sub.subscriptionType}</p>
                    </div>
                    <div>
                      <span className="text-default-500 text-xs">Status</span>
                      <p className="font-medium">{sub.status}</p>
                    </div>
                    <div>
                      <span className="text-default-500 text-xs">Price</span>
                      <p className="font-medium">{String(sub.subscriptionPrice ?? "—")}</p>
                    </div>
                    <div>
                      <span className="text-default-500 text-xs">Count</span>
                      <p className="font-medium">{String(sub.subscriptionCount ?? "—")}</p>
                    </div>
                    {sub.freeCount != null && (
                      <div>
                        <span className="text-default-500 text-xs">Free count</span>
                        <p className="font-medium">{sub.freeCount}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-default-500 text-xs">Payment ID</span>
                      <p className="font-medium break-all">{String(sub.paymentId ?? "—")}</p>
                    </div>
                    <div className="col-span-2 md:col-span-4">
                      <span className="text-default-500 text-xs">Created</span>
                      <p className="font-medium">
                        {sub.createdAt
                          ? new Date(sub.createdAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <Controller
            name="storename" // Changed to reflect a text input
            control={control}
            rules={{ required: "Please enter value" }}
            render={({ field }) => (
              <InputNextUI
                type="text"
                label="Store Name"
                {...field}
                isRequired={true}
                isInvalid={errors?.["storename"] ? true : false}
                errorMessage={errors?.["storename"]?.message}
              />
            )}
          />
          {String(currentUserRole) === "0" && (
            <Controller
              name="status" // Changed to reflect a text input
              control={control}
              rules={{ required: "Please enter value" }}
              render={({ field }) => (
                <Select
                  classNames={{
                    label: "group-data-[filled=true]:-translate-y-3",
                    trigger: [
                      "bg-transparent",
                      "border-1",
                      "text-default-500",
                      "transition-opacity",
                      "data-[hover=true]:bg-transparent",
                      "data-[hover=true]:bg-transparent",
                      "dark:data-[hover=true]:bg-transparent",
                      "data-[selectable=true]:focus:bg-transparent",
                    ],
                  }}
                  listboxProps={{
                    itemClasses: {
                      base: [
                        "rounded-md",
                        "text-default-500",
                        "transition-opacity",
                        "data-[hover=true]:text-foreground",
                        "data-[hover=true]:bg-default-100",
                        "dark:data-[hover=true]:bg-default-50",
                        "data-[selectable=true]:focus:bg-default-50",
                        "data-[pressed=true]:opacity-90",
                        "data-[focus-visible=true]:ring-default-500",
                        "shadow-none",
                        // "border-1",
                      ],
                    },
                  }}
                  variant="faded"
                  size="sm"
                  label="Select an Status"
                  {...field}
                  selectedKeys={String(formData?.status)}
                  isRequired={true}
                  isInvalid={errors?.["status"] ? true : false}
                  errorMessage={String(errors?.["status"]?.message || "")}
                >
                  <SelectItem key={"1"}>{"Active"}</SelectItem>
                  <SelectItem key={"0"}>{"InActive"}</SelectItem>
                </Select>
              )}
            />
          )}

          <Controller
            name="storeaddress" // Changed to reflect a text input
            control={control}
            rules={{ required: "Please enter value" }}
            render={({ field }) => (
              <TeaxtareaNextUI
                label="Shop Address"
                {...field}
                isRequired={true}
                isInvalid={errors?.["storeaddress"] ? true : false}
                errorMessage={errors?.["storeaddress"]?.message}
              />
            )}
          />
          <Controller
            name="storedesc" // Changed to reflect a text input
            control={control}
            render={({ field }) => (
              <TeaxtareaNextUI label="Discription" {...field} />
            )}
          />
          <Controller
            name="website" // Changed to reflect a text input
            control={control}
            // rules={{ required: true }}
            render={({ field }) => (
              <InputNextUI type="text" label="website" {...field} />
            )}
          />
          <Controller
            name="location" // Changed to reflect a text input
            control={control}
            rules={{ required: "Please enter value" }}
            render={({ field }) => (
              <InputNextUI
                type="text"
                label="location"
                {...field}
                isRequired={true}
                isInvalid={errors?.["location"] ? true : false} // Corrected field name
                errorMessage={errors?.["location"]?.message} // Corrected field name
              />
            )}
          />
          <Controller
            name="openTime" // Changed to reflect a text input
            control={control}
            rules={{ required: "Please enter value" }}
            render={({ field }) => (
              <InputNextUI
                type="text" // Changed from "test" to "text"
                label="Open Time"
                {...field}
                isRequired={true}
                isInvalid={errors?.["openTime"] ? true : false} // Corrected field name
                errorMessage={errors?.["openTime"]?.message} // Corrected field name
              />
            )}
          />
          <Controller
            name="closeTime" // Changed to reflect a text input
            control={control}
            rules={{ required: "Please enter value" }}
            render={({ field }) => (
              <InputNextUI
                type="text"
                label="Close Time"
                {...field}
                isRequired={true}
                isInvalid={errors?.["closeTime"] ? true : false} // Corrected field name
                errorMessage={errors?.["closeTime"]?.message} // Corrected field name
              />
            )}
          />
          <div className="flex">
              <Controller
                name="storeImage" // Changed to reflect a text input
                control={control}
                rules={{ required: "Please enter value" }}
                render={({ field }) => (
                  <div style={{ position: "relative", width: "100%" }}>
                    <input
                      type="file"
                      id="file"
                      style={{
                        opacity: 0,
                        position: "absolute",
                        zIndex: -1,
                        width: "100%",
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const msg = validateUploadFile(file, {
                            label: "Store Logo",
                            allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
                          });
                          if (msg) {
                            alert(msg);
                            e.currentTarget.value = "";
                            field.onChange(null);
                            if (storeImagePreviewUrl) URL.revokeObjectURL(storeImagePreviewUrl);
                            setStoreImagePreviewUrl(null);
                            try {
                              const fileLabel = document.getElementById("fileLabel");
                              if (fileLabel) fileLabel.innerText = "No file selected";
                            } catch { }
                            return;
                          }
                        }
                        field.onChange(file); // Update form state with selected file
                        document.getElementById("fileLabel").innerText = e.target
                          .files[0]
                          ? e.target.files[0].name
                          : "No file selected"; // Update label dynamically
                        if (storeImagePreviewUrl) URL.revokeObjectURL(storeImagePreviewUrl);
                        setStoreImagePreviewUrl(file ? URL.createObjectURL(file) : null);
                      }}
                    />
                    <label
                      htmlFor="file"
                      style={{
                        border: "1px solid rgba(128, 128, 128, 0.3)",
                        borderRadius: "7px",
                        padding: "10px",
                        width: "100%",
                        display: "inline-block",
                        textAlign: "center",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Choose Logo
                    </label>
                    <span
                      id="fileLabel"
                      style={{
                        marginLeft: "10px",
                        textAlign: "start",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      No file selected
                    </span>
                  </div>
                )}
              />
              {storeImagePreviewUrl ? (
                <Image src={storeImagePreviewUrl} className="h-fit" width={100} />
              ) : data?.data?.storeImage ? (
                <Image src={`${data?.data?.storeImage}`} className="h-fit" width={100} />
              ) : null}
            </div>
        </div>
        <div className="flex flex-col flex-wrap gap-4 border-b pb-3 mb-4">
          <Chip
            size="lg"
            classNames={{
              base: "bg-gradient-to-br  border-small border-white/60 ",
              content: "drop-shadow shadow-black text-white",
            }}
            startContent={<IconStep />}
            variant="faded"
            color="default"
          >
            <p className="font-medium text-black/70"> Owner Details</p>
          </Chip>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <Controller
            name="ownername" // Changed to reflect a text input
            control={control}
            rules={{ required: "Please enter value" }}
            render={({ field }) => (
              <InputNextUI
                type="text"
                label="Owner Name"
                {...field}
                isRequired={true}
                isInvalid={errors?.["ownername"] ? true : false}
                errorMessage={errors?.["ownername"]?.message}
              />
            )}
          />
          <Controller
            name="email" // Changed to reflect a text input
            control={control}
            rules={{ required: "Please enter value" }}
            render={({ field }) => (
              <InputNextUI
                type="email"
                label="Email"
                {...field}
                isRequired={true}
                isInvalid={errors?.["email"] ? true : false}
                errorMessage={errors?.["email"]?.message}
              />
            )}
          />
          <Controller
            name="password" // Changed to reflect a text input
            control={control}
            rules={{
              validate: (v) => {
                // required only for NEW store create; for update you can leave blank to keep existing password
                if (!effectiveStoreId && (!v || String(v).trim().length < 5)) {
                  return "Password is required (min 5 characters) for new store";
                }
                return true;
              },
            }}
            render={({ field }) => (
              <InputNextUI
                type="password"
                label="Password"
                {...field}
                isRequired={!effectiveStoreId}
                isInvalid={errors?.["password"] ? true : false}
                errorMessage={errors?.["password"]?.message}
              />
            )}
          />
          <Controller
            name="phone" // Changed to reflect a text input
            control={control}
            rules={{
              required: "Please enter value in minimum 5 letter",
              maxLength: 10,
            }}
            render={({ field }) => (
              <InputNextUI
                type="text"
                label="Phone Number"
                {...field}
                isRequired={true}
                isInvalid={errors?.["phone"] ? true : false}
                errorMessage={errors?.["phone"]?.message}
              />
            )}
          />

          <Controller
            name="owneraddress" // Changed to reflect a text input
            control={control}
            rules={{ required: "Please enter value" }}
            render={({ field }) => (
              <TeaxtareaNextUI
                label="Owner Address"
                {...field}
                isRequired={true}
                isInvalid={errors?.["owneraddress"] ? true : false}
                errorMessage={errors?.["owneraddress"]?.message}
              />
            )}
          />
          <div className="flex">
              <Controller
                name="verifyDocument" // Changed to reflect a text input
                control={control}
                rules={{ required: "Please enter value" }}
                render={({ field }) => (
                  <div style={{ position: "relative", width: "100%" }}>
                    <input
                      type="file"
                      id="verifyDocument"
                      style={{
                        opacity: 0,
                        position: "absolute",
                        zIndex: -1,
                        width: "100%",
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const msg = validateUploadFile(file, {
                            label: "Government Document",
                            allowedTypes: [
                              "application/pdf",
                              "image/png",
                              "image/jpeg",
                              "image/jpg",
                              "image/webp",
                            ],
                          });
                          if (msg) {
                            alert(msg);
                            e.currentTarget.value = "";
                            field.onChange(null);
                            if (verifyDocumentPreviewUrl) URL.revokeObjectURL(verifyDocumentPreviewUrl);
                            setVerifyDocumentPreviewUrl(null);
                            try {
                              const verifyLabel = document.getElementById("verifyDocumentLabel");
                              if (verifyLabel) verifyLabel.innerText = "No file selected";
                            } catch { }
                            return;
                          }
                        }
                        field.onChange(file); // Update form state with selected file
                        document.getElementById("verifyDocumentLabel").innerText = e.target
                          .files[0]
                          ? e.target.files[0].name
                          : "No file selected"; // Update label dynamically
                        if (verifyDocumentPreviewUrl) URL.revokeObjectURL(verifyDocumentPreviewUrl);
                        setVerifyDocumentPreviewUrl(file ? URL.createObjectURL(file) : null);
                      }}
                    />
                    <label
                      htmlFor="verifyDocument"
                      style={{
                        border: "1px solid rgba(128, 128, 128, 0.3)",
                        borderRadius: "7px",
                        padding: "10px",
                        width: "100%",
                        display: "inline-block",
                        textAlign: "center",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Choose Government Document
                    </label>
                    <span
                      id="verifyDocumentLabel"
                      style={{
                        marginLeft: "10px",
                        textAlign: "start",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      No file selected
                    </span>
                    {errors?.["verifyDocument"] ? <p className="text-red-500">Please upload verify document to verify your store</p> : null}
                  </div>
                )}
              />
              {verifyDocumentPreviewUrl ? (
                <Image src={verifyDocumentPreviewUrl} className="h-fit" width={100} />
              ) : data?.data?.verifyDocument ? (
                <Image src={`${data?.data?.verifyDocument}`} className="h-fit" width={100} />
              ) : null}
            </div>

        </div>
        <div className="flex flex-col flex-wrap gap-4 border-b pb-3 mt-4 mb-4">
          <Chip
            size="lg"
            classNames={{
              base: "bg-gradient-to-br  border-small border-white/60 ",
              content: "drop-shadow shadow-black text-white",
            }}
            startContent={<IconStep />}
            variant="faded"
            color="default"
          >
            <p className="font-medium text-black/70"> Bank Details(Optional)</p>
          </Chip>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <Controller
            name="accountNo" // Changed to reflect a text input
            control={control}
            render={({ field }) => (
              <InputNextUI type="text" label="Accoutn Number" {...field} />
            )}
          />
          <Controller
            name="accountHolderName" // Changed to reflect a text input
            control={control}
            render={({ field }) => (
              <InputNextUI type="text" label="Accoutn Holder Name" {...field} />
            )}
          />
          <Controller
            name="IFSC" // Changed to reflect a text input
            control={control}
            render={({ field }) => (
              <InputNextUI type="text" label="IFSC" {...field} />
            )}
          />
          <Controller
            name="bankName" // Changed to reflect a text input
            control={control}
            render={({ field }) => (
              <InputNextUI type="text" label="Bank Name" {...field} />
            )}
          />
          <Controller
            name="branch" // Changed to reflect a text input
            control={control}
            render={({ field }) => (
              <InputNextUI type="text" label="Branch" {...field} />
            )}
          />
          <Controller
            name="adharCardNo" // Changed to reflect a text input
            control={control}
            render={({ field }) => (
              <InputNextUI type="text" label="Aadhar Number" {...field} />
            )}
          />
          <Controller
            name="panCardNo" // Changed to reflect a text input
            control={control}
            render={({ field }) => (
              <InputNextUI type="text" label="PAN Number" {...field} />
            )}
          />
          <Controller
            name="GSTNo" // Changed to reflect a text input
            control={control}
            render={({ field }) => (
              <InputNextUI type="text" label="GST" {...field} />
            )}
          />
        </div>
      </div>
    </form>
  );
};

export default AddStore;
