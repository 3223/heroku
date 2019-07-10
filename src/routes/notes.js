const express = require('express');
const router = express.Router();

// Models
const Note = require('../models/Note');

// Helpers
const { isAuthenticated } = require('../helpers/auth');

// New Note
router.get('/notes/add', isAuthenticated, (req, res) => {
  res.render('notes/new-note');
});

router.post('/notes/new-note', isAuthenticated, async (req, res) => {
  const { nombre, tel, email, sintomas } = req.body;
  const errors = [];
  if (!nombre) {
    errors.push({text: 'Escribe tu nombre.'});
  }
  if (!tel) {
    errors.push({text: 'Escribe tu numero d telefono'});
  }
  if (!email) {
    errors.push({text: 'Escribe tu E-mail'});
  }
  if (!sintomas) {
    errors.push({text: 'Escribe tus sintomas'});
  }
  if (errors.length > 0) {
    res.render('notes/new-note', {
      errors,
      nombre,
      tel,
      email,
      sintomas

    });
  } else {
    const newNote = new Note({nombre, tel, email, sintomas});
    newNote.user = req.user.id;
    await newNote.save();
    req.flash('success_msg', 'Cita Added Successfully');
    res.redirect('/notes');
  }
});

// Get All Notes
router.get('/notes', isAuthenticated, async (req, res) => {
  const notes = await Note.find({user: req.user.id}).sort({date: 'desc'});
  res.render('notes/all-notes', { notes });
});

// Edit Notes
router.get('/notes/edit/:id', isAuthenticated, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if(note.user != req.user.id) {
    req.flash('error_msg', 'Not Authorized');
    return res.redirect('/notes');
  } 
  res.render('notes/edit-note', { note });
});

router.put('/notes/edit-note/:id', isAuthenticated, async (req, res) => {
  const { nombre, tel, email, sintomas } = req.body;
  await Note.findByIdAndUpdate(req.params.id, {nombre, tel, email, sintomas});
  req.flash('success_msg', 'Note Updated Successfully');
  res.redirect('/notes');
});

// Delete Notes
router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  req.flash('success_msg', 'Note Deleted Successfully');
  res.redirect('/notes');
});

module.exports = router;
