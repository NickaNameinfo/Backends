const Exam = require('../models/examSchema.js');

const createExam = async (req, res) => {
    try {
        const { examName, date, sclassName, subject, school } = req.body;

        const exam = new Exam({
            examName,
            date,
            sclassName,
            subject,
            school
        });

        const result = await exam.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getExamsBySchool = async (req, res) => {
    try {
        let exams = await Exam.find({ school: req.params.id })
            .populate("sclassName", "sclassName")
            .populate("subject", "subName");
        if (exams.length > 0) {
            res.send(exams);
        } else {
            res.send({ message: "No exams found for this school" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getExamsByClass = async (req, res) => {
    try {
        let exams = await Exam.find({ sclassName: req.params.id })
            .populate("subject", "subName");
        if (exams.length > 0) {
            res.send(exams);
        } else {
            res.send({ message: "No exams found for this class" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getExamDetail = async (req, res) => {
    try {
        let exam = await Exam.findById(req.params.id)
            .populate("sclassName", "sclassName")
            .populate("subject", "subName")
            .populate("school", "schoolName");
        if (exam) {
            res.send(exam);
        } else {
            res.send({ message: "Exam not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateExam = async (req, res) => {
    try {
        const result = await Exam.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true });
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteExam = async (req, res) => {
    try {
        const result = await Exam.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteExamsBySchool = async (req, res) => {
    try {
        const result = await Exam.deleteMany({ school: req.params.id });
        if (result.deletedCount === 0) {
            res.send({ message: "No exams found to delete for this school" });
        } else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteExamsByClass = async (req, res) => {
    try {
        const result = await Exam.deleteMany({ sclassName: req.params.id });
        if (result.deletedCount === 0) {
            res.send({ message: "No exams found to delete for this class" });
        } else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    createExam,
    getExamsBySchool,
    getExamsByClass,
    getExamDetail,
    updateExam,
    deleteExam,
    deleteExamsBySchool,
    deleteExamsByClass
};