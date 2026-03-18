import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import fs from 'fs';
import path from 'path';

export const register = async (req, res) => {
  // ... existing register code ...
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  // ... existing login code ...
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_photo: user.profile_photo,
        company_name: user.company_name,
        bio: user.bio
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const { username, company_name, bio, remove_photo } = req.body;
    let profile_photo = undefined;

    if (remove_photo) {
      profile_photo = null;
      if (req.user.profile_photo) {
        const oldPath = path.join(process.cwd(), req.user.profile_photo);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    } else if (req.file) {
      // Normalize path for web and store relative to root
      profile_photo = req.file.path.replace(/\\/g, '/');

      // Delete old photo
      if (req.user.profile_photo) {
        const oldPath = path.join(process.cwd(), req.user.profile_photo);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(username && { username }),
        ...(company_name !== undefined && { company_name }),
        ...(bio !== undefined && { bio }),
        ...(profile_photo !== undefined && { profile_photo })
      }
    });

    res.json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        profile_photo: updatedUser.profile_photo,
        company_name: updatedUser.company_name,
        bio: updatedUser.bio
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
