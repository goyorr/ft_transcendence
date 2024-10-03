const HeaderSkeleton = () =>
{
    return (  <div className="header animate-pulse">
    <section className="bg-gradient-to-b from-[#3b82f6] gradient absolute min-h-[14rem] w-[100%]"></section>
    <section className="flex flex-col w-full h-full mx-auto container">
      <section className="w-full min-h-64 rounded-lg relative mt-8">
        <section className="w-full h-full bg-gray-300 rounded-lg"></section>
      </section>
      <section className="avatar flex lg:flex-row lg:justify-between flex-col gap-2">
        <section className="flex flex-row px-2 gap-4">
          <div className="w-[90px] h-[90px] sm:w-[180px] sm:h-[180px] relative -mt-[2rem] border-[6px] border-[#000] bg-gray-300 rounded-full"></div>
          <section className="mt-4 flex flex-col">
            <div className="h-6 w-40 bg-gray-300 rounded-md"></div>
            <div className="h-4 w-20 bg-gray-300 rounded-md mt-2"></div>
            <div className="h-4 w-24 bg-gray-300 rounded-md mt-2"></div>
            <section className="flex flex-row items-center gap-4 mt-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </section>
            <section className="flex flex-row items-center gap-4 mt-6">
              <div className="w-32 h-8 bg-gray-300 rounded-md"></div>
            </section>
            <section className="flex flex-row gap-8 items-start justify-start mt-8">
              <div className="flex flex-col items-center">
                <div className="h-4 w-10 bg-gray-300 rounded-md"></div>
                <div className="h-4 w-10 bg-gray-300 rounded-md mt-1"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-4 w-10 bg-gray-300 rounded-md"></div>
                <div className="h-4 w-10 bg-gray-300 rounded-md mt-1"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-4 w-10 bg-gray-300 rounded-md"></div>
                <div className="h-4 w-10 bg-gray-300 rounded-md mt-1"></div>
              </div>
            </section>
          </section>
        </section>
        <section className="flex flex-col gap-4">
          <div className="h-4 w-40 bg-gray-300 rounded-md mt-4"></div>
          <div className="h-4 w-24 bg-gray-300 rounded-md"></div>
          <div className="h-4 w-24 bg-gray-300 rounded-md"></div>
        </section>
      </section>
      <section className="mt-4">
        <ul className="flex flex-row gap-6 items-center justify-center lg:items-start lg:justify-start">
          <li className="bg-[#111424] p-4 rounded-lg w-24 h-12"></li>
          <li className="bg-[#111424] p-4 rounded-lg w-24 h-12"></li>
          <li className="bg-[#111424] p-4 rounded-lg w-24 h-12"></li>
        </ul>
      </section>
    </section>
  </div>
)
}

export default HeaderSkeleton