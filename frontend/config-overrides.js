const path = require('path');

module.exports = function override(config) {
  // Cấu hình alias cho @
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, 'src'),
  };
  
  // Đảm bảo TypeScript files được xử lý đúng
  const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
  if (oneOfRule) {
    // Tìm rule xử lý TypeScript và đảm bảo nó hỗ trợ alias
    const tsRule = oneOfRule.oneOf.find(
      (rule) => rule.test && rule.test.toString().includes('tsx?')
    );
    if (tsRule && tsRule.resolve) {
      tsRule.resolve.alias = {
        ...tsRule.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
      };
    }
  }
  
  return config;
};

