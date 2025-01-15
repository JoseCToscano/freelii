"use client";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { useState } from "react";
import { Check } from "lucide-react";


export default function FreeliiLandingPage() {

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutateAsync: addToWaitlist } = api.users.addToWaitlist.useMutation({
    onSuccess: () => {
      toast.success("You're on the waitlist!");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const contact = formData.get("contact") as string;
    console.log(name, contact);
    await addToWaitlist({ name, contact }).finally(() => {
      setIsLoading(false);
    });
    
  };

  return (
    <div className="min-h-screen  flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <a href="#" className="text-2xl font-bold text-[#3390EC] font-nunito flex items-center">
                <Image 
                  src="/logo.png"
                  alt="Freelii Logo"
                  width={80}
                  height={80}
                  className="mr-2"
                />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero section */}
        <div className="relative overflow-hidden bg-white">
          <div className="mx-auto max-w-7xl">
            <div className="relative z-10 flex items-center justify-between">
              {/* Left side content */}
              <div className="w-1/2 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
                <main className="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                  <span className="text-gray-500">
                    Secure, fast, and accessible worldwide.
                  </span>
                  <div className="lg:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                      <span className="block xl:inline bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                        Make money move
                      </span>{" "}
                      <span>
                        <Image
                          src="/Freeli-text.png"
                          alt="Freelii"
                          width={200}
                          height={60}
                          className="inline-block"
                        />
                      </span>
                    </h1>
                    <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg md:mt-5 md:text-xl">
                      Send and receive money anywhere, anytime. Collect cash from loved ones abroad.
                    </p>
                  </div>
                </main>
              </div>

              {/* Right side form */}
              <div className="w-1/2 p-8">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6 text-[#4ab3e8]">Join Our Waitlist</h2>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Full Name"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        id="contact"
                        name="contact"
                        type="text"
                        placeholder="Email or Phone Number"
                        className="w-full"
                        required
                      />
                    </div>
                    <Button 
                      type="submit"
                      className={`w-full transition-all duration-200 ${
                        isSuccess 
                          ? "bg-green-500 hover:bg-green-600" 
                          : "bg-[#4ab3e8] hover:bg-blue-400"
                      } text-white`}
                      disabled={isLoading || isSuccess}
                    >
                      {isLoading ? (
                        "Loading..."
                      ) : isSuccess ? (
                        <span className="flex items-center justify-center">
                          <Check className="mr-2 h-5 w-5 animate-bounce" /> Success!
                        </span>
                      ) : (
                        "Request Early Access"
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-base text-gray-400">
              &copy; 2025 Freelii, LLC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
