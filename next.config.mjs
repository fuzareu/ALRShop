/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          pathname: '**',
        },
        {
          protocol: 'https',
          hostname: 'raw.githubusercontent.com',
          pathname: '**',
        },
      ],
    },
    eslint: {
      ignoreDuringBuilds: true, // ✅ Add this to skip lint errors on `next build`
    },
  };
  
  export default nextConfig;
  
