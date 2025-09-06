import { NextRequest, NextResponse } from 'next/server';
import { managementAPI } from '../../../../logto';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('Callback received with params:', {
      code: code ? code.substring(0, 20) + '...' : null,
      state,
      error,
      allParams: Object.fromEntries(searchParams.entries())
    });

    // 檢查是否有錯誤
    if (error) {
      console.error('Social auth error:', error);
      return NextResponse.redirect(new URL('/dashboard/profile?error=social_auth_failed', request.url));
    }

    // 檢查必要參數
    if (!code || !state) {
      console.error('Missing required parameters:', { code: !!code, state: !!state });
      return NextResponse.redirect(new URL('/dashboard/profile?error=invalid_callback', request.url));
    }

    // 從 state 參數中提取 verificationRecordId 和 connectorId
    const stateParts = state.split(':');
    if (stateParts.length !== 3) {
      console.error('Invalid state format:', state);
      return NextResponse.redirect(new URL('/dashboard/profile?error=invalid_state_format', request.url));
    }

    const [originalState, verificationRecordId, connectorId] = stateParts;
    console.log('Extracted parameters:', { verificationRecordId, connectorId });

    console.log('Completing social connection with:', {
      verificationRecordId,
      connectorId,
      authorizationCode: code.substring(0, 20) + '...',
      state: originalState
    });

    try {
      // 使用新的社群連接完成方法
      await managementAPI.completeSocialConnection(verificationRecordId, code, originalState, connectorId);
      
      console.log('Social connection completed successfully');
      return NextResponse.redirect(new URL('/dashboard/profile?success=social_connected', request.url));
      
    } catch (error) {
      console.error('Failed to process social callback:', error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      
      // 處理特定的錯誤類型
      if (error instanceof Error && error.message.startsWith('IDENTITY_ALREADY_IN_USE:')) {
        console.log('Detected identity already in use error, redirecting...');
        return NextResponse.redirect(new URL('/dashboard/profile?error=social_already_connected', request.url));
      }
      
      // 根據錯誤類型提供更具體的錯誤訊息
      let errorType = 'social_connect_failed';
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('400')) {
          errorType = 'invalid_social_response';
        } else if (errorMessage.includes('409') || errorMessage.includes('conflict')) {
          errorType = 'social_already_connected';
        } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
          errorType = 'social_permission_denied';
        }
      }
      
      console.log('Redirecting to error type:', errorType);
      return NextResponse.redirect(new URL(`/dashboard/profile?error=${errorType}`, request.url));
    }
  } catch (error) {
    console.error('Unexpected error in social callback:', error);
    return NextResponse.redirect(new URL('/dashboard/profile?error=unexpected_error', request.url));
  }
}
