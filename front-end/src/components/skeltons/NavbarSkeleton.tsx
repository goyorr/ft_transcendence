const NavbarSkeleton: React.FC = () => {
    return (
      <div className="Navbr w-full bg-red flex justify-between items-center container rounded-lg animate-pulse">
        <div className="w-1/3 h-8 bg-gray-300 rounded-md"></div>
        <div className="mb-4 mt-6 flex justify-center items-center">
          <div className="avatar flex justify-center items-center">
            <div className="icons justify-center gap-4 relative hidden sm:flex">
              <div className="bg-gray-300 p-2 rounded-xl w-8 h-8"></div>
              <div className="bg-gray-300 p-2 rounded-xl w-8 h-8"></div>
              <div className="bg-gray-300 p-2 rounded-xl w-8 h-8"></div>
            </div>
            <div className="avatar flex justify-between items-center ml-8">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="ml-2">
                <div className="h-4 w-24 bg-gray-300 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
export default NavbarSkeleton;