export function compressImage(file, maxSizeMB = 2, maxWidth = 1920) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((maxWidth / width) * height);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        const maxBytes = maxSizeMB * 1024 * 1024;

        function tryQuality() {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const approxBytes = (dataUrl.length * 3) / 4;
          if (approxBytes > maxBytes && quality > 0.2) {
            quality -= 0.1;
            tryQuality();
          } else {
            resolve(dataUrl);
          }
        }

        tryQuality();
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}
