const express = require('express');
const router = express.Router();
const FormSubmission = require('../models/FormSubmission');
const { sendFormThankYouEmail, sendEmail } = require('../services/emailService');
const authMiddleware = require('../middleware/authMiddleware');

// Submit contact/quote form
router.post('/submit', async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
      firstName,
      lastName,
      mobile,
      city,
      service,
      formType = 'other'
    } = req.body;

    // Validation - at least name and email are required
    if (!name && !firstName) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Determine the name to use
    const submissionName = name || `${firstName} ${lastName}`.trim();

    // Create form submission
    const formSubmission = new FormSubmission({
      name: submissionName,
      email: email.toLowerCase(),
      subject,
      message,
      firstName,
      lastName,
      mobile,
      city,
      service,
      formType
    });

    await formSubmission.save();

    // Send thank you email to user
    try {
      await sendFormThankYouEmail(submissionName, email);
    } catch (emailError) {
      console.error('Error sending thank you email:', emailError);
      // Don't fail the submission if email fails
    }

    // Optionally send notification email to admin
    if (process.env.ADMIN_EMAIL) {
      try {
        const adminSubject = `New ${formType} Form Submission`;
        const adminMessage = `
          <h2>New Form Submission</h2>
          <p><strong>Name:</strong> ${submissionName}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
          ${mobile ? `<p><strong>Mobile:</strong> ${mobile}</p>` : ''}
          ${city ? `<p><strong>City:</strong> ${city}</p>` : ''}
          ${service ? `<p><strong>Service:</strong> ${service}</p>` : ''}
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          <p><strong>Form Type:</strong> ${formType}</p>
          <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
        `;
        
        await sendEmail(process.env.ADMIN_EMAIL, adminSubject, adminMessage);
      } catch (adminEmailError) {
        console.error('Error sending admin notification email:', adminEmailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully. Thank you email sent!',
      submissionId: formSubmission._id
    });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while submitting the form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all form submissions (optional - for admin use)
router.get('/submissions', authMiddleware, async (req, res) => {
  try {
    const submissions = await FormSubmission.find()
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching submissions'
    });
  }
});

// Get single form submission
router.get('/submissions/:id', authMiddleware, async (req, res) => {
    try {
        const submission = await FormSubmission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }
        res.json(submission);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Submission not found' });
        }
        res.status(500).send('Server Error');
    }
});

// Update form submission
router.put('/submissions/:id', authMiddleware, async (req, res) => {
    try {
        const submission = await FormSubmission.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }

        res.json(submission);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete form submission
router.delete('/submissions/:id', authMiddleware, async (req, res) => {
    try {
        const submission = await FormSubmission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }

        await submission.remove();

        res.json({ msg: 'Submission removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Submission not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;

