const { query, getClient } = require('../config/database');

async function ingestLogs(req, res) {
  try {
    const logs = Array.isArray(req.body) ? req.body : [req.body];
    
    console.log(`📥 Received ${logs.length} log entries from Vector`);

    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      for (const log of logs) {
        if (log.is_auth_event) {
          await insertAuthLog(client, log);
        } else if (log.is_admin_event) {
          await insertAdminLog(client, log);
        }
      }

      await client.query('COMMIT');
      console.log(`✅ Successfully inserted ${logs.length} logs`);
      
      res.status(200).json({ 
        success: true, 
        inserted: logs.length 
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error ingesting logs:', error);
    res.status(500).json({ 
      error: 'Failed to ingest logs',
      message: error.message 
    });
  }
}

// Helper: Insert auth log
async function insertAuthLog(client, log) {
  const sql = `
    INSERT INTO auth_logs (
      timestamp, event_type, realm, client_id, 
      user_id, username, email, ip_address, 
      user_agent, session_id, error_message, 
      success, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `;

  const values = [
    log.timestamp || new Date(),
    log.event_type || 'UNKNOWN',
    log.realm || null,
    log.client_id || null,
    log.user_id || null,
    log.username || null,
    log.email || null,
    log.ip_address || null,
    log.user_agent || null,
    log.session_id || null,
    log.error_message || null,
    log.success !== false, // Default to true unless explicitly false
    JSON.stringify(log.metadata || {})
  ];

  await client.query(sql, values);
}

// Helper: Insert admin log
async function insertAdminLog(client, log) {
  const sql = `
    INSERT INTO admin_logs (
      timestamp, operation_type, resource_type, 
      resource_path, admin_user_id, admin_username, 
      realm, representation, error_message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;

  const values = [
    log.timestamp || new Date(),
    log.operation || 'UNKNOWN',
    log.resource_type || null,
    log.resource_path || null,
    log.admin_user_id || null,
    log.admin_username || null,
    log.realm || null,
    JSON.stringify(log.representation || {}),
    log.error_message || null
  ];

  await client.query(sql, values);
}

async function getAuthLogs(req, res) {
  try {
    const { 
      limit = 100, 
      offset = 0, 
      event_type, 
      realm, 
      start_date, 
      end_date,
      success 
    } = req.query;

    let sql = `
      SELECT * FROM auth_logs 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (event_type) {
      sql += ` AND event_type = $${paramIndex}`;
      params.push(event_type);
      paramIndex++;
    }

    if (realm) {
      sql += ` AND realm = $${paramIndex}`;
      params.push(realm);
      paramIndex++;
    }

    if (start_date) {
      sql += ` AND timestamp >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      sql += ` AND timestamp <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    if (success !== undefined) {
      sql += ` AND success = $${paramIndex}`;
      params.push(success === 'true');
      paramIndex++;
    }

    sql += ` ORDER BY timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    const countSql = `SELECT COUNT(*) FROM auth_logs WHERE 1=1`;
    const countResult = await query(countSql);

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error fetching auth logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
}

async function getAdminLogs(req, res) {
  try {
    const { 
      limit = 100, 
      offset = 0, 
      operation_type, 
      realm, 
      start_date, 
      end_date 
    } = req.query;

    let sql = `
      SELECT * FROM admin_logs 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (operation_type) {
      sql += ` AND operation_type = $${paramIndex}`;
      params.push(operation_type);
      paramIndex++;
    }

    if (realm) {
      sql += ` AND realm = $${paramIndex}`;
      params.push(realm);
      paramIndex++;
    }

    if (start_date) {
      sql += ` AND timestamp >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      sql += ` AND timestamp <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    sql += ` ORDER BY timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    res.json({
      data: result.rows,
      total: result.rowCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
}

async function getLoginStats(req, res) {
  try {
    const { period = '24h' } = req.query;
    
    const intervals = {
      '1h': '1 hour',
      '24h': '24 hours',
      '7d': '7 days',
      '30d': '30 days'
    };

    const interval = intervals[period] || '24 hours';

    const sql = `
      SELECT 
        event_type,
        success,
        COUNT(*) as count
      FROM auth_logs
      WHERE timestamp >= NOW() - INTERVAL '${interval}'
      GROUP BY event_type, success
      ORDER BY count DESC
    `;

    const result = await query(sql);

    res.json({ data: result.rows, period });

  } catch (error) {
    console.error('Error fetching login stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}

async function getRealmStats(req, res) {
  try {
    const sql = `
      SELECT 
        realm,
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE success = true) as successful_logins,
        COUNT(*) FILTER (WHERE success = false) as failed_logins,
        COUNT(DISTINCT user_id) as unique_users
      FROM auth_logs
      WHERE timestamp >= NOW() - INTERVAL '24 hours'
      GROUP BY realm
      ORDER BY total_events DESC
    `;

    const result = await query(sql);
    res.json({ data: result.rows });

  } catch (error) {
    console.error('Error fetching realm stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}

async function getTimeSeriesData(req, res) {
  try {
    const { period = '24h', interval = '1h' } = req.query;

    const periodMap = {
      '1h': '1 hour',
      '24h': '24 hours',
      '7d': '7 days',
      '30d': '30 days'
    };

    const intervalMap = {
      '5m': '5 minutes',
      '1h': '1 hour',
      '1d': '1 day'
    };

    const sql = `
      SELECT 
        date_trunc('hour', timestamp) as time_bucket,
        event_type,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE success = true) as successful,
        COUNT(*) FILTER (WHERE success = false) as failed
      FROM auth_logs
      WHERE timestamp >= NOW() - INTERVAL '${periodMap[period] || '24 hours'}'
      GROUP BY time_bucket, event_type
      ORDER BY time_bucket DESC
    `;

    const result = await query(sql);
    res.json({ data: result.rows });

  } catch (error) {
    console.error('Error fetching time series:', error);
    res.status(500).json({ error: 'Failed to fetch time series data' });
  }
}

async function getTopUsers(req, res) {
  try {
    const { limit = 10 } = req.query;

    const sql = `
      SELECT 
        username,
        email,
        COUNT(*) as login_count,
        MAX(timestamp) as last_login,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM auth_logs
      WHERE event_type = 'LOGIN' 
        AND timestamp >= NOW() - INTERVAL '7 days'
      GROUP BY username, email
      ORDER BY login_count DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    res.json({ data: result.rows });

  } catch (error) {
    console.error('Error fetching top users:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
}

// Security alerts
async function getSecurityAlerts(req, res) {
  try {
    const sql = `
      SELECT 
        'Multiple Failed Logins' as alert_type,
        username,
        COUNT(*) as failed_attempts,
        MAX(timestamp) as last_attempt,
        array_agg(DISTINCT ip_address) as ip_addresses
      FROM auth_logs
      WHERE success = false 
        AND event_type = 'LOGIN'
        AND timestamp >= NOW() - INTERVAL '1 hour'
      GROUP BY username
      HAVING COUNT(*) >= 3
      ORDER BY failed_attempts DESC
      LIMIT 20
    `;

    const result = await query(sql);
    res.json({ alerts: result.rows });

  } catch (error) {
    console.error('Error fetching security alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}

module.exports = {
  ingestLogs,
  getAuthLogs,
  getAdminLogs,
  getLoginStats,
  getRealmStats,
  getTimeSeriesData,
  getTopUsers,
  getSecurityAlerts
};