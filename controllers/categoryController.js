const Category = require('../models/Category');

exports.listCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.render('categorieslist', {
            categories,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('❌ Error fetching categories:', error);
        res.redirect('/categorieslist?error=Failed to load categories.');
    }
};

exports.addCategoryForm = (req, res) => {
    res.render('categoriesadd', { error: req.query.error || null });
};

exports.createCategory = async (req, res) => {
    console.log('Received form data:', req.body);

    const { name, description } = req.body;

    if (!name) {
        return res.redirect('/categorieslist?error=Category name is required.');
    }

    try {
        await Category.create({ name, description });
        res.redirect('/categorieslist?success=Category added successfully.');
    } catch (error) {
        console.error('❌ Error adding category:', error);
        res.redirect('/categorieslist?error=Error adding category.');
    }
};

exports.editCategoryForm = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.redirect('/categorieslist?error=Category not found.');
        }
        res.render('categoriesedit', { category, success: req.query.success || null, error: req.query.error || null });
    } catch (error) {
        console.error('❌ Error fetching category:', error);
        res.redirect('/categorieslist?error=Failed to fetch category.');
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.redirect('/categorieslist?error=Category not found.');
        }

        await category.update({ name, description });

        res.redirect('/categorieslist?success=Category updated successfully.');
    } catch (error) {
        console.error('❌ Error updating category:', error);
        res.redirect('/categorieslist?error=Failed to update category.');
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) {
            return res.redirect('/categorieslist?error=Category not found.');
        }

        await category.destroy();
        res.redirect('/categorieslist?success=Category deleted successfully.');
    } catch (error) {
        console.error('❌ Error deleting category:', error);
        res.redirect('/categorieslist?error=Error deleting category.');
    }
};
