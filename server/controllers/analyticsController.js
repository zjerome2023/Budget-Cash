import {
  fetchByCategory,
  fetchOverTime,
  fetchSummary,
} from '../utils/analyticsQueries.js';

export async function getSummary(req, res) {
  try {
    const summary = await fetchSummary(req.user._id, req.query);
    res.json({ summary });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ message: 'Failed to get analytics summary' });
  }
}

export async function getByCategory(req, res) {
  try {
    const byCategory = await fetchByCategory(req.user._id, req.query);
    res.json({ byCategory });
  } catch (error) {
    console.error('Analytics by-category error:', error);
    res.status(500).json({ message: 'Failed to get analytics by category' });
  }
}

export async function getOverTime(req, res) {
  try {
    const overTime = await fetchOverTime(req.user._id, req.query);
    res.json({ overTime });
  } catch (error) {
    console.error('Analytics over-time error:', error);
    res.status(500).json({ message: 'Failed to get analytics over time' });
  }
}
