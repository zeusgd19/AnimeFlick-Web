const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
    },
  },
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
    },
  },
  build: {
    esbuildOptions: (options: any) => {
      options.external = [
        ...(options.external || []), 
        'fsevents', 
        '@babel/preset-typescript/package.json',
        '@babel/core',
        'workbox-build',
        'next-pwa'
      ];
      return options;
    }
  }
};
export default config;
