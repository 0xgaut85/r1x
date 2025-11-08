/**
 * Marketplace Catalog Utility
 * 
 * Fetches and maintains an up-to-date catalog of marketplace services
 * Refreshes every 60 seconds without hard limits
 */

import { MarketplaceService } from '@/lib/types/x402';
import { ServiceCategory } from '@/lib/intent/parseIntent';

const REFRESH_INTERVAL_MS = 60000; // 60 seconds

class MarketplaceCatalog {
  private services: MarketplaceService[] = [];
  private lastFetch: number = 0;
  private refreshTimer: NodeJS.Timeout | null = null;
  private listeners: Set<() => void> = new Set();

  /**
   * Start automatic refresh every 60 seconds
   */
  startAutoRefresh(): void {
    if (this.refreshTimer) {
      return; // Already started
    }

    // Initial fetch
    this.fetchServices();

    // Set up interval
    this.refreshTimer = setInterval(() => {
      this.fetchServices();
    }, REFRESH_INTERVAL_MS);
  }

  /**
   * Stop automatic refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Fetch services from API (no hard limits)
   */
  async fetchServices(): Promise<MarketplaceService[]> {
    try {
      const response = await fetch('/api/marketplace/services');
      if (!response.ok) {
        console.error('[Catalog] Failed to fetch services:', response.status);
        return this.services; // Return cached services on error
      }

      const data = await response.json();
      if (data.services && Array.isArray(data.services)) {
        this.services = data.services;
        this.lastFetch = Date.now();
        
        // Notify listeners
        this.listeners.forEach(listener => listener());
        
        console.log(`[Catalog] Refreshed ${this.services.length} services`);
      }
    } catch (error) {
      console.error('[Catalog] Error fetching services:', error);
    }

    return this.services;
  }

  /**
   * Get all services (cached)
   */
  getAllServices(): MarketplaceService[] {
    return [...this.services];
  }

  /**
   * Filter services by category
   */
  getServicesByCategory(category: ServiceCategory): MarketplaceService[] {
    if (category === 'other') {
      return this.services;
    }

    return this.services.filter(service => {
      const serviceCategory = service.category?.toLowerCase() || 'other';
      
      // Map category aliases
      if (category === 'mint' && (serviceCategory === 'mint' || serviceCategory === 'tokens')) {
        return true;
      }
      if (category === 'tokens' && (serviceCategory === 'tokens' || serviceCategory === 'mint')) {
        return true;
      }
      if (category === 'nfts' && serviceCategory === 'nfts') {
        return true;
      }
      if (category === 'ai' && serviceCategory === 'ai') {
        return true;
      }
      if (category === 'api' && serviceCategory === 'api') {
        return true;
      }
      if (category === 'data' && serviceCategory === 'data') {
        return true;
      }
      if (category === 'compute' && serviceCategory === 'compute') {
        return true;
      }
      if (category === 'teleop' && serviceCategory === 'teleop') {
        return true;
      }
      if (category === 'routes' && serviceCategory === 'routes') {
        return true;
      }
      if (category === 'content' && serviceCategory === 'content') {
        return true;
      }

      return false;
    });
  }

  /**
   * Rank services by relevance
   * Priority: Base network > merchant trust > price > recency
   */
  rankServices(
    services: MarketplaceService[],
    maxResults: number = 5
  ): MarketplaceService[] {
    return services
      .filter(service => {
        // Prefer Base network
        return service.network === 'base' && service.chainId === 8453;
      })
      .sort((a, b) => {
        // 1. Base network first (already filtered)
        // 2. Lower price (if available)
        const priceA = parseFloat(a.price || '999999');
        const priceB = parseFloat(b.price || '999999');
        if (priceA !== priceB) {
          return priceA - priceB;
        }
        // 3. Prefer non-external (our own services)
        if (a.isExternal !== b.isExternal) {
          return a.isExternal ? 1 : -1;
        }
        // 4. Alphabetical by name as tiebreaker
        return (a.name || '').localeCompare(b.name || '');
      })
      .slice(0, maxResults);
  }

  /**
   * Get services matching query and category
   */
  findServices(
    category: ServiceCategory,
    maxResults: number = 5
  ): MarketplaceService[] {
    const filtered = this.getServicesByCategory(category);
    return this.rankServices(filtered, maxResults);
  }

  /**
   * Subscribe to catalog updates
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get last fetch timestamp
   */
  getLastFetch(): number {
    return this.lastFetch;
  }
}

// Singleton instance
export const marketplaceCatalog = new MarketplaceCatalog();

