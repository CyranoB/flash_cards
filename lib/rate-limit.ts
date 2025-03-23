import { LRUCache } from 'lru-cache'
import { RateLimitError } from './errors'

export interface RateLimitOptions {
  interval: number
  maxTrackedIPs: number
}

export function rateLimit(options: RateLimitOptions) {
  const ipCache = new LRUCache({
    max: options.maxTrackedIPs,
    ttl: options.interval,
  })

  return {
    check: async (limit: number, ipAddress: string) => {
      const requestCount = (ipCache.get(ipAddress) as number[]) || [0]
      if (requestCount[0] === 0) {
        ipCache.set(ipAddress, [1])
        return
      }
      
      requestCount[0] += 1
      const currentUsage = requestCount[0]
      ipCache.set(ipAddress, requestCount)

      if (currentUsage > limit) {
        throw new RateLimitError(
          `IP ${ipAddress} exceeded rate limit of ${limit} requests per ${options.interval/1000} seconds`
        )
      }
    },
  }
} 