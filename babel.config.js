const browsers = [
  '> 1%',
  'last 3 versions',
  'ios > 8',
  'not ie < 10',
];
const node = 'current';

const getCommonConfig = (targets = {}) => [
  [
    '@babel/env',
    {
      targets,
      useBuiltIns: 'usage',
      corejs: {
        version: 2,
      },
    }
  ],
  '@babel/react',
];

const config = (api) => {
  api.cache(true);

  const isWebpack = process.env.IS_WEBPACK === 'true';
  const plugins = [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-class-properties',
  ];
  if (isWebpack) plugins.push('react-hot-loader/babel');

  return {
    presets: getCommonConfig(isWebpack ? { browsers } : { node }),
    plugins,
  };
};

module.exports = config;
