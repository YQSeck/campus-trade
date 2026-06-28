// 【模块二：商品发布与管理】图片压缩工具
// AI 生成：手动调整前请勿修改
// 返回 Promise<base64DataUrl>

/**
 * 压缩图片文件并返回 base64 数据
 * @param {File} file - 原始图片文件
 * @param {number} maxSizeMB - 目标最大体积（MB），默认2MB
 * @param {number} maxWidth - 最大宽度（px），超出等比缩放
 * @returns {Promise<string>} base64 格式的图片数据
 */
export function compressImage(file, maxSizeMB = 2, maxWidth = 1920) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 限制最大宽度
        if (width > maxWidth) {
          height = Math.round((maxWidth / width) * height);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // 尝试以不同质量压缩到目标体积以下
        let quality = 0.9;
        const maxBytes = maxSizeMB * 1024 * 1024;

        function tryQuality() {
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          const approxBytes = (dataUrl.length * 3) / 4; // base64 近似原始字节数
          if (approxBytes > maxBytes && quality > 0.2) {
            quality -= 0.1;
            tryQuality();
          } else {
            resolve(dataUrl);
          }
        }

        tryQuality();
      };
      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}
