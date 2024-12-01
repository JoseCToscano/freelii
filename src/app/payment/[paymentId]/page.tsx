import { type Metadata } from "next";
interface PageParams {
  params: {
    paymentId: string;
  };
}

export const metadata: Metadata = {
  title: "Freelii",
  description: "Sent you a payment",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "Money for christmas dinner",
    description: "Johnny sent you a payment",
    url: "https://freelii.app",
    images: [
      "https://a61a-2806-261-48f-8688-244e-261-5f7-19f3.ngrok-free.app/api/og?amount=220&message=Money%20for%20christmas%20dinner&from=Johnny",
    ],
  },
};

async function Page({ params }: PageParams) {
  console.log(params);
  const { paymentId } = await params;

  return (
    <div>
      <h1>Encrypted Open Graph Image.</h1>
      <a href={`/api/og`} target="_blank" rel="noreferrer">
        <code>HI</code>
      </a>
    </div>
  );
}

export default Page;
