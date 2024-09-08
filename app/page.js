import Link from "next/link";

export default function Home() {
   return (
      <main>
         <div className="flex flex-col h-[calc(100vh-73px)] justify-center items-center gap-5 bg-sky-300">
            <div className="flex flex-col bg-white p-8 rounded shadow gap-5 w-9/12">
               <h1 className="text-center text-xl font-semibold">
                  Welcome to the BlockChain Based Product Traceability System
               </h1>
               <div>
                  <h2 className="text-md font-semibold">Features:</h2>
                  <ul className="list-disc list-inside">
                     <li>BlockChain Based Product Tracking</li>
                     <li>Product Unique Code Generation</li>
                     <li>Product Status Updation</li>
                     <li>Decentralized System</li>
                     <li>High Security Standards</li>
                  </ul>
               </div>
               <div className="flex justify-center gap-x-10">
                  <Link
                     href="/demo"
                     className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                     Try it Now!
                  </Link>
                  <Link
                     href="/signup"
                     className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                     Sign Up
                  </Link>
               </div>
            </div>
         </div>
      </main>
   );
}
