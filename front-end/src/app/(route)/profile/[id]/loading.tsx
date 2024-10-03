import NavbarSkeleton from "@/components/skeltons/NavbarSkeleton"
import HeaderSkeleton from "@/components/skeltons/HeaderSkeleton"


export default function Loading(){
    return (
      
<div className="flex flex-row relative">
          <div className="w-full h-full relative flex flex-col">
          <NavbarSkeleton></NavbarSkeleton>
          <section className="w-[100%] h-[100%] flex flex-col">
            <HeaderSkeleton></HeaderSkeleton>
          </section>
        </div>
      </div>
    )
}

