import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col border border-black h-[calc(100vh-73px)] justify-center p-5">
        <h1 className="text-center text-xl font-semibold">Welcome to the BlockChain Based Product Traceability System</h1>
        <h2>Features:</h2>
        <ul>
          <li>BlockChain Based Product Tracking</li>
          <li>Product Unique Code Generation</li>
          <li>Product Updation</li>
          <li>Decentralized System</li>
          <li>High Security Standards</li>
          <li></li>
        </ul>
        <h2>Try it Now!</h2>
        <div className="flex justify-center gap-10 py-5">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Sign Up
          </button>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Login
          </button>
        </div>
      </div>
    </main>
  );
}
