// FeedbackFlow Dashboard JavaScript

// API helper functions
const api = {
  async getFeedback(filters = {}) {
    const params = new URLSearchParams();
    if (filters.source) params.set('source', filters.source);
    if (filters.sentiment) params.set('sentiment', filters.sentiment);
    params.set('limit', '50');

    const response = await fetch(`/api/feedback?${params}`);
    if (!response.ok) throw new Error('Failed to fetch feedback');
    return response.json();
  },

  async getPriorityFeedback(limit = 5) {
    const response = await fetch(`/api/feedback/priority?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch priority feedback');
    return response.json();
  },

  async runAnalysis(batchSize = 10) {
    const response = await fetch(`/api/analyze?batch=${batchSize}`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to run analysis');
    return response.json();
  }
};

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Utility: Format relative time
function formatRelativeTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Render a single feedback item
function renderFeedbackItem(item, isHighPriority = false) {
  const sentimentClass = item.sentiment || 'pending';
  const sentimentLabel = item.sentiment
    ? item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)
    : 'Pending';
  const priorityClass = isHighPriority ? 'high-priority' : sentimentClass;

  return `
    <div class="feedback-item ${priorityClass}">
      <div class="feedback-meta">
        <span class="source-badge ${item.source}">${item.source}</span>
        <span class="feedback-user">${escapeHtml(item.user || 'Anonymous')}</span>
        <span class="feedback-time">${formatRelativeTime(item.timestamp)}</span>
        ${item.priority_score !== null
          ? `<span class="priority-score">Priority: ${item.priority_score}/10</span>`
          : ''}
      </div>
      <p class="feedback-text">${escapeHtml(item.text)}</p>
      <span class="sentiment-badge ${sentimentClass}">${sentimentLabel}</span>
    </div>
  `;
}

// Show status toast message
function showToast(message, type = 'info') {
  const toast = document.getElementById('status-toast');
  toast.textContent = message;
  toast.className = `status-toast ${type}`;

  // Auto-hide after 4 seconds
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

// Load and render priority feedback
async function loadPriorityFeedback() {
  const container = document.getElementById('priority-list');

  try {
    const items = await api.getPriorityFeedback(5);

    if (items.length === 0) {
      container.innerHTML = '<p class="empty-state">No high-priority items. Run AI Analysis to score feedback.</p>';
    } else {
      container.innerHTML = items.map(item => renderFeedbackItem(item, true)).join('');
    }
  } catch (error) {
    container.innerHTML = '<p class="loading">Error loading priority items.</p>';
    console.error('Error loading priority feedback:', error);
  }
}

// Load and render all feedback with filters
async function loadFeedback() {
  const container = document.getElementById('feedback-list');
  const sourceFilter = document.getElementById('filter-source').value;
  const sentimentFilter = document.getElementById('filter-sentiment').value;

  const filters = {};
  if (sourceFilter) filters.source = sourceFilter;
  if (sentimentFilter) filters.sentiment = sentimentFilter;

  try {
    const items = await api.getFeedback(filters);

    if (items.length === 0) {
      container.innerHTML = '<p class="empty-state">No feedback found matching filters.</p>';
    } else {
      container.innerHTML = items.map(item => renderFeedbackItem(item)).join('');
    }
  } catch (error) {
    container.innerHTML = '<p class="loading">Error loading feedback.</p>';
    console.error('Error loading feedback:', error);
  }
}

// Run AI analysis on unprocessed feedback
async function runAnalysis() {
  const btn = document.getElementById('analyze-btn');
  btn.disabled = true;
  btn.textContent = 'Analyzing...';

  try {
    const result = await api.runAnalysis(25); // Process up to 25 items

    if (result.processed === 0) {
      showToast('All feedback has been analyzed!', 'success');
    } else {
      showToast(`Analyzed ${result.processed} items. ${result.remaining} remaining.`, 'success');
    }

    // Reload both lists to show updated data
    await Promise.all([loadPriorityFeedback(), loadFeedback()]);
  } catch (error) {
    showToast('Error running analysis. Please try again.', 'error');
    console.error('Error running analysis:', error);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Run AI Analysis';
  }
}

// Event listeners
document.getElementById('filter-source').addEventListener('change', loadFeedback);
document.getElementById('filter-sentiment').addEventListener('change', loadFeedback);
document.getElementById('analyze-btn').addEventListener('click', runAnalysis);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  loadPriorityFeedback();
  loadFeedback();
});
