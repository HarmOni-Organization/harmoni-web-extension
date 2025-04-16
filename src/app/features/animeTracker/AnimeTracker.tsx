import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import {
  fetchTrackers,
  fetchStats,
  fetchDefaultStatuses,
  editTracker,
  addStatus,
  setCurrentStatus,
  clearError,
  selectTrackers,
  selectTrackerStats,
  selectDefaultStatuses,
  selectCurrentStatus,
  selectStatus,
  selectError,
  addTracker,
  updateTracker,
  deleteTracker,
  setError,
} from './animeTrackerSlice';

// Define default statuses inline to avoid import issues
const DEFAULT_STATUSES = [
  'watching',
  'completed',
  'on_hold',
  'dropped',
  'plan_to_watch',
  'not_started',
];

// Component implementation
export default function AnimeTracker() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const trackers = useAppSelector(selectTrackers);
  const stats = useAppSelector(selectTrackerStats);
  const defaultStatuses = useAppSelector(selectDefaultStatuses);
  const currentStatus = useAppSelector(selectCurrentStatus);
  const status = useAppSelector(selectStatus);
  const error = useAppSelector(selectError);
  const loading = status === 'loading';

  const [customStatus, setCustomStatus] = useState<string>('');
  const [statuses, setStatuses] = useState<string[]>(DEFAULT_STATUSES);
  const [enableTracking, setEnableTracking] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAnime, setNewAnime] = useState({
    title: '',
    description: '',
    imageUrl: '',
    mediaUrl: '',
    defaultStatuses: [...DEFAULT_STATUSES],
    customStatusSupport: false,
    customStatuses: [],
    currentStatus: 'plan_to_watch',
    duration: 0,
    currentPosition: 0,
    log: [],
  });

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTrackers(currentStatus));
      dispatch(fetchStats());
      dispatch(fetchDefaultStatuses());
    }
  }, [isAuthenticated, currentStatus, dispatch]);

  // Update tracker status
  const handleStatusChange = (trackerId: string, newStatus: string) => {
    if (!trackerId) return;

    dispatch(
      updateTracker({
        id: trackerId,
        data: { currentStatus: newStatus },
      })
    );
  };

  // Add custom status
  const handleAddCustomStatus = () => {
    if (!customStatus.trim()) {
      dispatch(setError('Custom status cannot be empty'));
      return;
    }

    if (statuses.includes(customStatus)) {
      dispatch(setError('Status already exists'));
      return;
    }

    setStatuses([...statuses, customStatus]);
    setCustomStatus('');
    dispatch(clearError());
  };

  // Enable tracking on MyAnimeList
  const handleEnableTracking = () => {
    setEnableTracking(!enableTracking);

    // Enable tracking on MyAnimeList through content script
    if (!enableTracking) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'enableMALTracking' });
        }
      });
    }
  };

  // Filter trackers by status
  const handleFilterByStatus = (status: string) => {
    dispatch(setCurrentStatus(status));
  };

  // Handle errors
  const handleDismissError = () => {
    dispatch(clearError());
  };

  // Handle input change for new anime form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setNewAnime({ ...newAnime, [name]: checked });
    } else if (type === 'number') {
      setNewAnime({ ...newAnime, [name]: parseFloat(value) || 0 });
    } else {
      setNewAnime({ ...newAnime, [name]: value });
    }
  };

  // Handle add anime form submission
  const handleAddAnime = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAnime.title.trim()) {
      dispatch(setError('Anime title is required'));
      return;
    }

    dispatch(addTracker(newAnime));

    // Reset form and hide it after submission
    setNewAnime({
      title: '',
      description: '',
      imageUrl: '',
      mediaUrl: '',
      defaultStatuses: [...DEFAULT_STATUSES],
      customStatusSupport: false,
      customStatuses: [],
      currentStatus: 'plan_to_watch',
      duration: 0,
      currentPosition: 0,
      log: [],
    });
    setShowCreateForm(false);
  };

  const filteredTrackers =
    currentStatus === 'all'
      ? trackers
      : trackers.filter((tracker) => tracker.currentStatus === currentStatus);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Anime Tracker</h2>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex justify-between items-center">
          <span>{error}</span>
          <button onClick={handleDismissError} className="text-red-500 hover:text-red-700">
            &times;
          </button>
        </div>
      )}

      {/* Enable Tracking Button */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={enableTracking}
            onChange={handleEnableTracking}
            className="mr-2"
          />
          Enable Tracking on MyAnimeList
        </label>
        <p className="text-sm text-gray-500 mt-1">
          This will add status selectors to anime covers on MyAnimeList.
        </p>
      </div>

      {/* Add Anime Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {showCreateForm ? 'Cancel' : 'Add New Anime'}
        </button>
      </div>

      {/* Create Anime Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-medium mb-3">Add New Anime</h3>
          <form onSubmit={handleAddAnime}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={newAnime.title}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Anime title"
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={newAnime.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Short description (optional)"
                rows={3}
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={newAnime.imageUrl}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg (optional)"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Media URL</label>
              <input
                type="url"
                name="mediaUrl"
                value={newAnime.mediaUrl}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://myanimelist.net/anime/1234 (optional)"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
              <select
                name="currentStatus"
                value={newAnime.currentStatus}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                {(defaultStatuses.length ? defaultStatuses : DEFAULT_STATUSES).map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="customStatusSupport"
                  checked={newAnime.customStatusSupport}
                  onChange={(e) =>
                    setNewAnime({ ...newAnime, customStatusSupport: e.target.checked })
                  }
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Enable Custom Statuses</span>
              </label>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  min="0"
                  value={newAnime.duration}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Total duration in minutes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Position (minutes)
                </label>
                <input
                  type="number"
                  name="currentPosition"
                  min="0"
                  value={newAnime.currentPosition}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Current position in minutes"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Anime
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Statistics</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <div className="p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-700">{count}</div>
                <div className="text-sm text-gray-500 capitalize">{status.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Filter by Status</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterByStatus('all')}
            className={`px-3 py-1 rounded text-sm ${
              currentStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {(defaultStatuses.length ? defaultStatuses : DEFAULT_STATUSES).map((status: string) => (
            <button
              key={status}
              onClick={() => handleFilterByStatus(status)}
              className={`px-3 py-1 rounded text-sm ${
                currentStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Trackers List */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">
          {trackers.length} Anime in &ldquo;{currentStatus.replace(/_/g, ' ')}&rdquo;
        </h3>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading anime list...</p>
          </div>
        ) : trackers.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded">
            <p className="text-gray-500">No anime found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackers.map((tracker) => (
              <div key={tracker.id} className="border rounded overflow-hidden">
                <div className="relative h-40 bg-gray-200">
                  {tracker.imageUrl && (
                    <img
                      src={tracker.imageUrl}
                      alt={tracker.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-medium mb-1 truncate">{tracker.title}</h4>

                  {/* Status Selector */}
                  <div className="mt-2">
                    <select
                      value={tracker.currentStatus}
                      onChange={(e) => handleStatusChange(tracker.id, e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                    >
                      {[...tracker.defaultStatuses, ...tracker.customStatuses].map((status) => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Status */}
                  {tracker.customStatusSupport && (
                    <div className="mt-2 flex gap-1">
                      <input
                        type="text"
                        placeholder="Add custom status"
                        value={customStatus}
                        onChange={(e) => setCustomStatus(e.target.value)}
                        className="flex-1 p-1 text-sm border rounded"
                      />
                      <button
                        onClick={() =>
                          dispatch(addStatus({ id: tracker.id, status: customStatus }))
                        }
                        className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
