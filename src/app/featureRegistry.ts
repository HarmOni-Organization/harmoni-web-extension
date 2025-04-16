import React from 'react';
import { logger } from '../utils/logger';

// Define the types for feature modules
export type FeatureId = string;

export interface Feature {
  id: FeatureId;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  isEnabled?: boolean;
  order?: number;
}

// Feature registry class to manage feature modules
class FeatureRegistry {
  private features: Map<FeatureId, Feature> = new Map();

  // Register a new feature
  register(feature: Feature): void {
    if (this.features.has(feature.id)) {
      logger.warn(`Feature with id ${feature.id} is already registered`);
      return;
    }

    this.features.set(feature.id, {
      ...feature,
      isEnabled: feature.isEnabled ?? true,
      order: feature.order ?? this.features.size,
    });
  }

  // Get all registered features
  getAll(): Feature[] {
    return Array.from(this.features.values())
      .filter((feature) => feature.isEnabled)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // Get a feature by ID
  getById(id: FeatureId): Feature | undefined {
    return this.features.get(id);
  }

  // Check if a feature exists
  hasFeature(id: FeatureId): boolean {
    return this.features.has(id);
  }

  // Enable or disable a feature
  setEnabled(id: FeatureId, isEnabled: boolean): void {
    const feature = this.features.get(id);
    if (feature) {
      this.features.set(id, { ...feature, isEnabled });
    }
  }
}

// Create and export singleton instance
export const featureRegistry = new FeatureRegistry();

// Create a hook to access the feature registry
export function useFeatures() {
  return {
    features: featureRegistry.getAll(),
    getFeature: (id: FeatureId) => featureRegistry.getById(id),
    hasFeature: (id: FeatureId) => featureRegistry.hasFeature(id),
    setEnabled: (id: FeatureId, isEnabled: boolean) => featureRegistry.setEnabled(id, isEnabled),
  };
}
