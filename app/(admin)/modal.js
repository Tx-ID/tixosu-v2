import { useEffect, useRef } from "react"

export default function modal({ children, modalVisible, onClick }) {
    const ref = useRef();

    useEffect(() => {
        const checkIfClickedOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                onClick()
            }
        }

        document.addEventListener("click", checkIfClickedOutside)
        return () => {
            document.removeEventListener("click", checkIfClickedOutside)
        }
    })

    return <div className={"z-10 flex justify-center items-center left-0 top-0 w-screen h-screen bg-[rgba(0,0,0,0.6)] " + (modalVisible ? "fixed" : "hidden")}>
        <div ref={ref}>{children}</div>
    </div>
}