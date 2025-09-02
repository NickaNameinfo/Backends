const router = require('express').Router();

const { adminRegister, adminLogIn, getAdminDetail, updateAdmin, getAdminDetails } = require('../controllers/admin-controller.js');

// const { adminRegister, adminLogIn, getAdminDetail, deleteAdmin} = require('../controllers/admin-controller.js');

const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents } = require('../controllers/class-controller.js');
const { complainCreate, complainList } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice-controller.js');
const {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance } = require('../controllers/student_controller.js');
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require('../controllers/subject-controller.js');
const { teacherRegister, teacherLogIn, getTeachers, getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacherSubject, teacherAttendance } = require('../controllers/teacher-controller.js');
const {
    addGallery,
    getGalleryBySchool,
    getGalleryDetail,
    updateGallery,
    deleteGallery
} = require("../controllers/gallery-controller.js");

const {
    collectFees,
    getFeesBySchool,
    getFeesDetail,
    updateFees,
    deleteFees,
    deleteFeesBySchool,
    deleteFeesByClass
} = require("../controllers/fees-controller.js");

const {
    createExam,
    getExamsBySchool,
    getExamsByClass,
    getExamDetail,
    updateExam,
    deleteExam,
    deleteExamsBySchool,
    deleteExamsByClass
} = require("../controllers/exam-controller.js");

// Admin
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);
router.get("/AdminList", getAdminDetails)
router.get("/Admin/:id", getAdminDetail)
// router.delete("/Admin/:id", deleteAdmin)

router.put("/Admin/:id", updateAdmin)

// Student
router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn)

router.get("/Students/:id", getStudents)
router.get("/Student/:id", getStudentDetail)

router.delete("/Students/:id", deleteStudents)
router.delete("/StudentsClass/:id", deleteStudentsByClass)
router.delete("/Student/:id", deleteStudent)

router.put("/Student/:id", updateStudent)

router.put('/UpdateExamResult/:id', updateExamResult)

router.put('/StudentAttendance/:id', studentAttendance)

router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);

router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance)

// Teacher

router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn)
router.get("/Teachers/:id", getTeachers)
router.get("/Teacher/:id", getTeacherDetail)

router.delete("/Teachers/:id", deleteTeachers)
router.delete("/TeachersClass/:id", deleteTeachersByClass)
router.delete("/Teacher/:id", deleteTeacher)

router.put("/TeacherSubject", updateTeacherSubject)

router.post('/TeacherAttendance/:id', teacherAttendance)

// Notice

router.post('/NoticeCreate', noticeCreate);

router.get('/NoticeList/:id', noticeList);

router.delete("/Notices/:id", deleteNotices)
router.delete("/Notice/:id", deleteNotice)

router.put("/Notice/:id", updateNotice)

// Complain

router.post('/ComplainCreate', complainCreate);

router.get('/ComplainList/:id', complainList);

// Sclass
router.post('/SclassCreate', sclassCreate);
router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail)
router.get("/Sclass/Students/:id", getSclassStudents)
router.delete("/Sclasses/:id", deleteSclasses)
router.delete("/Sclass/:id", deleteSclass)

// Subject
router.post('/SubjectCreate', subjectCreate);
router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail)

router.delete("/Subject/:id", deleteSubject)
router.delete("/Subjects/:id", deleteSubjects)
router.delete("/SubjectsClass/:id", deleteSubjectsByClass)

// Gallery

router.post("/galleryCreate", addGallery);
router.get("/galleryList/:id", getGalleryDetail);
router.get("/galleries/:id", getGalleryBySchool);
router.put("/gallery/:id", updateGallery);
router.delete("/gallery/:id", deleteGallery);

//Fees

router.post("/feesCreate", collectFees);
router.get("/feesList/:id", getFeesDetail);
router.get("/fees/:id", getFeesBySchool);
router.put("/fees/:id", updateFees);
router.delete("/fees/:id", deleteFees);
router.delete("/feesBySchool/:id", deleteFeesBySchool);
router.delete("/feesByClass/:id", deleteFeesByClass);

// Exams // New section for Exam routes
router.post("/ExamCreate", createExam);
router.get("/ExamsBySchool/:id", getExamsBySchool);
router.get("/ExamsByClass/:id", getExamsByClass);
router.get("/Exam/:id", getExamDetail);
router.put("/Exam/:id", updateExam);
router.delete("/Exam/:id", deleteExam);
router.delete("/ExamsBySchool/:id", deleteExamsBySchool);
router.delete("/ExamsByClass/:id", deleteExamsByClass);

module.exports = router;