const Fees = require('../models/feesSchema.js');
const Student = require('../models/studentSchema.js');

const collectFees = async (req, res) => {
    const { student, school, class: classId, amount, paymentMethod, date, remarks } = req.body;

    try {
        const fees = new Fees({ student, school, class: classId, amount, paymentMethod, date, remarks });
        let result = await fees.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getFeesBySchool = async (req, res) => {
    try {
        let feesRecords = await Fees.find({ school: req.params.id })
            .populate("student", "name rollNo")
            .populate("class", "sclassName")
            .populate("school", "schoolName");

        if (feesRecords.length > 0) {
            res.send(feesRecords);
        } else {
            res.send({ message: "No fees records found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getFeesDetail = async (req, res) => {
    try {
        let feesRecord = await Fees.find({student:req.params.id})
            .populate("student", "name rollNo")
            .populate("class", "sclassName")
            .populate("school", "schoolName");

        if (feesRecord) {
            res.send(feesRecord);
        } else {
            res.send({ message: "No fees record found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateFees = async (req, res) => {
    const { feesId, amount, paymentMethod, date, remarks } = req.body;
    
    try {
        const updatedFees = await Fees.findByIdAndUpdate(
            feesId,
            { amount, paymentMethod, date, remarks },
            { new: true }
        );
        res.send(updatedFees);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteFees = async (req, res) => {
    try {
        const deletedFees = await Fees.findByIdAndDelete(req.params.id);
        res.send(deletedFees);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteFeesBySchool = async (req, res) => {
    try {
        const deletionResult = await Fees.deleteMany({ school: req.params.id });

        if (deletionResult.deletedCount === 0) {
            res.send({ message: "No fees records found to delete" });
            return;
        }

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteFeesByClass = async (req, res) => {
    try {
        const deletionResult = await Fees.deleteMany({ class: req.params.id });

        if (deletionResult.deletedCount === 0) {
            res.send({ message: "No fees records found to delete" });
            return;
        }

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    collectFees,
    getFeesBySchool,
    getFeesDetail,
    updateFees,
    deleteFees,
    deleteFeesBySchool,
    deleteFeesByClass
};
