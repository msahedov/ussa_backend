const express = require('express');
const router = express.Router();

// =====================================================
//                   AUTH ROUTES
// =====================================================

router.use('/auth', require('./authRoutes'));

// =====================================================
//                  ADMIN ROUTES
// =====================================================

router.use('/admin', require('./adminRoutes'));

// =====================================================
//                  PARTNER ROUTES
// =====================================================

router.use('/partner', require('./partnerRoutes'));

// =====================================================
//                  PUBLIC ROUTES
// =====================================================

router.use('/public', require('./publicRoutes'));

module.exports = router;