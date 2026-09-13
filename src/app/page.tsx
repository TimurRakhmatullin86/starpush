import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-yellow-500">★</span> StarPush
          </h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Get More 5-Star
          <br />
          Google Reviews
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Automatically collect Google reviews from happy customers.
          Intercept unhappy ones before they go public. Starting at{" "}
          <span className="font-semibold text-gray-900">$19/month</span>.
        </p>
        <Link
          href="/register"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
        >
          Start Free Trial — 10 SMS/month
        </Link>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Send SMS After Visit
            </h3>
            <p className="text-gray-600 text-sm">
              Automatically text customers after their visit with a review
              request link.
            </p>
          </div>
          <div className="p-6">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Smart Routing
            </h3>
            <p className="text-gray-600 text-sm">
              Happy customers (4-5 stars) go to Google. Unhappy ones (1-3
              stars) send feedback directly to you.
            </p>
          </div>
          <div className="p-6">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Protect Your Rating
            </h3>
            <p className="text-gray-600 text-sm">
              Negative feedback stays private. Fix issues before they become
              public 1-star reviews.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Birdeye costs $349/mo. Podium costs $399+.
            <br />
            StarPush starts at <span className="text-blue-600">$19/mo</span>.
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: "Free", price: "$0", desc: "10 SMS/month" },
              { name: "Starter", price: "$19", desc: "100 SMS/month", highlight: true },
              { name: "Growth", price: "$39", desc: "500 SMS/month" },
              { name: "Pro", price: "$69", desc: "Unlimited" },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-xl ${
                  plan.highlight
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <p className="font-semibold">{plan.name}</p>
                <p className="text-2xl font-bold my-2">{plan.price}</p>
                <p
                  className={`text-sm ${
                    plan.highlight ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {plan.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} StarPush. Built for local businesses.
      </footer>
    </div>
  );
}
