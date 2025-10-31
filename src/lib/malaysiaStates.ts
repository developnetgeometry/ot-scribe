export const MALAYSIA_STATES = [
  { label: 'ALL (National)', value: 'ALL' },
  { label: 'Johor', value: 'JHR' },
  { label: 'Kedah', value: 'KDH' },
  { label: 'Kelantan', value: 'KTN' },
  { label: 'Melaka', value: 'MLK' },
  { label: 'Negeri Sembilan', value: 'NSN' },
  { label: 'Pahang', value: 'PHG' },
  { label: 'Penang (Pulau Pinang)', value: 'PNG' },
  { label: 'Perak', value: 'PRK' },
  { label: 'Perlis', value: 'PLS' },
  { label: 'Sabah', value: 'SBH' },
  { label: 'Sarawak', value: 'SWK' },
  { label: 'Selangor', value: 'SGR' },
  { label: 'Terengganu', value: 'TRG' },
  { label: 'WP Kuala Lumpur', value: 'WPKL' },
  { label: 'WP Putrajaya', value: 'WPPJ' },
  { label: 'WP Labuan', value: 'WPLB' },
] as const;

export type MalaysiaStateCode = typeof MALAYSIA_STATES[number]['value'];
