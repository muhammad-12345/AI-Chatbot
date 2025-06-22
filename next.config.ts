import type { NextConfig } from 'next'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { headers } from 'next/headers'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/embed',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL' // In production, prefer: 'ALLOW-FROM https://client-domain.com'
          }
        ]
      }
    ]
  }
}

export default nextConfig
