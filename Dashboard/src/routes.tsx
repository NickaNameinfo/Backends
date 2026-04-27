import React from "react";
const AddVendors = React.lazy(() => import("../src/views/vendors/Add"));
const EditVendors = React.lazy(() => import("../src/views/vendors/Add"));
const VendorsList = React.lazy(() => import("../src/views/vendors/List"));
const AddStock = React.lazy(
  () => import("../src/views/vendors/Stock/AddStock")
);
const CategoriesAdd = React.lazy(
  () => import("../src/views/Categories/CategoriesAdd")
);
const AddProducts = React.lazy(
  () => import("../src/views/Products/AddProducts")
);
const ProductsList = React.lazy(
  () => import("../src/views/Products/ProductsList")
);
const ScanBarcode = React.lazy(
  () => import("../src/views/Products/ScanBarcode")
);
const AddStores = React.lazy(() => import("../src/views/Store/AddStore"));
const EditStores = React.lazy(() => import("../src/views/Store/AddStore"));
const CustomersList = React.lazy(() => import("../src/views/Customers"));
const CustomersOrderList = React.lazy(() => import("../src/views/Customers/CustomersOrderList"));
const CustomizeOrderList = React.lazy(() => import("../src/views/Customers/CustomizeOrderList"));
const StoresList = React.lazy(() => import("../src/views/Store/StoreList"));
const StoreTrashList = React.lazy(() => import("../src/views/Store/StoreTrashList"));
const StoreSubscriptions = React.lazy(() => import("../src/views/Store/StoreSubscriptions"));
const VendorProducts = React.lazy(
  () => import("../src/views/VendorProducts/index")
);
const VendorDetails = React.lazy(
  () => import("../src/views/VendorProducts/VendorDetails/index")
);
const Subscriptions = React.lazy(
  () => import("../src/views/Subscriptions/index")
);
const Dashboard = React.lazy(() => import("../src/views/Dashboard/index"));
const YourOrders = React.lazy(() => import("../src/views/Orders/index"));
const AddBill = React.lazy(() => import("../src/views/Billing/AddBill"));
const BillsList = React.lazy(() => import("../src/views/Billing/BillsList"));
const ViewBill = React.lazy(() => import("../src/views/Billing/ViewBill"));
const InboundInventory = React.lazy(() => import("../src/views/Inventory/Inbound"));
const PurchaseList = React.lazy(() => import("../src/views/Inventory/PurchaseList"));
const AddClient = React.lazy(() => import("../src/views/Inventory/Clients/AddClient"));
const ClientList = React.lazy(() => import("../src/views/Inventory/Clients/ClientList"));
const AddClientProduct = React.lazy(() => import("../src/views/Inventory/ClientProducts/AddClientProduct"));
const ClientProductsList = React.lazy(() => import("../src/views/Inventory/ClientProducts/ClientProductsList"));
const InventorySummary = React.lazy(() => import("../src/views/Inventory/Summary"));
const Settings = React.lazy(() => import("../src/views/Settings"));
const Reports = React.lazy(() => import("../src/views/Reports"));
const StoreReports = React.lazy(() => import("../src/views/Store/StoreReports"));
const InvoiceFormats = React.lazy(() => import("../src/views/InvoiceFormats"));

const routes = [
  { path: "/", exact: false, name: "Home" },
  { path: "/Dashboard", exact: false, name: "Dashboard", element: Dashboard },
  { path: "/Vendors/Add", name: "Dashboard", element: AddVendors },
  { path: "/Vendors/Edit/:itemId", name: "Dashboard", element: EditVendors },
  { path: "/Vendors/List", name: "Dashboard", element: VendorsList },
  { path: "/Customers", name: "Customers", element: CustomersList },
  { path: "/CustomersOrderList", name: "Orders", element: CustomersOrderList },
  { path: "/CustomizeOrderList", name: "Orders", element: CustomizeOrderList },
  { path: "/CategoriesAdd", name: "CategoriesAdd", element: CategoriesAdd },
  {
    path: "/AddProducts/:productId?",
    name: "AddProducts",
    element: AddProducts,
  },
  { path: "/ProductsList", name: "ProductsList", element: ProductsList },
  { path: "/ScanBarcode", name: "ScanBarcode", element: ScanBarcode },
  { path: "/AddStock", name: "AddStock", element: AddStock },
  { path: "/Stores/Add", name: "AddStores", element: AddStores },
  { path: "/Stores/Edit/:itemId", name: "EditStores", element: EditStores },
  { path: "/Stores/List", name: "StoresList", element: StoresList },
  { path: "/Stores/Trash", name: "StoresTrash", element: StoreTrashList },
  { path: "/Stores/Subscriptions", name: "StoreSubscriptions", element: StoreSubscriptions },
  { path: "/Dashboard/Stores/Subscriptions", name: "StoreSubscriptions", element: StoreSubscriptions },
  {
    path: "/Vendors/Products",
    name: "VendorProductList",
    element: VendorProducts,
  },
  {
    path: "/Vendors/Products/Details/:id",
    name: "VendorProductDetails",
    element: VendorDetails,
  },
  { path: "/Subscriptions", name: "Subscriptions", element: Subscriptions },
  { path: "/YourOrders", name: "YourOrders", element: YourOrders },
  { path: "/Billing/Add", name: "AddBill", element: AddBill },
  { path: "/Billing/List", name: "BillsList", element: BillsList },
  { path: "/Billing/View/:id", name: "ViewBill", element: ViewBill },
  { path: "/Inventory/Inbound", name: "Inbound Inventory", element: InboundInventory },
  { path: "/Inventory/PurchaseList", name: "Purchase List", element: PurchaseList },
  { path: "/Inventory/Clients/Add", name: "Add Client", element: AddClient },
  { path: "/Inventory/Clients/Add/:id", name: "Edit Client", element: AddClient },
  { path: "/Inventory/Clients/List", name: "Client List", element: ClientList },
  { path: "/Inventory/ClientProducts/Add", name: "Add Client Product", element: AddClientProduct },
  { path: "/Inventory/ClientProducts/Add/:productId", name: "Edit Client Product", element: AddClientProduct },
  { path: "/Inventory/ClientProducts/List", name: "Client Products List", element: ClientProductsList },
  { path: "/Inventory/Summary", name: "Inventory Summary", element: InventorySummary },
  { path: "/Settings", name: "Settings", element: Settings },
  { path: "/Reports", name: "Reports", element: Reports },
  // Keep both paths to support deployments that mount under `/Dashboard/*`
  { path: "/StoreReports", name: "Store Reports", element: StoreReports },
  { path: "/Dashboard/StoreReports", name: "Store Reports", element: StoreReports },
  { path: "/InvoiceFormats", name: "Invoice Formats", element: InvoiceFormats },
];

export default routes;
