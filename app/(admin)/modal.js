
export default function modal({ children, modalVisible, onClick }) {
    return <div onClick={onClick} className={"z-10 flex justify-center items-center left-0 top-0 w-screen h-screen bg-[rgba(0,0,0,0.4)] " + (modalVisible ? "fixed" : "hidden")}>
        {children}
    </div>
}