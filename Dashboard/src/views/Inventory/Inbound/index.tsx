import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Select,
  SelectItem,
} from "@nextui-org/react";
import React from "react";
import {
  useGetInboundTransactionsQuery,
  useAddInboundTransactionMutation,
  useUpdateInboundTransactionMutation,
  useDeleteInboundTransactionMutation,
} from "../Service.mjs";
import { TableList } from "../../../Components/Table/TableList";
import {
  useGetClientsQuery
} from "../Service.mjs";
import { useGetUserQuery } from "../../../Service.mjs";
import { useGetProductsQuery } from "../../Products/Service.mjs";
import { useGetVendorsProductByIdQuery } from "../../VendorProducts/Service.mjs";
import { useGetStoresProductByIDQuery } from "../../Store/Service.mjs";
import InputNextUI from "../../../Components/Common/Input/input";
import { getCookie } from "../../../JsFiles/CommonFunction.mjs";
import ClientSelector from "../../../Components/Common/ClientSelector";
import { User, Image } from "@nextui-org/react";
import { useUploadFileMutation } from "../../../Service.mjs";
import { infoData } from "../../../configData";

const InboundInventory = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const editId = searchParams.get("id");
  const isEditMode = !!editId;
  
  // Get transaction data from navigation state if available (more reliable)
  const transactionDataFromState = location.state?.transactionData;

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const vendorId = getCookie("vendorId");
  const storeId = getCookie("storeId");
  const currentRole = getCookie("role");
  const userId = getCookie("id");
  const [selectedClient, setSelectedClient] = React.useState<any>(null);
  const [invoicePreviews, setInvoicePreviews] = React.useState<string[]>([]);
  const [selectedInvoiceFileNames, setSelectedInvoiceFileNames] = React.useState<string[]>([]);
  const [uploadFile] = useUploadFileMutation();
  const { data: currentUserData } = useGetUserQuery(Number(userId), { skip: !userId });
  const [filters, setFilters] = React.useState({
    startDate: "",
    endDate: "",
    productId: "",
    clientId: "",
  });

  const [DeleteData] = useDeleteInboundTransactionMutation();
  const navigate = useNavigate();

  const { data, error, refetch } = useGetInboundTransactionsQuery(
    {
      ...filters,
    },
    { skip: !vendorId }
  );

  // Use the same API logic as ProductsList.tsx based on role
  const { 
    data: productsData, 
    isLoading: isLoadingProducts, 
    error: productsError, 
    refetch: refetchProducts 
  } = useGetProductsQuery(undefined, {
    skip: !!vendorId || !!storeId,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: vendorProducts,
    error: vendorError,
    refetch: vendorRefetch,
  } = useGetVendorsProductByIdQuery(Number(vendorId), {
    skip: !vendorId,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: storeProducts,
    error: storeProductsError,
    refetch: storeProductsRefetch,
  } = useGetStoresProductByIDQuery(Number(storeId), {
    skip: !storeId,
    refetchOnMountOrArgChange: true,
  });

  // Get the appropriate products data based on role
  const getProductsData = () => {
    if (currentRole === "0") {
      return productsData;
    } else if (currentRole === "2") {
      return vendorProducts;
    } else {
      return storeProducts;
    }
  };

  const finalProductsData = getProductsData();
  
  // Combine loading states
  const isLoadingProductsFinal = isLoadingProducts || 
    (currentRole === "2" && !vendorProducts && !vendorError) ||
    (currentRole === "1" && !storeProducts && !storeProductsError);
  
  // Combine error states
  const productsErrorFinal = productsError || vendorError || storeProductsError;

  // Use new clients API that filters by current store/vendor
  const {
    data: clientsData,
    isLoading: isLoadingClients,
    error: clientsError
  } = useGetClientsQuery({});

  const [addInbound] = useAddInboundTransactionMutation();
  const [updateInbound] = useUpdateInboundTransactionMutation();
  const [refresh, setRefresh] = React.useState(false);

  // Fetch transaction data when in edit mode (only if not provided via navigation state)
  const { data: editTransactionData, isLoading: isLoadingEditData } = useGetInboundTransactionsQuery(
    {},
    { skip: !vendorId || !isEditMode || !!transactionDataFromState }
  );

  // Find the specific transaction to edit - prefer data from navigation state
  const transactionToEdit = React.useMemo(() => {
    if (!isEditMode) {
      return null;
    }
    
    // First, try to use data from navigation state (most reliable)
    if (transactionDataFromState && transactionDataFromState.id === Number(editId)) {
      return transactionDataFromState;
    }
    
    // Fallback: search in fetched data
    if (editTransactionData?.data && Array.isArray(editTransactionData.data)) {
      return editTransactionData.data.find((item: any) => item.id === Number(editId));
    }
    
    return null;
  }, [isEditMode, editId, transactionDataFromState, editTransactionData]);

  React.useEffect(() => {
    if (refresh && vendorId) {
      refetch();
      reset();
      setRefresh(false);
    }
  }, [refresh, vendorId]);

  React.useEffect(() => {
    if (vendorId) {
      refetch();
    }
  }, [filters, vendorId]);

  // Populate form when transaction data is loaded in edit mode
  React.useEffect(() => {
    if (transactionToEdit && isEditMode) {
      reset({
        clientId: transactionToEdit.clientId || "",
        productId: transactionToEdit.productId || "",
        invoiceNumber: transactionToEdit.invoiceNumber || "",
        quantity: transactionToEdit.quantity || "",
        date: transactionToEdit.date ? new Date(transactionToEdit.date).toISOString().split("T")[0] : "",
        referenceNumber: transactionToEdit.referenceNumber || "",
        notes: transactionToEdit.notes || "",
        invoice: transactionToEdit.invoice || null,
      });

      // Set client if exists
      if (transactionToEdit.clientId && clientsData?.data) {
        const client = clientsData.data.find((c: any) => c.id === transactionToEdit.clientId);
        if (client) {
          setSelectedClient(client);
        }
      }

      // Set invoice preview if invoice exists (single or comma-separated)
      if (transactionToEdit.invoice) {
        const urls = transactionToEdit.invoice.split(",").map((s: string) => s.trim()).filter(Boolean);
        const fullUrls = urls.map((p: string) => p.startsWith("http") ? p : `${infoData.baseApi}/${p}`);
        setInvoicePreviews(fullUrls);
        setSelectedInvoiceFileNames(urls.map((p: string) => p.split("/").pop() || "Invoice file"));
      }
    } else if (!isEditMode) {
      // Reset form when not in edit mode
      reset({
        clientId: "",
        productId: "",
        invoiceNumber: "",
        quantity: "",
        date: new Date().toISOString().split("T")[0],
        referenceNumber: "",
        notes: "",
        invoice: null,
      });
      setSelectedClient(null);
      setInvoicePreviews([]);
      setSelectedInvoiceFileNames([]);
    }
  }, [transactionToEdit, isEditMode, reset, clientsData]);

  const onSubmit = async (formData: any) => {
    let invoiceUrl: string | null = formData.invoice;

    // Handle single file (legacy) or multiple files
    const files = Array.isArray(formData.invoice)
      ? formData.invoice.filter((f: any) => f instanceof File)
      : formData.invoice instanceof File
        ? [formData.invoice]
        : [];

    if (files.length > 0) {
      const storeName = currentUserData?.data?.storename ||
        currentUserData?.data?.storeName ||
        vendorId ||
        storeId ||
        "STORE";
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const invoiceFormData = new FormData();
        invoiceFormData.append("file", file);
        invoiceFormData.append("invoiceNumber", `${formData.invoiceNumber || "invoice"}_${i + 1}`);
        invoiceFormData.append("storeName", storeName);
        const invoiceUploadResult = await uploadFile(invoiceFormData);
        if (invoiceUploadResult?.data?.success) {
          uploadedUrls.push(invoiceUploadResult.data.fileUrl);
        } else {
          alert(`Failed to upload file: ${(file as File).name}`);
          return;
        }
      }
      invoiceUrl = uploadedUrls.join(",");
    } else if (isEditMode && transactionToEdit?.invoice) {
      invoiceUrl = transactionToEdit.invoice;
    }

    let tempApiParams = {
      ...formData,
      clientId: formData.clientId || null,
      invoice: invoiceUrl,
      date: formData.date || new Date().toISOString().split("T")[0],
    };

    // Add ID for update operation
    if (isEditMode && editId) {
      tempApiParams.id = Number(editId);
    }

    // Note: vendorId is automatically extracted from authenticated user's session on backend

    try {
      let result;
      if (isEditMode) {
        result = await updateInbound(tempApiParams).unwrap();
      } else {
        result = await addInbound(tempApiParams).unwrap();
      }

      if (result?.success) {
        reset();
        setInvoicePreviews([]);
        setSelectedInvoiceFileNames([]);
        // Show success message before navigation
        alert(isEditMode ? "Purchase record updated successfully" : "Purchase record added successfully");
        // Navigate to PurchaseList page (it will handle its own data fetching)
        navigate("/Inventory/PurchaseList");
      } else {
        alert(result?.message || (isEditMode ? "Failed to update inbound transaction" : "Failed to add inbound transaction"));
      }
    } catch (error: any) {
      alert(error?.data?.message || error?.message || (isEditMode ? "Failed to update inbound transaction" : "Failed to add inbound transaction"));
    }
  };

  const defaultColumns = [
    "id",
    "client",
    "product",
    "quantity",
    "invoiceNumber",
    "date",
    "referenceNumber",
    "actions",
  ];

  const columns = [
    { name: "S.No", id: "id", sortable: true },
    { name: "Client", id: "client", sortable: true },
    { name: "Product", id: "product", sortable: true },
    { name: "Quantity", id: "quantity", sortable: true },
    { name: "Invoice Number", id: "invoiceNumber", sortable: true },
    { name: "Date", id: "date", sortable: true },
    { name: "Reference", id: "referenceNumber", sortable: false },
    { name: "Actions", id: "actions" },
  ];

  const onDelete = async (deleteID: number) => {
    if (deleteID && confirm("Are you sure you want to delete this transaction?")) {
      try {
        await DeleteData(deleteID).unwrap();
        refetch();
        alert("Transaction deleted successfully");
      } catch (error: any) {
        alert(error?.data?.message || error?.message || "Failed to delete transaction");
      }
    }
  };

  const renderCell = React.useCallback(
    (items: any, columnKey: string) => {
      const cellValue = items[columnKey];
      switch (columnKey) {
        case "client":
          return items?.client ? (
            <User
              name={items.client.firstName || items.client.email}
              description={items.client.email}
              avatarProps={{
                name: items.client.firstName || items.client.email,
              }}
            >
              {items.client.phone || ""}
            </User>
          ) : (
            <span className="text-default-400">N/A</span>
          );
        case "product":
          return items?.product ? (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{items.product.name}</p>
            </div>
          ) : (
            "N/A"
          );
        case "invoiceNumber":
          return items.invoiceNumber ? (
            <div className="flex flex-col gap-1">
              <Chip size="sm" variant="flat" color="secondary">
                {items.invoiceNumber}
              </Chip>
              {items.invoice && (
                <a
                  href={`${infoData.baseApi}/${items.invoice}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-tiny underline"
                >
                  View Invoice
                </a>
              )}
            </div>
          ) : (
            <span className="text-default-400">-</span>
          );
        case "quantity":
          return (
            <Chip size="sm" variant="flat" color="success">
              {cellValue}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" variant="flat">
                    Action
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    onClick={() => {
                      onDelete(items?.id);
                    }}
                    className="text-danger"
                    color="danger"
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue ? cellValue : "No Data";
      }
    },
    []
  );

  // Show loading state when fetching edit data (only if we don't have it from state)
  if (isEditMode && isLoadingEditData && !transactionDataFromState) {
    return (
      <div className="mx-1">
        <div className="flex justify-center items-center p-8">
          <p className="text-default-500">Loading purchase record...</p>
        </div>
      </div>
    );
  }

  // Show error if transaction not found in edit mode
  if (isEditMode && !isLoadingEditData && !transactionToEdit) {
    return (
      <div className="mx-1">
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-danger mb-4">Purchase record not found</p>
          <Button
            color="primary"
            onClick={() => navigate("/Inventory/Inbound")}
            size="md"
            variant="flat"
          >
            Go to Add Purchase
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-1">
      <form onSubmit={handleSubmit(onSubmit)} className="px-2">
        <div className="flex items-center justify-between border-b pb-3 mt-1.5 mb-3">
          <div>
            <Chip
              size="lg"
              className="py-4 px-2"
              classNames={{
                base: "bg-gradient-to-br border-small border-white/60",
                content: "drop-shadow shadow-black text-white",
              }}
              startContent={
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z"
                    fill="green"
                  />
                </svg>
              }
              variant="faded"
              color="default"
            >
              <p className="font-medium text-black/70">
                {isEditMode ? "Edit Inbound Inventory" : "Add Inbound Inventory"}
              </p>
            </Chip>
          </div>
          <div className="text-center w-[100px]">
            <Button 
              color="primary" 
              size="md" 
              type="submit" 
              className="w-full"
              isLoading={isLoadingEditData}
            >
              {isEditMode ? "Update" : "Submit"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="clientId"
              control={control}
              render={({ field }) => (
                <ClientSelector
                  value={field.value || 0}
                  onChange={(value) => {
                    field.onChange(value);
                    const client = clientsData?.data?.find((c: any) => c.id === Number(value));
                    setSelectedClient(client || null);
                  }}
                  onClientSelect={setSelectedClient}
                  label="Select Client (Optional)"
                  size="sm"
                />
              )}
            />

            <Controller
              name="productId"
              control={control}
              rules={{
                required: "Product selection is required",
                validate: (value) => value !== "0" && value !== 0 || "Please select a valid product"
              }}
              render={({ field }) => {
                const productList = finalProductsData?.data && Array.isArray(finalProductsData.data) ? finalProductsData.data : [];
                const autocompleteItems = productList.map((item: any) => {
                  const product = item?.product || item;
                  const productId = product?.id || item?.id;
                  const productName = product?.name || item?.name || `Product ${productId}`;
                  return { key: String(productId), value: String(productId), label: productName };
                });
                return (
                  <div className="flex flex-col">
                    <Autocomplete
                      label="Select Product"
                      variant="faded"
                      size="sm"
                      placeholder={isLoadingProductsFinal ? "Loading products..." : "Search or select a product"}
                      isRequired
                      isInvalid={!!errors.productId}
                      errorMessage={errors.productId?.message as string}
                      selectedKey={field.value ? String(field.value) : null}
                      onSelectionChange={(key) => {
                        field.onChange(key ? Number(key) : "");
                      }}
                      isLoading={isLoadingProductsFinal}
                      isDisabled={isLoadingProductsFinal}
                      defaultFilter={(textValue, inputValue) => {
                        if (!inputValue) return true;
                        return String(textValue).toLowerCase().includes(inputValue.toLowerCase());
                      }}
                      defaultItems={autocompleteItems}
                    >
                      {(item: { key: string; value: string; label: string }) => (
                        <AutocompleteItem key={item.key} value={item.value}>
                          {item.label}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                    {productsErrorFinal && (
                      <div className="mt-1">
                        <p className="text-danger text-tiny">
                          {productsErrorFinal?.data?.message || productsErrorFinal?.message || "Failed to load products"}
                        </p>
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() => {
                            if (currentRole === "0") {
                              refetchProducts();
                            } else if (currentRole === "2") {
                              vendorRefetch();
                            } else {
                              storeProductsRefetch();
                            }
                          }}
                          className="mt-1"
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                  </div>
                );
              }}
            />

            <Controller
              name="invoiceNumber"
              control={control}
              rules={{
                required: "Invoice number is required",
                minLength: {
                  value: 3,
                  message: "Invoice number must be at least 3 characters"
                },
                maxLength: {
                  value: 50,
                  message: "Invoice number must not exceed 50 characters"
                },
                pattern: {
                  value: /^[A-Za-z0-9\-_/]+$/,
                  message: "Invoice number can only contain letters, numbers, hyphens, underscores, and slashes"
                }
              }}
              render={({ field }) => (
                <InputNextUI
                  type="text"
                  label="Invoice Number"
                  size="sm"
                  isRequired
                  isInvalid={!!errors.invoiceNumber}
                  errorMessage={errors.invoiceNumber?.message}
                  placeholder="Enter invoice number (e.g., INV-2024-001)"
                  {...field}
                />
              )}
            />

            <Controller
              name="quantity"
              control={control}
              rules={{
                required: "Quantity is required",
                min: {
                  value: 1,
                  message: "Quantity must be at least 1"
                },
                max: {
                  value: 999999,
                  message: "Quantity must not exceed 999,999"
                },
                validate: (value) => {
                  if (!Number.isInteger(Number(value))) {
                    return "Quantity must be a whole number";
                  }
                  return true;
                }
              }}
              render={({ field }) => (
                <InputNextUI
                  type="number"
                  label="Quantity"
                  size="sm"
                  isRequired
                  isInvalid={!!errors.quantity}
                  errorMessage={errors.quantity?.message as string}
                  placeholder="Enter quantity"
                  min="1"
                  {...field}
                  onChange={(value) => {
                    // InputNextUI passes the value directly, not an event
                    const stringValue = typeof value === 'string' ? value : String(value || '');
                    const numValue = Number(stringValue);
                    if (stringValue === "" || (!isNaN(numValue) && numValue >= 0 && numValue <= 999999)) {
                      field.onChange(stringValue === "" ? "" : Number(stringValue));
                    }
                  }}
                />
              )}
            />

            <Controller
              name="date"
              control={control}
              rules={{
                required: "Date is required",
                validate: (value) => {
                  if (!value) return "Date is required";
                  const selectedDate = new Date(value);
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  if (selectedDate > today) {
                    return "Date cannot be in the future";
                  }
                  const minDate = new Date("2000-01-01");
                  if (selectedDate < minDate) {
                    return "Date cannot be before year 2000";
                  }
                  return true;
                }
              }}
              render={({ field }) => (
                <InputNextUI
                  type="date"
                  label="Transaction Date"
                  size="sm"
                  isRequired
                  isInvalid={!!errors.date}
                  errorMessage={errors.date?.message as string}
                  defaultValue={new Date().toISOString().split("T")[0]}
                  {...field}
                />
              )}
            />

            <Controller
              name="referenceNumber"
              control={control}
              rules={{
                maxLength: {
                  value: 100,
                  message: "Reference number must not exceed 100 characters"
                }
              }}
              render={({ field }) => (
                <InputNextUI
                  type="text"
                  label="Reference Number (Optional)"
                  size="sm"
                  isInvalid={!!errors.referenceNumber}
                  errorMessage={errors.referenceNumber?.message}
                  placeholder="Enter reference number (optional)"
                  {...field}
                />
              )}
            />

            <Controller
              name="notes"
              control={control}
              rules={{
                maxLength: {
                  value: 500,
                  message: "Notes must not exceed 500 characters"
                }
              }}
              render={({ field }) => (
                <InputNextUI
                  type="text"
                  label="Notes (Optional)"
                  size="sm"
                  isInvalid={!!errors.notes}
                  errorMessage={errors.notes?.message}
                  placeholder="Enter any additional notes (optional)"
                  {...field}
                />
              )}
            />

            <Controller
              name="invoice"
              control={control}
              rules={{
                required: !isEditMode ? "At least one invoice file is required" : false,
                validate: (value) => {
                  const files = Array.isArray(value) ? value : value instanceof File ? [value] : [];
                  if (!isEditMode && files.length === 0 && !value) return "At least one invoice file is required";
                  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
                  for (const f of files) {
                    if (f instanceof File) {
                      if (!validTypes.includes(f.type)) return "All files must be image (JPEG, PNG, GIF, WEBP) or PDF";
                      if (f.size > 5 * 1024 * 1024) return "Each file must not exceed 5MB";
                    }
                  }
                  return true;
                }
              }}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Upload Invoice (multiple) {!isEditMode && <span className="text-danger">*</span>}
                    {isEditMode && <span className="text-default-400 text-tiny ml-2">(Optional - leave empty to keep existing)</span>}
                  </label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <input
                      type="file"
                      id="invoiceFile"
                      accept="image/*,application/pdf"
                      multiple
                      style={{
                        opacity: 0,
                        position: "absolute",
                        zIndex: -1,
                        width: "100%",
                      }}
                      onChange={(e) => {
                        const fileList = e.target.files;
                        if (!fileList || fileList.length === 0) {
                          setSelectedInvoiceFileNames([]);
                          setInvoicePreviews([]);
                          field.onChange(isEditMode ? null : []);
                          e.target.value = "";
                          return;
                        }
                        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
                        const files: File[] = [];
                        const names: string[] = [];
                        for (let i = 0; i < fileList.length; i++) {
                          const file = fileList[i];
                          if (!validTypes.includes(file.type)) {
                            alert(`Invalid type: ${file.name}. Use image (JPEG, PNG, GIF, WEBP) or PDF.`);
                            e.target.value = "";
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            alert(`File too large (max 5MB): ${file.name}`);
                            e.target.value = "";
                            return;
                          }
                          files.push(file);
                          names.push(file.name);
                        }
                        field.onChange(files);
                        setSelectedInvoiceFileNames(names);
                        const imageFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
                        if (imageFiles.length === 0) {
                          setInvoicePreviews([]);
                          return;
                        }
                        let loaded = 0;
                        const previews: string[] = [];
                        imageFiles.forEach((file, idx) => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            previews[idx] = reader.result as string;
                            loaded++;
                            if (loaded === imageFiles.length) setInvoicePreviews(previews.filter(Boolean));
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                    />
                    <label
                      htmlFor="invoiceFile"
                      className={`block p-3 border rounded-lg cursor-pointer text-center transition-colors ${errors.invoice
                          ? 'border-danger bg-danger-50'
                          : 'border-default-300 bg-default-50 hover:bg-default-100'
                        }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 2V8H20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-sm text-foreground-600">
                          {selectedInvoiceFileNames.length === 0
                            ? "No files selected"
                            : `${selectedInvoiceFileNames.length} file(s): ${selectedInvoiceFileNames.join(", ")}`}
                        </span>
                        <span className="text-xs text-foreground-400">
                          Click to upload multiple (Max 5MB each, Image or PDF)
                        </span>
                      </div>
                    </label>
                  </div>
                  {invoicePreviews.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {invoicePreviews.map((src, i) => (
                        <Image
                          key={i}
                          src={src}
                          alt={`Invoice preview ${i + 1}`}
                          width={120}
                          height={120}
                          className="rounded-lg border border-default-200 object-cover"
                        />
                      ))}
                    </div>
                  )}
                  {errors.invoice && (
                    <p className="text-danger text-tiny mt-1">{errors.invoice.message as string}</p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default InboundInventory;

