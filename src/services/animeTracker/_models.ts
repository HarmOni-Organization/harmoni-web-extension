/**
 * Media Tracker Models
 */

export interface MediaTracker {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  mediaUrl?: string;
  defaultStatuses: string[];
  customStatusSupport: boolean;
  customStatuses: string[];
  currentStatus: string;
  duration: number;
  currentPosition: number;
  log: MediaLogEntry[];
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

/**
 * Media Log Entry
 */
export interface MediaLogEntry {
  time: string;
  event?: string;
  status: string;
}

/**
 * Media Tracker Statistics
 */
export interface MediaTrackerStats {
  total: number;
  byStatus: Record<string, number>;
}

/**
 * Create Tracker DTO
 */
export interface CreateTrackerDto {
  title: string;
  description?: string;
  imageUrl?: string;
  mediaUrl?: string;
  defaultStatuses?: string[];
  customStatusSupport?: boolean;
  customStatuses?: string[];
  currentStatus?: string;
  duration?: number;
  currentPosition?: number;
  log?: MediaLogEntry[];
}

/**
 * Update Tracker DTO
 */
export interface UpdateTrackerDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  mediaUrl?: string;
  currentStatus?: string;
  currentPosition?: number;
}

export interface TrackerFilterOptions {
  status?: string;
  search?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
