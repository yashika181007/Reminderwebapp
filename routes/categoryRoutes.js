const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/categoriesadd', categoryController.addCategoryForm);
router.post('/categoriesadd', categoryController.createCategory);
router.get('/categorieslist', categoryController.listCategories);
router.get('/categoriesedit/:id', categoryController.editCategoryForm);
router.post('/categoriesedit/:id', categoryController.updateCategory);
router.post('/categoriesdelete/:id', categoryController.deleteCategory);
module.exports = router;
