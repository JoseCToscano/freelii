"use client";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  Globe,
  Smartphone,
  DollarSign,
  Clock,
  Menu,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function FreeliiLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const features = [
    {
      icon: Globe,
      title: "Global Reach",
      description: "Collect money from anywhere in the world",
    },
    {
      icon: Smartphone,
      title: "Easy to Use",
      description: "Simple mobile-friendly process",
    },
    {
      icon: DollarSign,
      title: "Competitive Rates",
      description: "Low fees for international transfers",
    },
    {
      icon: Clock,
      title: "Fast & Secure",
      description: "Quick and safe cash collections",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <a href="#" className="text-2xl font-bold text-[#3390EC]">
                Freelii
              </a>
            </div>
            <div className="-my-2 -mr-2 md:hidden">
              <Button variant="ghost" onClick={toggleMenu}>
                <span className="sr-only">Open menu</span>
                {isMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
            {/*<nav className="hidden space-x-10 md:flex">*/}
            {/*  <a*/}
            {/*    href="#"*/}
            {/*    className="text-base font-medium text-gray-500 hover:text-gray-900"*/}
            {/*  >*/}
            {/*    How It Works*/}
            {/*  </a>*/}
            {/*  <a*/}
            {/*    href="#"*/}
            {/*    className="text-base font-medium text-gray-500 hover:text-gray-900"*/}
            {/*  >*/}
            {/*    Features*/}
            {/*  </a>*/}
            {/*  <a*/}
            {/*    href="#"*/}
            {/*    className="text-base font-medium text-gray-500 hover:text-gray-900"*/}
            {/*  >*/}
            {/*    Contact*/}
            {/*  </a>*/}
            {/*</nav>*/}
          </div>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <div className="relative overflow-hidden bg-white">
          <div className="mx-auto max-w-7xl">
            <div className="relative z-10 bg-white pb-8 sm:pb-16 md:pb-20 lg:w-full lg:max-w-2xl lg:pb-28 xl:pb-32">
              <main className="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">
                      Send and receive money
                    </span>{" "}
                    <span className="block text-[#3390EC] xl:inline">
                      anywhere, anytime
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl lg:mx-0">
                    With Freelli, collecting money from loved ones abroad is as
                    easy as sending a text message. Secure, fast, and accessible
                    worldwide.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link href={"https://t.me/FreeliiBot"}>
                        <Button className="flex w-full items-center justify-center rounded-md border border-transparent bg-[#3390EC] px-8 py-3 text-base font-medium text-white hover:bg-[#2980d9] md:px-10 md:py-4 md:text-lg">
                          Get started
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-3 sm:ml-3 sm:mt-0">
                      <Link href={"/transfer-preview"}>
                        <Button
                          variant="outline"
                          className="flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium md:px-10 md:py-4 md:text-lg"
                        >
                          Start a transfer
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <Image
              className="h-56 w-full rounded-full object-cover pl-10 sm:h-72 md:h-96 lg:h-full lg:w-full"
              src="/c.jpg"
              width={700}
              height={800}
              alt="Telegram"
            />
          </div>
        </div>

        {/* Feature section */}
        <div className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base font-semibold uppercase tracking-wide text-[#3390EC]">
                Features
              </h2>
              <p className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                A better way to collect your money
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Freelii provides a seamless experience for collecting cash
                payments through MoneyGram locations worldwide.
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                  <Card key={index}>
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#3390EC] text-white">
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-base text-gray-500">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-[#3390EC]">
          <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block">Sign up for Freelii today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-[#E7F3FF]">
              Join thousands of users who trust Freelii for their international
              cash collections.
            </p>
            <Button className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-[#3390EC] hover:bg-[#E7F3FF] sm:w-auto">
              Sign up for free
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* How it works section */}
        <div className="overflow-hidden bg-gray-50 py-16 lg:py-24">
          <div className="relative mx-auto max-w-xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <div className="relative">
              <h2 className="text-center text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                How Freelii Works
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-center text-xl text-gray-500">
                Collecting your money with Freelii is simple and secure. Follow
                these easy steps:
              </p>
            </div>

            <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
              <div className="relative">
                <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  For Senders
                </h3>
                <p className="mt-3 text-lg text-gray-500">
                  Sending money to your recipients is quick and easy with
                  Freelii.
                </p>
                <dl className="mt-10 space-y-10">
                  {[
                    {
                      name: "Create an account",
                      description:
                        "Sign up for Freelii and verify your identity.",
                    },
                    {
                      name: "Initiate a transfer",
                      description:
                        "Enter the recipient's details and the amount you want to send.",
                    },
                    {
                      name: "Choose MoneyGram",
                      description:
                        "Select MoneyGram as the payout method for cash collection.",
                    },
                    {
                      name: "Complete the payment",
                      description:
                        "Pay for your transfer using your preferred method.",
                    },
                  ].map((item, index) => (
                    <div key={index} className="relative">
                      <dt>
                        <CheckCircle
                          className="absolute h-6 w-6 text-green-500"
                          aria-hidden="true"
                        />
                        <p className="ml-9 text-lg font-medium leading-6 text-gray-900">
                          {item.name}
                        </p>
                      </dt>
                      <dd className="ml-9 mt-2 text-base text-gray-500">
                        {item.description}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="relative -mx-4 mt-10 lg:mt-0" aria-hidden="true">
                <Image
                  className="h-32 w-full object-cover pl-10 sm:h-72 md:h-96 lg:h-full lg:w-full"
                  src="/b.jpg"
                  width={490}
                  height={490}
                  alt="Person collecting money"
                />
              </div>
            </div>

            <div className="relative mt-12 sm:mt-16 lg:mt-24">
              <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:items-center lg:gap-8">
                <div className="lg:col-start-2">
                  <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                    For Recipients
                  </h3>
                  <p className="mt-3 text-lg text-gray-500">
                    Collecting your money is simple and convenient with
                    Freelii&apos;s MoneyGram integration.
                  </p>

                  <dl className="mt-10 space-y-10">
                    {[
                      {
                        name: "Receive notification",
                        description:
                          "Get notified when a transfer is ready for collection.",
                      },
                      {
                        name: "Find a MoneyGram location",
                        description:
                          "Locate a nearby MoneyGram agent using our app or website.",
                      },
                      {
                        name: "Provide necessary information",
                        description:
                          "Show your ID and provide the unique transaction code.",
                      },
                      {
                        name: "Collect your cash",
                        description:
                          "Receive your money in cash from the MoneyGram agent.",
                      },
                    ].map((item, index) => (
                      <div key={index} className="relative">
                        <dt>
                          <CheckCircle
                            className="absolute h-6 w-6 text-green-500"
                            aria-hidden="true"
                          />
                          <p className="ml-9 text-lg font-medium leading-6 text-gray-900">
                            {item.name}
                          </p>
                        </dt>
                        <dd className="ml-9 mt-2 text-base text-gray-500">
                          {item.description}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="relative -mx-4 mt-10 lg:col-start-1 lg:mt-0">
                  <Image
                    className="h-32 w-full object-cover pl-10 sm:h-72 md:h-96 lg:h-full lg:w-full"
                    src="/a.jpg"
                    width={490}
                    height={490}
                    alt="Person collecting money"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </a>

            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Instagram</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
            </a>

            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-base text-gray-400">
              &copy; 2024 Freelii, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
