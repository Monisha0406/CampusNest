const express = require('express');
const router = express.Router();
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/', getStudents);
router.post('/', createStudent);
router.get('/:id', getStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
