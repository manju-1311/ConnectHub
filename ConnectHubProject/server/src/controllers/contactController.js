import Contact from '../models/Contact.js';

// @desc    Get all contacts for logged-in user
// @route   GET /api/contacts
// @access  Private
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ success: true, count: contacts.length, contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Check if contact belongs to user
    if (contact.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this contact' });
    }

    res.json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
const createContact = async (req, res) => {
  try {
    const { name, email, phone, notes, tags } = req.body;

    const contact = await Contact.create({
      userId: req.user._id,
      name,
      email,
      phone,
      notes,
      tags: tags || [],
    });

    res.status(201).json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Check if contact belongs to user
    if (contact.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this contact' });
    }

    const { name, email, phone, notes, tags } = req.body;

    contact.name = name || contact.name;
    contact.email = email || contact.email;
    contact.phone = phone || contact.phone;
    contact.notes = notes || contact.notes;
    contact.tags = tags !== undefined ? tags : contact.tags;

    const updatedContact = await contact.save();

    res.json({ success: true, contact: updatedContact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Check if contact belongs to user
    if (contact.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this contact' });
    }

    await contact.deleteOne();

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search contacts
// @route   GET /api/contacts/search?q=searchTerm
// @access  Private
import mongoose from 'mongoose';

const searchContacts = async (req, res) => {
  try {
    const searchTerm = req.query.q;

    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    // build an $or array dynamically so we can include an _id lookup when
    // the term is a valid ObjectId string
    const orClauses = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } },
    ];

    if (mongoose.Types.ObjectId.isValid(searchTerm)) {
      orClauses.unshift({ _id: searchTerm });
    }

    const contacts = await Contact.find({
      userId: req.user._id,
      $or: orClauses,
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: contacts.length, contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update tags on multiple contacts
// @route   POST /api/contacts/bulk-tags
// @access  Private
const bulkTags = async (req, res) => {
  const { ids, tags, action } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid IDs' });
  }
  try {
    if (action === 'add') {
      await Contact.updateMany(
        { _id: { $in: ids }, userId: req.user.id },
        { $addToSet: { tags: { $each: tags } } }
      );
    } else if (action === 'remove') {
      await Contact.updateMany(
        { _id: { $in: ids }, userId: req.user.id },
        { $pull: { tags: { $in: tags } } }
      );
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Toggle favorite status on a contact
// @route   POST /api/contacts/:id/toggle-favorite
// @access  Private
const toggleFavorite = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.user.id });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    contact.is_favorite = !contact.is_favorite;
    await contact.save();
    res.json({ is_favorite: contact.is_favorite });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Bulk delete contacts
// @route   POST /api/contacts/bulk-delete
// @access  Private
const bulkDelete = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid IDs' });
  }
  try {
    const result = await Contact.deleteMany({ _id: { $in: ids }, userId: req.user.id });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  searchContacts,
  bulkTags,
  toggleFavorite,
  bulkDelete,
};