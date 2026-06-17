export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-navy-500 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-500 via-navy-600 to-navy-900" />
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gold rounded-xl flex items-center justify-center">
              <span className="text-navy-900 font-heading font-bold text-2xl">EQ</span>
            </div>
          </div>
          <h1 className="text-4xl font-heading font-bold text-white mb-4">
            EstateIQ
          </h1>
          <p className="text-navy-200 text-lg max-w-md">
            Smart estate management for modern living. Transparent fees, seamless payments, and effortless property oversight.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-gold">500+</div>
              <div className="text-navy-300 text-sm mt-1">Estates</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gold">50K+</div>
              <div className="text-navy-300 text-sm mt-1">Units</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gold">99.9%</div>
              <div className="text-navy-300 text-sm mt-1">Uptime</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
