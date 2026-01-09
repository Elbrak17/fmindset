import { NextRequest, NextResponse } from 'next/server';
import { deleteAllUserData, exportUserData } from '@/services/userDataService';

/**
 * GET - Export all user data (GDPR data portability)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const odId = searchParams.get('odId');

    if (!odId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const data = await exportUserData(odId);

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="fmindset-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Failed to export user data' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete all user data (GDPR right to erasure)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const odId = searchParams.get('odId');
    const confirm = searchParams.get('confirm');

    if (!odId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (confirm !== 'true') {
      return NextResponse.json(
        { error: 'Confirmation required. Add ?confirm=true to proceed.' },
        { status: 400 }
      );
    }

    const result = await deleteAllUserData(odId);

    return NextResponse.json({
      success: true,
      message: 'All your data has been deleted',
      details: result.deletedCounts,
    });
  } catch (error) {
    console.error('Error deleting user data:', error);
    return NextResponse.json(
      { error: 'Failed to delete user data' },
      { status: 500 }
    );
  }
}
