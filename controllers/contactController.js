import prisma from '../config/prisma.js';
import csv from 'csv-parser';
import fs from 'fs';

export const getContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' }
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createContact = async (req, res) => {
  try {
    const { name, phone, group_name } = req.body;
    const contact = await prisma.contact.create({
      data: {
        name,
        phone,
        group_name,
        user_id: req.user.id
      }
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadContactsCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const contacts = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        if (data.phone) {
          contacts.push({
            name: data.name || 'Unknown',
            phone: data.phone,
            group_name: data.group_name || req.body.group_name || 'General',
            user_id: req.user.id
          });
        }
      })
      .on('end', async () => {
        try {
          await prisma.contact.createMany({
            data: contacts,
            skipDuplicates: true
          });
          fs.unlinkSync(req.file.path);
          res.json({ message: `${contacts.length} contacts imported successfully` });
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contact.delete({
      where: { id: parseInt(id), user_id: req.user.id }
    });
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
