/**
 * 將圖片壓縮並裁切為正方形縮圖
 * @param file 原始檔案
 * @param size 縮圖尺寸 (px)
 * @returns Promise<string> Base64 字串
 */
export const compressImage = (file: File, size: number = 50): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 設定畫布為目標尺寸
        canvas.width = size;
        canvas.height = size;

        if (!ctx) return reject('Canvas context not found');

        // 計算裁切位置 (由中心向外裁切成正方形)
        const sourceSize = Math.min(img.width, img.height);
        const sourceX = (img.width - sourceSize) / 2;
        const sourceY = (img.height - sourceSize) / 2;

        // 畫出壓縮後的圖片
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize, // 來源裁切區域
          0, 0, size, size                          // 目標位置與大小
        );

        // 轉成 Base64 (使用 jpeg 格式並設定品質為 0.7)
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};