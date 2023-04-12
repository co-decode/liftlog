import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";

type Inputs = {
  username: string,
  password: string,
}

export default function LoginPage() {
  const { 
    register, handleSubmit, watch, formState: {errors} 
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
  }
  return (
  <div className="min-h-screen grid grid-rows-[min-content_1fr_min-content]">
    <Head>
      <title>LiftLog Login</title>
    </Head>
    <Navbar/>
    <div className="grid place-items-center">
      <div className="card w-auto bg-base-100 shadow-xl my-4 mx-2 lg:w-96">
        <div className="card-body">
          <h2 className="card-title">Log In</h2>
          <p>Please log in to your account</p>
          <form 
            onSubmit={handleSubmit(onSubmit)}
            className="grid place-items-center"
          >
            {/* Username Field */}
            <div className="form-control w-full my-3">
              <label className="input-group input-group-vertical">
                <span>Username</span>
                <input
                  type="text" 
                  placeholder="Your Username" 
                  className="input input-bordered"
                  {...register("username", {required: true})} />
              </label>
            </div>
            {/* Password Field */}
            <div className="form-control w-full">
              <label className="input-group input-group-vertical">
                <span>Password</span>
                <input 
                  type="password" 
                  placeholder="Your Password" 
                  className="input input-bordered w-full" 
                  {...register("password", {required: true})} />
              </label>
            </div>

            <div className="flex justify-between w-full items-center flex-wrap my-2">
              {/* Remember Option */}
              <div className="form-control justify-self-start mr-3">
                <label className="label cursor-pointer ps-0">
                  <span className="label-text mr-3">Remember me</span> 
                  <input type="checkbox" className="checkbox" />
                </label>
              </div>
              <Link href="/" className="link link-secondary no-underline">Forgot your Password?</Link>
            </div>
            {/* Submit Button */}
            <div className="card-actions w-full mb-3">
              <button type="submit" className="btn btn-primary w-full">Log In</button>
            </div>
            <hr/>
            {/* OAuth Buttons */}
            <button 
              className="btn btn-secondary w-full"
              onClick={() => signIn(undefined, {callbackUrl: '/'})}
            >
              Log In with GitHub
            </button>
          </form>
        </div>
      </div>
    </div>
    <Footer/>
  </div>
  )
}
