-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 15, 2024 at 07:47 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nick_portal`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `orderId` int(11) DEFAULT NULL,
  `custId` int(11) DEFAULT NULL,
  `discrict` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `states` varchar(255) DEFAULT NULL,
  `area` varchar(255) DEFAULT NULL,
  `shipping` text DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ads`
--

CREATE TABLE `ads` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `adImage` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `storeId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `areas`
--

CREATE TABLE `areas` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `locationId` int(11) DEFAULT NULL,
  `zipcode` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `areas`
--

INSERT INTO `areas` (`id`, `name`, `locationId`, `zipcode`, `status`, `createdAt`, `updatedAt`) VALUES
(3, 'Chennai', 3, 600001, 1, '2024-08-22 23:50:55', '2024-08-22 23:50:55');

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `orderId` int(11) NOT NULL,
  `price` int(11) DEFAULT NULL,
  `total` int(11) DEFAULT NULL,
  `qty` int(11) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `productId`, `name`, `orderId`, `price`, `total`, `qty`, `photo`, `createdAt`, `updatedAt`) VALUES
(37, 9, 'Palkova', 25, 12, 120, 9, 'uploads\\photo_1725386492620.jpg', '2024-09-17 17:48:24', '2024-09-19 15:53:49'),
(38, 11, 'Cake', 25, 1231, 6155, 6, 'uploads\\photo_1725386941497.jpeg', '2024-09-17 17:58:13', '2024-10-22 13:41:05'),
(39, 13, 'ice', 25, 234, 234, 2, 'uploads\\photo_1725387154541.jpg', '2024-09-17 17:58:44', '2024-09-17 17:59:43'),
(40, 13, 'ice', 25, 234, NULL, 1, 'uploads\\photo_1725387154541.jpg', '2024-09-17 17:58:50', '2024-09-17 17:58:50'),
(41, 15, 'samosa', 25, 345, 690, 3, 'uploads\\photo_1725387639749.png', '2024-09-17 17:59:37', '2024-10-22 13:41:17'),
(42, 0, NULL, 25, 12, 12, 2, NULL, '2024-09-19 15:58:25', '2024-10-22 13:45:48'),
(43, 0, NULL, 26, 280, NULL, 1, NULL, '2024-09-19 16:23:46', '2024-09-19 16:23:46'),
(44, 11, 'Cake', 23, 1231, NULL, 1, 'uploads\\photo_1725386941497.jpeg', '2024-09-26 17:58:59', '2024-09-26 17:58:59'),
(46, 0, NULL, 23, 3000, 3000, 2, NULL, '2024-10-22 13:56:13', '2024-11-11 19:05:32'),
(47, 9, 'Palkova', 23, 12, 0, 1, 'uploads\\photo_1725386492620.jpg', '2024-10-22 14:01:45', '2024-10-22 14:01:48'),
(48, 46, 'test product2', 23, 454, NULL, 1, 'uploads\\photo_1731243487093.png', '2024-11-14 18:33:21', '2024-11-14 18:33:21'),
(49, 47, 'java', 23, 475000, 950000, 3, 'uploads\\photo_1731261985484.jpeg', '2024-11-14 18:33:26', '2024-11-14 18:33:27');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `createdId` text DEFAULT NULL,
  `createdType` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `createdAt`, `updatedAt`, `createdId`, `createdType`) VALUES
(17, 'Sweets', 'Sweets', '2024-08-25 08:13:18', '2024-08-25 08:13:18', '27', 'Vendor'),
(18, 'Test@214123', 'Test@214123', '2024-08-26 18:08:26', '2024-08-26 18:08:26', '17', 'Store'),
(19, 'bike', 'bike', '2024-09-03 18:29:24', '2024-09-03 18:29:24', '18', 'Store'),
(20, 'Hospitals', 'Hospitals', '2024-09-15 12:57:46', '2024-09-15 12:57:46', '24', 'Store'),
(21, 'Hotels', 'Hotels', '2024-09-15 12:58:49', '2024-09-15 12:58:49', '24', 'Store'),
(22, 'cars', 'hundai', '2024-09-23 16:37:28', '2024-09-23 16:37:28', '23', 'Store'),
(23, 'cars', 'hundai', '2024-09-23 16:37:36', '2024-09-23 16:37:36', '23', 'Store'),
(24, 'Sweets', 'Sweets', '2024-10-24 18:27:38', '2024-10-24 18:27:38', '23', 'Store'),
(25, 'Sweets', 'Sweets', '2024-10-24 18:27:43', '2024-10-24 18:27:43', '23', 'Store'),
(26, 'Sweets', 'Sweets', '2024-10-24 19:23:22', '2024-10-24 19:23:22', NULL, 'Store'),
(27, 'Sweetss', 'Sweetss', '2024-10-24 19:29:23', '2024-10-24 19:29:23', NULL, 'Store');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `userid` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `zipcode` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `name`, `status`, `zipcode`, `createdAt`, `updatedAt`) VALUES
(3, 'TamilNadu', 1, 600001, '2024-08-22 23:50:23', '2024-08-22 23:50:23');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `custId` int(11) NOT NULL,
  `number` varchar(255) DEFAULT NULL,
  `paymentmethod` varchar(255) DEFAULT NULL,
  `deliverydate` datetime DEFAULT NULL,
  `grandtotal` int(11) DEFAULT NULL,
  `status` enum('processing','shipping','delivered','cancelled') DEFAULT 'processing',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `custId` int(11) NOT NULL,
  `amount` double DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `orderCreationId` varchar(255) DEFAULT NULL,
  `razorpayPaymentId` varchar(255) DEFAULT NULL,
  `razorpayOrderId` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productfeedbacks`
--

CREATE TABLE `productfeedbacks` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `vendorId` int(11) NOT NULL,
  `storeId` int(11) NOT NULL,
  `feedBack` varchar(255) DEFAULT NULL,
  `rating` varchar(255) DEFAULT NULL,
  `customizedMessage` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productoffers`
--

CREATE TABLE `productoffers` (
  `id` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `discount_per` varchar(255) DEFAULT NULL,
  `discount_price` float DEFAULT NULL,
  `qty` int(11) DEFAULT NULL,
  `total` float DEFAULT NULL,
  `net_price` float DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productphotos`
--

CREATE TABLE `productphotos` (
  `id` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `imgUrl` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `subCategoryId` int(11) DEFAULT NULL,
  `childCategoryId` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `unitSize` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `buyerPrice` int(11) DEFAULT NULL,
  `price` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `discountPer` int(11) DEFAULT NULL,
  `discount` int(11) DEFAULT NULL,
  `total` int(11) NOT NULL,
  `netPrice` int(11) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `sortDesc` text DEFAULT NULL,
  `desc` text DEFAULT NULL,
  `paymentMode` varchar(255) DEFAULT NULL,
  `createdId` int(11) DEFAULT NULL,
  `createdType` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `isEnableEcommerce` varchar(255) DEFAULT NULL,
  `isEnableCustomize` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `categoryId`, `subCategoryId`, `childCategoryId`, `name`, `slug`, `brand`, `unitSize`, `status`, `buyerPrice`, `price`, `qty`, `discountPer`, `discount`, `total`, `netPrice`, `photo`, `sortDesc`, `desc`, `paymentMode`, `createdId`, `createdType`, `createdAt`, `updatedAt`, `isEnableEcommerce`, `isEnableCustomize`) VALUES
(45, 17, 3, 3, 'Test product', 'Test product', 'null', '1', '1', 0, 10, 1, 0, 2, 10, 0, 'uploads\\photo_1731243367961.png', 'test', 'null', '1,2,3', 17, 'Store', '2024-11-10 12:56:07', '2024-11-10 18:30:54', '0', 1),
(46, 18, 3, 3, 'test product2', 'test product2', 'null', '3', '1', 0, 78, 2, 34, 43, 89, 0, 'uploads\\photo_1731243487093.png', 'test', 'null', '1,2', 17, 'Store', '2024-11-10 12:58:07', '2024-11-10 18:29:35', '1', 1),
(47, 19, 3, 3, 'java', 'java', 'null', '2', '1', 0, 500000, 1, 25000, 5, 475000, 0, 'uploads\\photo_1731261985484.jpeg', 'test', 'null', '1,2,3', 17, 'Store', '2024-11-10 17:19:18', '2024-11-10 18:23:37', '1', 1);

-- --------------------------------------------------------

--
-- Table structure for table `requeststores`
--

CREATE TABLE `requeststores` (
  `id` int(11) NOT NULL,
  `requestId` varchar(255) DEFAULT NULL,
  `requesterName` varchar(255) DEFAULT NULL,
  `contactPerson` varchar(255) DEFAULT NULL,
  `vendorName` int(11) NOT NULL,
  `contactEmail` varchar(255) DEFAULT NULL,
  `contactPhone` varchar(255) DEFAULT NULL,
  `vendorInformation` varchar(255) DEFAULT NULL,
  `billingAddress` varchar(255) DEFAULT NULL,
  `paymentMethod` varchar(255) DEFAULT NULL,
  `deliverType` varchar(255) DEFAULT NULL,
  `requestDate` datetime DEFAULT NULL,
  `emergencyContact` varchar(255) DEFAULT NULL,
  `deliveryDate` datetime DEFAULT NULL,
  `requestType` varchar(255) DEFAULT NULL,
  `priority` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unitPrice` decimal(10,0) DEFAULT NULL,
  `totalCost` decimal(10,0) DEFAULT NULL,
  `serviceDescription` varchar(255) DEFAULT NULL,
  `relatedDocuments` varchar(255) DEFAULT NULL,
  `legalCompliance` varchar(255) DEFAULT NULL,
  `urgencyLevel` varchar(255) DEFAULT NULL,
  `shippingInformation` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('20240527193133-create-customers-table.js'),
('20240527200657-create-users-table.js'),
('20240527201934-create-orders-table.js'),
('20240527202017-create-addresses-table.js'),
('20240527202215-create-locations-table.js'),
('20240527202303-create-areas-table.js'),
('20240527202403-create-carts-table.js'),
('20240527202449-create-categories-table.js'),
('20240527202541-create-payments-table.js'),
('20240527202643-create-subcategories-table.js'),
('20240527202717-create-subchildcategories-table.js'),
('20240527202745-create-products-table.js'),
('20240527202824-create-productoffers-table.js'),
('20240527202900-create-productphotos-table.js'),
('20240527203037-create-vendors-table.js'),
('20240527203110-create-vendorareas-table.js'),
('20240527203127-create-vendorproducts-table.js'),
('20240704185201-create-vendorStock.js'),
('20240704192035-create-vendorStock.js'),
('20240707093958-creating_stocktable-vendors.js'),
('20240707101932-creating_stocktable-vendors.js'),
('20240721133703-create-store.js'),
('20240721141529-create-store-area.js'),
('20240721145131-create-store-products.js'),
('20240721173616-create-store-products.js'),
('20240721174503-add-multiple-columns-to-vendor.js'),
('20240721175732-add-multiple-columns-to-store.js'),
('20240725181148-create-request-store.js'),
('20240804121141-update-vendor-columns.js'),
('20240806153356-add-column-to-product.js'),
('20240825075201-add-column-to-categories.js'),
('20240825081725-add-column-to-products.js'),
('20240826171559-add-column-to-store.js'),
('20240829184054-creating-products-table.js'),
('20240922124437-create-productFeedback.js'),
('20240926170348-create-scubscription.js'),
('20240926181114-create-ad.js'),
('20240927200555-add-new-column-to-product.js');

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` int(11) NOT NULL,
  `storename` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `storeaddress` text DEFAULT NULL,
  `storedesc` text DEFAULT NULL,
  `ownername` varchar(255) DEFAULT NULL,
  `owneraddress` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `areaId` int(11) NOT NULL,
  `accountNo` varchar(255) DEFAULT NULL,
  `accountHolderName` varchar(255) DEFAULT NULL,
  `bankName` varchar(255) DEFAULT NULL,
  `IFSC` varchar(255) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `adharCardNo` int(11) DEFAULT NULL,
  `panCardNo` varchar(255) DEFAULT NULL,
  `GSTNo` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `website` varchar(255) DEFAULT NULL,
  `storeImage` varchar(255) DEFAULT NULL,
  `openTime` varchar(255) DEFAULT NULL,
  `closeTime` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `storename`, `status`, `storeaddress`, `storedesc`, `ownername`, `owneraddress`, `email`, `password`, `phone`, `areaId`, `accountNo`, `accountHolderName`, `bankName`, `IFSC`, `branch`, `adharCardNo`, `panCardNo`, `GSTNo`, `createdAt`, `updatedAt`, `website`, `storeImage`, `openTime`, `closeTime`, `location`) VALUES
(17, 'N Delights', 1, '798', '978', '2323', '3223', 'ndelights@gmail.com', 'ndelights@gmail.com', '1234567890', 3, '34523', '786667887', 'asdfasd', '234523234', 'dfqwer', 42342, '2345234', '452345', '2024-08-26 16:45:00', '2024-10-24 18:04:16', '97', 'uploads\\storeImage_1729792969013.png', '6', '18', '675'),
(18, 'samze', 0, 'chennai', 'tesuoiw', 'samz', 'samze@gmail.com', 'samze@gmail.com', 'samze@gmail.com', '983423267', 3, 'null', 'null', 'null', 'null', 'null', 0, 'null', 'null', '2024-09-03 18:24:56', '2024-09-03 18:28:26', 'lkjal;sdfj', 'uploads\\storeImage_1725388106815.jpg', '4', '23.50', 'sdfasd'),
(19, 'xyz', 0, 'adsfaasd', 'asdf', 'asdfasd', 'fasdf', 'zyx@portel.com', 'zyx@portel.com', '1234567890', 3, '234523452', '2345234', '234523', '234523', '234524', 234523, '4345324', '2345234', '2024-09-19 16:21:11', '2024-09-19 16:21:11', 'asdfas4545', '', 'wertwer', 'wertwe', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `store_areas`
--

CREATE TABLE `store_areas` (
  `id` int(11) NOT NULL,
  `storeId` int(11) NOT NULL,
  `areaId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_products`
--

CREATE TABLE `store_products` (
  `id` int(11) NOT NULL,
  `supplierId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `price` int(11) DEFAULT NULL,
  `unitSize` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `store_products`
--

INSERT INTO `store_products` (`id`, `supplierId`, `productId`, `price`, `unitSize`, `createdAt`, `updatedAt`) VALUES
(14, 17, 45, 3232, 1, '2024-11-10 12:56:07', '2024-11-10 12:56:07'),
(15, 17, 46, 454, 2, '2024-11-10 12:58:07', '2024-11-10 12:58:07'),
(16, 17, 47, 475000, 1, '2024-11-10 17:19:18', '2024-11-10 17:19:18');

-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` int(11) NOT NULL,
  `sub_name` varchar(255) DEFAULT NULL,
  `categoryId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subcategories`
--

INSERT INTO `subcategories` (`id`, `sub_name`, `categoryId`, `createdAt`, `updatedAt`) VALUES
(3, 'Portal', 17, '2024-08-25 15:00:27', '2024-08-25 15:00:27');

-- --------------------------------------------------------

--
-- Table structure for table `subchildcategories`
--

CREATE TABLE `subchildcategories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `categoryId` int(11) NOT NULL,
  `subcategoryId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subchildcategories`
--

INSERT INTO `subchildcategories` (`id`, `name`, `categoryId`, `subcategoryId`, `createdAt`, `updatedAt`) VALUES
(3, 'ProtalChild', 17, 3, '2024-08-25 15:01:00', '2024-08-25 15:01:00');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `subscriptionType` varchar(255) NOT NULL,
  `subscriptionPlan` varchar(255) NOT NULL,
  `subscriptionPrice` decimal(10,2) NOT NULL,
  `customerId` int(11) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `subscriptionCount` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `subscriptionType`, `subscriptionPlan`, `subscriptionPrice`, `customerId`, `status`, `subscriptionCount`, `createdAt`, `updatedAt`) VALUES
(13, 'Plan1', 'PL1_002', 190.00, 17, '1', 5, '2024-09-27 19:24:41', '2024-10-22 14:00:02'),
(14, 'Plan2', 'PL1_001', 76.00, 17, '1', 4, '2024-09-27 19:38:19', '2024-10-22 14:05:56'),
(15, 'Plan3', 'PL1_003', 171.00, 17, '1', 9, '2024-09-27 19:40:37', '2024-09-27 19:40:37');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `verify` tinyint(1) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `vendorId` varchar(255) DEFAULT '',
  `storeId` varchar(255) DEFAULT '',
  `plan` varchar(255) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstName`, `lastName`, `address`, `email`, `phone`, `role`, `verify`, `password`, `createdAt`, `updatedAt`, `vendorId`, `storeId`, `plan`) VALUES
(19, 'N Delights', NULL, NULL, 'arulkumar8270@gmail.com', '8270564998', '2', 0, '$2a$10$95Jwjb70lzwy1iyIg0vriuTr4IkP.iFpKEa5geqFRv7qZoVaEkU5K', '2024-08-22 17:14:10', '2024-08-25 12:37:28', '27', '', ''),
(20, 'Nickname Infotech', NULL, NULL, 'nicknameinfotech2020@gmail.com', '8270564998', '2', 0, '$2a$10$nPl0aqDIVSm8KnJXoOSLJOD7p5UrZEbG4MkJxC.Vp.xEv5z8yEPM2', '2024-08-25 06:19:35', '2024-08-25 09:20:39', '28', '', ''),
(23, 'N Delights', NULL, NULL, 'ndelights@gmail.com', '1234567890', '3', 0, '$2a$10$GZRfQhKUj.206reJzCz/.eH8VAkfdlbdIbPGjdqPkCUdE8SWIGhYG', '2024-08-26 16:04:52', '2024-10-24 18:04:16', '', '17', '0'),
(24, 'Admin', NULL, NULL, 'admin@portal.com', '8270564998', '1', 0, '$2a$10$BWEIEQ7PUXNYcrrxGD6uxOzc9Nf/FFnWDJzc44cs54OvZ5t89aYEi', '2024-08-27 17:38:56', '2024-08-27 17:38:56', '', '', ''),
(25, 'samze', NULL, NULL, 'samze@gmail.com', '983423267', '3', 0, '$2a$10$X69rS1Or6RdKIhrnbucXXepY/dr5Keou4cFvBcAA.hEQjgeUcXjcS', '2024-09-03 18:23:10', '2024-09-17 17:42:40', '', '18', ''),
(26, 'xyz', NULL, NULL, 'zyx@portel.com', '1234567890', '3', 0, '$2a$10$oonHUM0j7zztlcni99OcZep8XLOc5qoldZvM5RuE/K8wzwaI.cn1C', '2024-09-19 16:16:44', '2024-09-19 16:21:11', '', '19', '');

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` int(11) NOT NULL,
  `storename` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `shopaddress` text DEFAULT NULL,
  `shopdesc` text DEFAULT NULL,
  `ownername` varchar(255) DEFAULT NULL,
  `owneraddress` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `areaId` int(11) NOT NULL,
  `accountNo` varchar(255) DEFAULT NULL,
  `accountHolderName` varchar(255) DEFAULT NULL,
  `bankName` varchar(255) DEFAULT NULL,
  `IFSC` varchar(255) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `adharCardNo` int(11) DEFAULT NULL,
  `panCardNo` varchar(255) DEFAULT NULL,
  `GSTNo` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `website` varchar(255) DEFAULT NULL,
  `location` varchar(300) DEFAULT NULL,
  `vendorImage` varchar(255) DEFAULT NULL,
  `openTime` varchar(255) DEFAULT NULL,
  `closeTime` varchar(255) DEFAULT NULL,
  `plan` varchar(255) DEFAULT NULL,
  `cashPayment` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `storename`, `status`, `shopaddress`, `shopdesc`, `ownername`, `owneraddress`, `email`, `password`, `phone`, `areaId`, `accountNo`, `accountHolderName`, `bankName`, `IFSC`, `branch`, `adharCardNo`, `panCardNo`, `GSTNo`, `createdAt`, `updatedAt`, `website`, `location`, `vendorImage`, `openTime`, `closeTime`, `plan`, `cashPayment`) VALUES
(27, 'N Delights', 1, 'Chennai', 'Sweets', 'Arul', 'Chennai', 'arulkumar8270@gmail.com', 'arulkumar8270@gmail.com', '8270564998', 3, 'undefined', 'undefined', 'undefined', 'undefined', 'undefined', 0, 'undefined', 'undefined', '2024-08-22 19:11:20', '2024-08-25 12:37:28', 'https://nicknameinfotech.com/', 'T Nager', 'uploads\\vendorImage_1724354219982.png', '9', '9', NULL, NULL),
(28, 'Nickname Infotech', 0, '22, Pallavan St, Ambal Nagar, Ekkatuthangal, Chennai, Tamil Nadu 600032', 'Nicknameinfotech is the best and most prestigious website design business in Chennai when it comes to handling all online services, from designing', 'Arulkumar', '22, Pallavan St, Ambal Nagar, Ekkatuthangal, Chennai, Tamil Nadu 600032', 'nicknameinfotech2020@gmail.com', 'nicknameinfotech2020@gmail.com', '8270564998', 3, '1234567890', 'Arul', 'HSFC', '123456789', 'Chennai', 123456789, '7654321', '123123', '2024-08-25 06:30:49', '2024-08-25 09:20:39', 'https://nicknameinfotech.com/', 'https://maps.app.goo.gl/tkCMDuRkztpnrzBY7', 'uploads\\vendorImage_1724567449160.png', '9', '9', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vendorstocks`
--

CREATE TABLE `vendorstocks` (
  `id` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `vendorId` int(11) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendorstocks`
--

INSERT INTO `vendorstocks` (`id`, `categoryId`, `vendorId`, `stock`, `createdAt`, `updatedAt`) VALUES
(15, 17, 28, 342, '2024-08-25 09:50:17', '2024-08-25 09:50:17'),
(17, 17, 27, 900, '2024-08-25 12:46:42', '2024-08-25 12:46:42');

-- --------------------------------------------------------

--
-- Table structure for table `vendor_areas`
--

CREATE TABLE `vendor_areas` (
  `id` int(11) NOT NULL,
  `vendorId` int(11) NOT NULL,
  `areaId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendor_areas`
--

INSERT INTO `vendor_areas` (`id`, `vendorId`, `areaId`, `createdAt`, `updatedAt`) VALUES
(22, 27, 3, '2024-08-22 19:11:20', '2024-08-22 19:11:20'),
(23, 28, 3, '2024-08-25 06:30:49', '2024-08-25 06:30:49');

-- --------------------------------------------------------

--
-- Table structure for table `vendor_products`
--

CREATE TABLE `vendor_products` (
  `id` int(11) NOT NULL,
  `supplierId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `price` int(11) DEFAULT NULL,
  `unitSize` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendor_products`
--

INSERT INTO `vendor_products` (`id`, `supplierId`, `productId`, `price`, `unitSize`, `createdAt`, `updatedAt`) VALUES
(4, 28, 52, 3000, 1, '2024-08-25 09:31:24', '2024-08-25 09:31:24'),
(5, 27, 53, 280, 1, '2024-08-25 12:39:13', '2024-08-25 12:39:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orderId` (`orderId`),
  ADD KEY `custId` (`custId`);

--
-- Indexes for table `ads`
--
ALTER TABLE `ads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `locationId` (`locationId`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orderId` (`orderId`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `custId` (`custId`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `custId` (`custId`);

--
-- Indexes for table `productfeedbacks`
--
ALTER TABLE `productfeedbacks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_customerId` (`customerId`),
  ADD KEY `fk_productId` (`productId`),
  ADD KEY `fk_vendorId` (`vendorId`),
  ADD KEY `fk_storeId` (`storeId`);

--
-- Indexes for table `productoffers`
--
ALTER TABLE `productoffers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `productphotos`
--
ALTER TABLE `productphotos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `fk_subcategoryId` (`subCategoryId`),
  ADD KEY `fk_childCategoryId` (`childCategoryId`),
  ADD KEY `fk_createdId` (`createdId`),
  ADD KEY `fk_categoryId` (`categoryId`);

--
-- Indexes for table `requeststores`
--
ALTER TABLE `requeststores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendorName` (`vendorName`);

--
-- Indexes for table `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `areaId` (`areaId`);

--
-- Indexes for table `store_areas`
--
ALTER TABLE `store_areas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `storeId` (`storeId`),
  ADD KEY `areaId` (`areaId`);

--
-- Indexes for table `store_products`
--
ALTER TABLE `store_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplierId` (`supplierId`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoryId` (`categoryId`);

--
-- Indexes for table `subchildcategories`
--
ALTER TABLE `subchildcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoryId` (`categoryId`),
  ADD KEY `subcategoryId` (`subcategoryId`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `areaId` (`areaId`);

--
-- Indexes for table `vendorstocks`
--
ALTER TABLE `vendorstocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoryId` (`categoryId`),
  ADD KEY `vendorId` (`vendorId`);

--
-- Indexes for table `vendor_areas`
--
ALTER TABLE `vendor_areas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendorId` (`vendorId`),
  ADD KEY `areaId` (`areaId`);

--
-- Indexes for table `vendor_products`
--
ALTER TABLE `vendor_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplierId` (`supplierId`),
  ADD KEY `productId` (`productId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ads`
--
ALTER TABLE `ads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `areas`
--
ALTER TABLE `areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `productfeedbacks`
--
ALTER TABLE `productfeedbacks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `productoffers`
--
ALTER TABLE `productoffers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `productphotos`
--
ALTER TABLE `productphotos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `requeststores`
--
ALTER TABLE `requeststores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `store_areas`
--
ALTER TABLE `store_areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `store_products`
--
ALTER TABLE `store_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `subcategories`
--
ALTER TABLE `subcategories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subchildcategories`
--
ALTER TABLE `subchildcategories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `vendorstocks`
--
ALTER TABLE `vendorstocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `vendor_areas`
--
ALTER TABLE `vendor_areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `vendor_products`
--
ALTER TABLE `vendor_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `addresses_ibfk_2` FOREIGN KEY (`custId`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `areas`
--
ALTER TABLE `areas`
  ADD CONSTRAINT `areas_ibfk_1` FOREIGN KEY (`locationId`) REFERENCES `locations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`custId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`custId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `productfeedbacks`
--
ALTER TABLE `productfeedbacks`
  ADD CONSTRAINT `fk_customerId` FOREIGN KEY (`customerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_productId` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_storeId` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_vendorId` FOREIGN KEY (`vendorId`) REFERENCES `vendors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `productoffers`
--
ALTER TABLE `productoffers`
  ADD CONSTRAINT `productoffers_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `productphotos`
--
ALTER TABLE `productphotos`
  ADD CONSTRAINT `productphotos_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_categoryId` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_childCategoryId` FOREIGN KEY (`childCategoryId`) REFERENCES `subchildcategories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_createdId` FOREIGN KEY (`createdId`) REFERENCES `stores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_subcategoryId` FOREIGN KEY (`subCategoryId`) REFERENCES `subcategories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `requeststores`
--
ALTER TABLE `requeststores`
  ADD CONSTRAINT `requeststores_ibfk_1` FOREIGN KEY (`vendorName`) REFERENCES `vendors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`areaId`) REFERENCES `areas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `store_areas`
--
ALTER TABLE `store_areas`
  ADD CONSTRAINT `store_areas_ibfk_1` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `store_areas_ibfk_2` FOREIGN KEY (`areaId`) REFERENCES `areas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `store_products`
--
ALTER TABLE `store_products`
  ADD CONSTRAINT `store_products_ibfk_1` FOREIGN KEY (`supplierId`) REFERENCES `stores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `store_products_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD CONSTRAINT `subcategories_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subchildcategories`
--
ALTER TABLE `subchildcategories`
  ADD CONSTRAINT `subchildcategories_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `subchildcategories_ibfk_2` FOREIGN KEY (`subcategoryId`) REFERENCES `subcategories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vendors`
--
ALTER TABLE `vendors`
  ADD CONSTRAINT `vendors_ibfk_1` FOREIGN KEY (`areaId`) REFERENCES `areas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vendorstocks`
--
ALTER TABLE `vendorstocks`
  ADD CONSTRAINT `vendorstocks_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `vendorstocks_ibfk_2` FOREIGN KEY (`vendorId`) REFERENCES `vendors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vendor_areas`
--
ALTER TABLE `vendor_areas`
  ADD CONSTRAINT `vendor_areas_ibfk_1` FOREIGN KEY (`vendorId`) REFERENCES `vendors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `vendor_areas_ibfk_2` FOREIGN KEY (`areaId`) REFERENCES `areas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vendor_products`
--
ALTER TABLE `vendor_products`
  ADD CONSTRAINT `vendor_products_ibfk_1` FOREIGN KEY (`supplierId`) REFERENCES `vendors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `vendor_products_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
