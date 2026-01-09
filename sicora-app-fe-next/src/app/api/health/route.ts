/**
 * Health Check API - Para Docker y monitoreo
 * Sprint 17-18: Despliegue
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  });
}
