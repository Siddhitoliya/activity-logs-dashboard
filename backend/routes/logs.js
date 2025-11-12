const express = require('express');
const router = express.Router();
const { authenticateVector, authenticateDashboard } = require('../middleware/auth');
const {
  ingestLogs,
  getAuthLogs,
  getAdminLogs,
  getLoginStats,
  getRealmStats,
  getTimeSeriesData,
  getTopUsers,
  getSecurityAlerts
} = require('../controllers/logsController');

router.post('/ingest', authenticateVector, ingestLogs);

router.get('/auth', authenticateDashboard, getAuthLogs);
router.get('/admin', authenticateDashboard, getAdminLogs);

router.get('/stats/login', authenticateDashboard, getLoginStats);
router.get('/stats/realms', authenticateDashboard, getRealmStats);
router.get('/stats/timeseries', authenticateDashboard, getTimeSeriesData);
router.get('/stats/users/top', authenticateDashboard, getTopUsers);

router.get('/security/alerts', authenticateDashboard, getSecurityAlerts);

module.exports = router;