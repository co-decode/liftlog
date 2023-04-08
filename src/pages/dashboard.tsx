import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import Link from "next/link";

export default function Log() {

  return (
      <div className="min-h-screen grid grid-rows-[min-content_1fr_min-content]">
        <Navbar/>
      <div className="drawer drawer-mobile h-auto">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col items-center justify-center">
            <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label>
            <h1>What is up, this is the dashboard</h1>
            <Link className="btn" href="/">Home</Link>
          
          </div> 
          <div className="drawer-side">
            <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
            <ul className="menu p-4 w-80 bg-base-100 text-base-content">
              <li><a>Sidebar Item 1</a></li>
              <li><a>Sidebar Item 2</a></li>
            </ul>
          
          </div>
        </div>
        <Footer/>
      </div>
  );
};
