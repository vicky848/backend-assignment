import db from '../../db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import csvParser from 'csv-parser';
import Joi from 'joi';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

const upload = multer({ dest: 'uploads/' });

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  handler: (req, res) => res.status(429).json({ message: 'Too many login attempts. Please try again later.' })
});

// Validation Schemas
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().optional(),
  timezone: Joi.string().optional(),
});

// Main handler
const handler = async (req, res) => {
  const { method } = req;

  switch (method) {
    case 'POST':
      if (req.url === '/register') {
        const { error } = userSchema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const { email, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, 8);

        db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, hashedPassword], function (err) {
          if (err) return res.status(400).json({ error: err.message });
          const token = jwt.sign({ id: this.lastID, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
          res.status(201).json({ token });
        });

      } else if (req.url === '/login') {
        await new Promise((resolve, reject) => loginLimiter(req, res, (err) => (err ? reject(err) : resolve())));

        const { error } = userSchema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const { email, password } = req.body;

        db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
          if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }
          const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
          res.status(200).json({ token });
        });

      } else if (req.url === '/upload') {
        upload.single('file')(req, res, async (err) => {
          if (err) return res.status(400).json({ error: err.message });
          const results = [];

          fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
              await unlinkAsync(req.file.path);  // Remove file after processing
              res.status(200).json({ message: 'File processed successfully', results });
            });
        });
      }
      break;

    case 'GET':
      if (req.url === '/contacts') {
        const { name, email, timezone } = req.query;

        const filterConditions = [];
        const filterValues = [];

        if (name) {
          filterConditions.push('name LIKE ?');
          filterValues.push(`%${name}%`);
        }
        if (email) {
          filterConditions.push('email = ?');
          filterValues.push(email);
        }
        if (timezone) {
          filterConditions.push('timezone = ?');
          filterValues.push(timezone);
        }

        const sql = `SELECT * FROM contacts${filterConditions.length ? ' WHERE ' + filterConditions.join(' AND ') : ''}`;
        db.all(sql, filterValues, (err, contacts) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(200).json(contacts);
        });
      }
      break;

    case 'PUT':
      if (req.url.startsWith('/contacts/')) {
        const contactId = req.url.split('/')[2];
        const { error } = contactSchema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const { name, email, phone, address, timezone } = req.body;
        db.run(
          `UPDATE contacts SET name = ?, email = ?, phone = ?, address = ?, timezone = ? WHERE id = ?`,
          [name, email, phone, address, timezone, contactId],
          function (err) {
            if (err) return res.status(400).json({ error: err.message });
            res.status(200).json({ message: 'Contact updated successfully' });
          }
        );
      }
      break;

    case 'DELETE':
      if (req.url.startsWith('/contacts/')) {
        const contactId = req.url.split('/')[2];
        db.run(`UPDATE contacts SET deleted_at = ? WHERE id = ?`, [new Date(), contactId], function (err) {
          if (err) return res.status(400).json({ error: err.message });
          res.status(200).json({ message: 'Contact soft deleted successfully' });
        });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
