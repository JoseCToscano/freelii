import { type Metadata } from "next";
type tParams = Promise<{
  paymentId: string;
}>;

export const metadata: Metadata = {
  title: "Freelii",
  description: "Sent you a payment",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "Money for christmas dinner",
    description: "Johnny sent you a payment",
    url: "https://freelii.app",
    images: [
      "https://freelii.app/api/og?amount=220&message=Money%20for%20christmas%20dinner&from=Johnny",
    ],
  },
};

async function Page(props: { params: tParams }) {
  const { paymentId } = await props.params;

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
