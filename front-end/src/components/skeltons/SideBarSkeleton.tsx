const SideBarSkeleton: React.FC = () => {
    return (
      <div className="lg:min-w-[22rem] md:min-w-[18rem] sm:min-w-[14rem] max-h-[100%] h-screen hidden xl:flex sm:flex-col animate-pulse">
        <span className="flex justify-between p-4 items-center border-[#1d4ed8]">
          <div className="h-6 w-24 bg-gray-300 rounded-md"></div>
          <div className="h-6 w-6 bg-gray-300 rounded-md"></div>
        </span>
        <ul className="p-4 flex flex-col gap-6 bg-gradient-to-r from-[#020617] h-[100%]">
          {[...Array(8)].map((_, index) => (
            <li key={index} className="p-2 rounded-md font-light px-[10px] py-[6px] text-sm max-w-[14rem]">
              <div className="flex flex-row gap-4 items-center">
                <div className="h-6 w-6 bg-gray-300 rounded-md"></div>
                <div className="h-4 w-24 bg-gray-300 rounded-md"></div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  
export default SideBarSkeleton