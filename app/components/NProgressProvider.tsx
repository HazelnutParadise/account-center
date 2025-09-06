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
    // 監聽路由開始變化
    const handleRouteStart = () => {
      NProgress.start();
    };

    // 監聽路由變化完成
    const handleRouteComplete = () => {
      NProgress.done();
    };

    // 由於 App Router 的路由變化很快，我們使用較短的延遲
    let timer: NodeJS.Timeout;
    
    // 當組件掛載時，如果有正在進行的導航，顯示進度條
    const startProgress = () => {
      NProgress.start();
      timer = setTimeout(() => {
        NProgress.done();
      }, 300);
    };

    // 清理函數
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      NProgress.done();
    };
  }, [router]);

  return <>{children}</>;
};

export default NProgressProvider;
