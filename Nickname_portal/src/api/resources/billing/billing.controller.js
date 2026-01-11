const db = require("../../../models");

module.exports = {
  async addBill(req, res, next) {
    try {
      const {
        storeId,
        currentVendorUserId,
        customerName,
        customerEmail,
        customerPhone,
        products,
        subtotal,
        discount,
        discountPercent,
        tax,
        taxPercent,
        total,
        notes,
        invoiceFormatId,
        invoiceType,
      } = req.body;

      // Determine storeId from currentStoreUserId or currentVendorUserId

      if (!storeId) {
        return res.status(400).json({ 
          success: false, 
          errors: ["storeId is required (either currentStoreUserId or currentVendorUserId)"] 
        });
      }

      // Determine invoice format ID
      let finalInvoiceFormatId = invoiceFormatId;

      // If no format specified, try to get from store/vendor assignment
      if (!finalInvoiceFormatId) {
        const store = await db.store.findByPk(storeId);
        if (store) {
          const storeFormat = await db.storeInvoiceFormat.findOne({
            where: { storeId },
          });
          if (storeFormat) {
            finalInvoiceFormatId = storeFormat.formatId;
          }
        }

        // If still no format, try vendor
        if (!finalInvoiceFormatId && currentVendorUserId) {
          const vendorFormat = await db.vendorInvoiceFormat.findOne({
            where: { vendorId: String(currentVendorUserId) },
          });
          if (vendorFormat) {
            finalInvoiceFormatId = vendorFormat.formatId;
          }
        }

        // If still no format, use default
        if (!finalInvoiceFormatId) {
          const defaultFormat = await db.invoiceFormat.findOne({
            where: { isDefault: true },
          });
          if (defaultFormat) {
            finalInvoiceFormatId = defaultFormat.id;
          }
        }
      }

      // Validate invoiceType
      const validInvoiceTypes = ['DC', 'Invoice', 'Quotation'];
      const finalInvoiceType = invoiceType && validInvoiceTypes.includes(invoiceType) 
        ? invoiceType 
        : 'Invoice'; // Default to 'Invoice' if not provided or invalid

      // Create the bill
      const bill = await db.bill.create({
        storeId: storeId || currentVendorUserId,
        customerName: customerName || "",
        customerEmail: customerEmail || "",
        customerPhone: customerPhone || "",
        products: products,
        subtotal: subtotal || 0,
        discount: discount || 0,
        discountPercent: discountPercent || 0,
        tax: tax || 0,
        taxPercent: taxPercent || 0,
        total: total || 0,
        notes: notes || "",
        invoiceFormatId: finalInvoiceFormatId || null,
        invoiceType: finalInvoiceType,
      });

      res.status(201).json({ 
        success: true, 
        message: "Bill created successfully",
        data: bill 
      });
    } catch (err) {
      console.error(err, "Error creating bill");
      res.status(500).json({ 
        success: false, 
        errors: ["Error creating bill", err.message] 
      });
    }
  },

  async updateBill(req, res, next) {
    try {
      const {
        id,
        currentStoreUserId,
        currentVendorUserId,
        customerName,
        customerEmail,
        customerPhone,
        selectedProducts,
        subtotal,
        discount,
        tax,
        total,
        notes,
        invoiceType,
      } = req.body;

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          errors: ["Bill ID is required"] 
        });
      }

      // Check if bill exists
      const existingBill = await db.bill.findOne({ where: { id: id } });
      if (!existingBill) {
        return res.status(404).json({ 
          success: false, 
          errors: ["Bill not found"] 
        });
      }

      // Prepare update data
      const updateData = {};
      
      if (currentStoreUserId || currentVendorUserId) {
        updateData.storeId = currentStoreUserId || currentVendorUserId;
      }
      if (customerName !== undefined) updateData.customerName = customerName;
      if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
      if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
      if (selectedProducts !== undefined) {
        updateData.products = selectedProducts.map((p) => ({
          productId: p.id,
          quantity: p.quantity,
          price: p.price,
          total: p.total,
        }));
      }
      if (subtotal !== undefined) updateData.subtotal = subtotal;
      if (discount !== undefined) updateData.discount = discount;
      if (tax !== undefined) updateData.tax = tax;
      if (total !== undefined) updateData.total = total;
      if (notes !== undefined) updateData.notes = notes;
      
      // Validate and update invoiceType if provided
      if (invoiceType !== undefined) {
        const validInvoiceTypes = ['DC', 'Invoice', 'Quotation'];
        if (validInvoiceTypes.includes(invoiceType)) {
          updateData.invoiceType = invoiceType;
        } else {
          return res.status(400).json({
            success: false,
            errors: [`Invalid invoiceType. Must be one of: ${validInvoiceTypes.join(', ')}`]
          });
        }
      }

      // Update the bill
      await db.bill.update(updateData, {
        where: { id: id }
      });

      // Fetch updated bill
      const updatedBill = await db.bill.findOne({ where: { id: id } });

      res.status(200).json({ 
        success: true, 
        message: "Bill updated successfully",
        data: updatedBill 
      });
    } catch (err) {
      console.error(err, "Error updating bill");
      res.status(500).json({ 
        success: false, 
        errors: ["Error updating bill", err.message] 
      });
    }
  },

  async getBills(req, res, next) {
    try {
      const bills = await db.bill.findAll({
        order: [["createdAt", "DESC"]],
        include: [
          { model: db.store, required: false },
          { model: db.vendor, as: 'vendor', required: false }
        ]
      });

      res.status(200).json({ 
        success: true, 
        data: bills,
        count: bills.length 
      });
    } catch (err) {
      console.error(err, "Error fetching bills");
      res.status(500).json({ 
        success: false, 
        errors: ["Error fetching bills", err.message] 
      });
    }
  },

  async getBillById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          errors: ["Bill ID is required"] 
        });
      }

      const bill = await db.bill.findOne({
        where: { id: id },
        include: [
          { model: db.store, required: false },
          { model: db.vendor, as: 'vendor', required: false },
          { model: db.invoiceFormat, as: 'invoiceFormat', required: false }
        ]
      });

      if (!bill) {
        return res.status(404).json({ 
          success: false, 
          errors: ["Bill not found"] 
        });
      }

      res.status(200).json({ 
        success: true, 
        data: bill 
      });
    } catch (err) {
      console.error(err, "Error fetching bill");
      res.status(500).json({ 
        success: false, 
        errors: ["Error fetching bill", err.message] 
      });
    }
  },
  async getBillByStoreId(req, res, next) {
    try {
      const { storeId } = req.params;

      if (!storeId) {
        return res.status(400).json({ 
          success: false, 
          errors: ["Store ID is required"] 
        });
      }

        const bills = await db.bill.findAll({
        where: { storeId: storeId },
        include: [
          { model: db.store, required: false },
          { model: db.vendor, as: 'vendor', required: false }
        ]
      });

      if (!bills) {
        return res.status(404).json({ 
          success: false, 
          errors: ["Bills not found"] 
        });
      }

      res.status(200).json({ 
        success: true, 
        data: bills 
      });
    } catch (err) {
      console.error(err, "Error fetching bills");
      res.status(500).json({ 
        success: false, 
        errors: ["Error fetching bills", err.message] 
      });
    }
  },
};

