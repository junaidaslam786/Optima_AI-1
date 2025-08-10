"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-start bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(79, 135, 162, 0.7), rgba(79, 135, 162, 0.7)), url('/Banner.png')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Your health,<br />
              understood
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-light text-white leading-relaxed">
              At home blood tests, powered by<br />
              AI insights. No need for<br />
              appointments, no delays, just<br />
              intelligent health insights.
            </p>
            <Link 
              href="/products"
              className="inline-block bg-[rgb(79,135,162)] hover:bg-[rgb(69,125,152)] text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-300 border-2 border-white"
            >
              View tests
            </Link>
          </div>
        </div>
      </section>

      {/* How does it work Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-16">
            How does it work?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-32 h-32 mx-auto bg-white rounded-lg shadow-lg flex items-center justify-center relative">
                  <div className="relative">
                    <div className="w-16 h-20 bg-gray-200 rounded-lg border-2 border-gray-300"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white"></div>
                    <div className="absolute bottom-2 left-2 w-3 h-1 bg-gray-400 rounded"></div>
                    <div className="absolute bottom-1 left-2 w-4 h-1 bg-gray-400 rounded"></div>
                  </div>
                </div>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Find the test that will provide insight into what you are feeling. The test kit will be sent to you in the post.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-32 h-32 mx-auto bg-white rounded-lg shadow-lg flex items-center justify-center relative">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg border-2 border-blue-300 flex items-center justify-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-4 h-6 bg-gray-400 rounded transform rotate-12"></div>
                  </div>
                </div>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Complete your kit at home, using the instructions and equipment provided. Pop your sample back in the freepost packaging.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-32 h-32 mx-auto bg-white rounded-lg shadow-lg flex items-center justify-center relative">
                  <div className="relative">
                    <div className="w-16 h-12 bg-gray-200 rounded-lg border-2 border-gray-300"></div>
                    <div className="absolute top-1 left-1 w-3 h-2 bg-green-500 rounded"></div>
                    <div className="absolute top-1 right-1 w-6 h-2 bg-blue-500 rounded"></div>
                    <div className="absolute bottom-1 left-1 w-4 h-2 bg-purple-500 rounded"></div>
                    <div className="absolute -top-1 left-6 w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our accredited labs analyse your sample, it then goes through our AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Test Kits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Ultimate Performance */}
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <Link href="/products/ultimate-performance" className="block">
                <div className="mb-4">
                  <Image
                    src="/medical-kit.jpg"
                    alt="Ultimate Performance Blood Test"
                    width={200}
                    height={150}
                    className="mx-auto rounded-lg hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-800 hover:text-[rgb(79,135,162)] transition-colors">
                  ULTIMATE<br />PERFORMANCE
                </h3>
              </Link>
              <p className="text-sm text-gray-600 mb-4">
                Ultimate Performance Blood Tests
              </p>
              <p className="text-xl font-bold text-gray-800 mb-4">£85.00</p>
              <div className="flex space-x-2">
                <Link href="/products/ultimate-performance" className="flex-1">
                  <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition-colors duration-300">
                    View Details
                  </button>
                </Link>
              </div>
            </div>

            {/* Women's Hormones */}
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <Link href="/products/womens-hormones" className="block">
                <div className="mb-4">
                  <Image
                    src="/medical-kit2.jpg"
                    alt="Women's Hormones Blood Test"
                    width={200}
                    height={150}
                    className="mx-auto rounded-lg hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-800 hover:text-[rgb(79,135,162)] transition-colors">
                  WOMEN&apos;S<br />HORMONES
                </h3>
              </Link>
              <p className="text-sm text-gray-600 mb-4">
                Ultimate Healthy Woman Blood Test
              </p>
              <p className="text-xl font-bold text-gray-800 mb-4">£95.00</p>
              <div className="flex space-x-2">
                <Link href="/products/womens-hormones" className="flex-1">
                  <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition-colors duration-300">
                    View Details
                  </button>
                </Link>
              </div>
            </div>

            {/* Liver Function */}
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <Link href="/products/liver-function" className="block">
                <div className="mb-4">
                  <Image
                    src="/medical-kit.jpg"
                    alt="Liver Function Blood Test"
                    width={200}
                    height={150}
                    className="mx-auto rounded-lg hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-800 hover:text-[rgb(79,135,162)] transition-colors">
                  LIVER FUNCTION<br />BLOOD TEST
                </h3>
              </Link>
              <p className="text-sm text-gray-600 mb-4">
                Liver Function Blood Test
              </p>
              <p className="text-xl font-bold text-gray-800 mb-4">£30.00</p>
              <div className="flex space-x-2">
                <Link href="/products/liver-function" className="flex-1">
                  <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition-colors duration-300">
                    View Details
                  </button>
                </Link>
              </div>
            </div>

            {/* TRT Monitoring */}
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <Link href="/products/trt-monitoring" className="block">
                <div className="mb-4">
                  <Image
                    src="/medical-kit2.jpg"
                    alt="TRT Monitoring Blood Test"
                    width={200}
                    height={150}
                    className="mx-auto rounded-lg hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-800 hover:text-[rgb(79,135,162)] transition-colors">
                  TRT<br />MONITORING
                </h3>
              </Link>
              <p className="text-sm text-gray-600 mb-4">
                Ultimate TRT Blood Test
              </p>
              <p className="text-xl font-bold text-gray-800 mb-4">£125.00</p>
              <div className="flex space-x-2">
                <Link href="/products/trt-monitoring" className="flex-1">
                  <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition-colors duration-300">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/products"
              className="inline-block bg-[rgb(79,135,162)] hover:bg-[rgb(69,125,152)] text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
            >
              More Products
            </Link>
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section 
        className="py-20 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(79, 135, 162, 0.9), rgba(79, 135, 162, 0.9)), url('/Banner.png')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Refer a friend, both get
          </h2>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            10% off your next test kit
          </h2>
          <Link 
            href="/referral"
            className="inline-block bg-[rgb(79,135,162)] hover:bg-[rgb(69,125,152)] text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-300 border-2 border-white"
          >
            Book a Flu Shot
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;