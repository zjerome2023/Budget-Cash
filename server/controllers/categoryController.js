import Category from '../models/Category.js';

export async function listCategories(req, res) {
  try {
    const categories = await Category.find({ userId: req.user._id }).sort({
      name: 1,
    });
    res.json({ categories });
  } catch (error) {
    console.error('List categories error:', error);
    res.status(500).json({ message: 'Failed to list categories' });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, color } = req.body;
    const category = await Category.create({
      userId: req.user._id,
      name,
      color,
    });
    res.status(201).json({ category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
}

export async function updateCategory(req, res) {
  try {
    const { name, color } = req.body;
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, color },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
}

export async function deleteCategory(req, res) {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
}
