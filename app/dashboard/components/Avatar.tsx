'use client';

import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  alt: string;
  name: string;
  size?: number;
  className?: string;
}

const Avatar = ({ src, alt, name, size = 80, className = "" }: AvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // 取得名字或用戶名的第一個字符
  const getInitial = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || "U";
  };

  // 如果沒有圖片 URL 或圖片載入失敗，顯示名字開頭
  if (!src || imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        title={`${name}的頭像`}
      >
        {getInitial(name)}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {imageLoading && (
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold ${className}`}
          style={{ fontSize: size * 0.4 }}
        >
          {getInitial(name)}
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`rounded-full border-4 border-gray-200 dark:border-gray-600 ${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => setImageError(true)}
        onLoad={() => setImageLoading(false)}
        title={alt}
      />
    </div>
  );
};

export default Avatar;
