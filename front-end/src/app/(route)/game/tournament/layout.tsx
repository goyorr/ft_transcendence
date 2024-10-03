import NavBar from "@/components/NavBar"

const Layout = ({ children, }: { children: React.ReactNode }) => {
    return (
        <>
            <div className="flex flex-row relative">
                <div className="w-full h-full relative flex flex-col">
                    <NavBar></NavBar>
                    <section className="w-[100%] h-[100%] flex flex-col">
                        <section className="container mx-auto mt-4">
                            {children}
                        </section>
                    </section>
                </div>
            </div>
        </>
    )
}



export default Layout