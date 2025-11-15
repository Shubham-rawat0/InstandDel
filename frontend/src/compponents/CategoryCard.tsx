interface Category {
  name: string;
  image: string;
}

function CategoryCard({
  data,
  onClick,
}: {
  data: Category;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}) {
  return (
    <div
      className="w-[120px] h-[120px] md:w-[180px] md:h-[190px] rounded-2xl border-2 border-[#ff4d2d] shrink-0 relative overflow-hidden bg-white shadow-xl shadow-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick} 
    >
      <img
        src={data.image}
        alt={data.name}
        className="w-full h-full object-cover transform hover:scale-110 transition duration-300"
      />
      <div className="absolute bottom-0 w-full left-0 bg-[#ffffff96] px-3 py-1 rounded-t-xl text-center shadow text-sm font-medium text-gray-800 backdrop-blur">
        {data.name}
      </div>
    </div>
  );
}

export default CategoryCard;
