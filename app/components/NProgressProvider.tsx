'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';

// 配置 NProgress
NProgress.configure({
  showSpinner: false, // 隱藏右上角的旋轉器
  speed: 400,        // 動畫速度 (毫秒)
  minimum: 0.2,      // 最小進度百分比
  easing: 'ease',    // CSS 緩動函數
  positionUsing: '',  // 定位方法
  trickleSpeed: 200, // 自動遞增速度
});

const NProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    // 清理函數
    return () => {
      NProgress.done();
    };
  }, [router]);

  return <>{children}</>;
};

export default NProgressProvider;
