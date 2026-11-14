/**
 * Next.js App Router Route Handler: /api/shops
 * 
 * GET: Lists all tracked shops and aggregated metrics.
 * POST: Dynamically registers a new shop by website URL.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getTrackedShops,
  registerShopByUrl,
  getShopMetrics,
} from '@/lib/shopRegistry';

export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const search = searchParams.get('search') || undefined;

    const shops = getTrackedShops({ activeOnly, search });
    const metrics = getShopMetrics();

    return NextResponse.json({
      success: true,
      shops,
      metrics,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve shops',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url, name } = body;

    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'A valid shop website URL is required.',
        },
        { status: 400 }
      );
    }

    const shop = await registerShopByUrl(url.trim(), name?.trim());

    return NextResponse.json(
      {
        success: true,
        shop,
        message: `Shop "${shop.name}" (${shop.domain}) registered successfully.`,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register shop by URL.',
      },
      { status: 500 }
    );
  }
}
