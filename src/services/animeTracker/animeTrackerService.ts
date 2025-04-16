import harmOniApi from '../harmOniApi';
import { MediaTracker, MediaTrackerStats, CreateTrackerDto, UpdateTrackerDto } from './_models';

const API_PATH = '/media-trackers';

/**
 * Fetch all trackers with optional status filter
 */
export async function getAllTrackers(status?: string): Promise<MediaTracker[]> {
  const url = status ? `${API_PATH}?status=${status}` : API_PATH;
  const response = await harmOniApi.get(url);
  return response.data;
}

/**
 * Get a single tracker by ID
 */
export async function getTracker(id: string): Promise<MediaTracker> {
  const response = await harmOniApi.get(`${API_PATH}/${id}`);
  return response.data;
}

/**
 * Create a new tracker
 */
export async function createTracker(trackerData: CreateTrackerDto): Promise<MediaTracker> {
  console.log('trackerData', trackerData);

  const response = await harmOniApi.post(API_PATH, trackerData);
  return response.data;
}

/**
 * Update a tracker
 */
export async function updateTracker(
  id: string,
  updateData: UpdateTrackerDto
): Promise<MediaTracker> {
  const response = await harmOniApi.put(`${API_PATH}/${id}`, updateData);
  return response.data;
}

/**
 * Update tracker position
 */
export async function updatePosition(id: string, position: number): Promise<MediaTracker> {
  const response = await harmOniApi.put(`${API_PATH}/${id}/position`, { position });
  return response.data;
}

/**
 * Delete a tracker
 */
export async function deleteTracker(id: string): Promise<void> {
  await harmOniApi.delete(`${API_PATH}/${id}`);
}

/**
 * Add log entry to tracker
 */
export async function addLogEntry(
  id: string,
  event: string | undefined,
  status: string
): Promise<MediaTracker> {
  const response = await harmOniApi.post(`${API_PATH}/${id}/logs`, { event, status });
  return response.data;
}

/**
 * Add custom status to tracker
 */
export async function addCustomStatus(id: string, status: string): Promise<MediaTracker> {
  const response = await harmOniApi.post(`${API_PATH}/${id}/statuses`, { status });
  return response.data;
}

/**
 * Remove custom status from tracker
 */
export async function removeCustomStatus(id: string, status: string): Promise<void> {
  await harmOniApi.delete(`${API_PATH}/${id}/statuses/${status}`);
}

/**
 * Get available statuses for tracker
 */
export async function getAvailableStatuses(
  id: string
): Promise<{ defaultStatuses: string[]; customStatuses: string[] }> {
  const response = await harmOniApi.get(`${API_PATH}/${id}/statuses`);
  return response.data;
}

/**
 * Get default statuses
 */
export async function getDefaultStatuses(): Promise<string[]> {
  const response = await harmOniApi.get(`${API_PATH}/statuses/default`);
  return response.data;
}

/**
 * Batch update status for multiple trackers
 */
export async function batchUpdateStatus(
  trackerIds: string[],
  status: string
): Promise<{ updated: number; trackers: MediaTracker[] }> {
  const response = await harmOniApi.post(`${API_PATH}/batch/status`, {
    trackerIds,
    status,
  });
  return response.data;
}

/**
 * Get statistics for all trackers
 */
export async function getStats(): Promise<MediaTrackerStats> {
  const response = await harmOniApi.get(`${API_PATH}/stats`);
  return response.data;
}
