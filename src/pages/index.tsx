///import styles from '@/styles/Home.module.css'
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { useSession } from 'next-auth/react';

export default function IndexPage() {
  const { data: session } = useSession()

  return (
  <div className='grid grid-rows-[min-content_1fr_min-content] min-h-screen'>
      <Head>
          <title>LiftLog</title>
          <meta property="og:title" content="My page title" key="title" />
      </Head>
      <Navbar/>
      <div className="hero bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
          {session ? <h1>SIGNED IN</h1> : <h1>Not Signed In</h1>}
            <h1 className="text-5xl font-bold">Hello there</h1>
            <p className="py-6">Welcome to LiftLog.</p>
            <Link href="dashboard" className="btn btn-primary">Go to Dashboard</Link>
          </div>
        </div>
      </div>
      <Footer/>
  </div>
  );
}
