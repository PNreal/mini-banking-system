const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      const srcPath = path.resolve(__dirname, 'src');
      
      // Đảm bảo resolve object tồn tại
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }
      
      // Cấu hình alias - override để đảm bảo hoạt động
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@': srcPath,
      };
      
      // Cấu hình extensions - đảm bảo thứ tự đúng
      if (!webpackConfig.resolve.extensions) {
        webpackConfig.resolve.extensions = [];
      }
      // Đảm bảo .tsx và .ts được ưu tiên trước .jsx và .js
      const extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
      webpackConfig.resolve.extensions = [
        ...extensions,
        ...webpackConfig.resolve.extensions.filter(ext => !extensions.includes(ext))
      ];
      
      // Cấu hình modules để hỗ trợ resolve từ src
      if (!webpackConfig.resolve.modules) {
        webpackConfig.resolve.modules = ['node_modules'];
      }
      if (!webpackConfig.resolve.modules.includes(srcPath)) {
        webpackConfig.resolve.modules = [srcPath, ...webpackConfig.resolve.modules];
      }
      
      // Đảm bảo symlinks được resolve
      webpackConfig.resolve.symlinks = false;
      
      return webpackConfig;
    },
  },
};
