/**
 * Next.js App Router Route Handler: /api/shops/[id]
 * 
 * GET: Retrieves shop details by ID.
 * PATCH: Toggles tracking status or updates shop configuration.
 * DELETE: Deletes shop and cascades removal.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getShopById,
  toggleShopTracking,
  updateShop,
  deleteShop,
} from '@/lib/shopRegistry';
import { defaultRetailerShops } from '@/lib/db';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return defaultRetailerShops.map((shop) => ({
    id: shop.id,
  }));
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const shop = getShopById(id);

    if (!shop) {
      return NextResponse.json(
        {
          success: false,
          error: `Shop with ID "${id}" was not found.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      shop,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch shop details.',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const existing = getShopById(id);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Shop with ID "${id}" was not found.`,
        },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // If explicit toggle requested or no body fields provided, toggle status
    if (body.toggle === true || Object.keys(body).length === 0) {
      const updated = toggleShopTracking(id);
      return NextResponse.json({
        success: true,
        shop: updated,
        message: `Tracking status for "${updated?.name}" toggled to ${
          updated?.isTracked ? 'active' : 'paused'
        }.`,
      });
    }

    // Otherwise apply partial updates
    const updated = updateShop(id, body);
    return NextResponse.json({
      success: true,
      shop: updated,
      message: `Shop "${updated?.name}" configuration updated successfully.`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update shop configuration.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const existing = getShopById(id);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Shop with ID "${id}" was not found.`,
        },
        { status: 404 }
      );
    }

    const deleted = deleteShop(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to delete shop "${id}".`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Shop "${existing.name}" (${existing.domain}) deleted successfully.`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete shop.',
      },
      { status: 500 }
    );
  }
}
