
export default function modal({ children }) {
    return <div className="z-10 fixed flex justify-center items-center left-0 top-0 w-screen h-screen bg-black">
        <div className="">
            {children}
        </div>
    </div>
}