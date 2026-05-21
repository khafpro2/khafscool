import { ImageResponse } from 'next/og';
import { AppIconMark } from '@/lib/app-icon';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(<AppIconMark size={192} />, {
    width: 192,
    height: 192,
  });
}
