import { NhostClient } from '@nhost/react'

export const nhost = new NhostClient({
  // Replace 'ap-south-1' with your actual 12-character Nhost subdomain
  // You can find it in your Nhost dashboard (Settings -> General)
  subdomain: 'YOUR_NHOST_SUBDOMAIN',
  region: 'ap-south-1'
})
