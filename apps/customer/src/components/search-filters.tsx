export function SearchFilters() {
  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <h3 className='text-lg font-semibold mb-4'>Filters</h3>
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Cuisine
          </label>
          <select className='w-full border border-gray-300 rounded-md px-3 py-2'>
            <option value=''>All Cuisines</option>
            <option value='italian'>Italian</option>
            <option value='chinese'>Chinese</option>
            <option value='japanese'>Japanese</option>
            <option value='indian'>Indian</option>
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Price Range
          </label>
          <select className='w-full border border-gray-300 rounded-md px-3 py-2'>
            <option value=''>Any Price</option>
            <option value='1'>Rs - Budget Friendly</option>
            <option value='2'>Rs Rs - Moderate</option>
            <option value='3'>Rs Rs Rs - Expensive</option>
            <option value='4'>Rs Rs Rs Rs - Very Expensive</option>
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Rating
          </label>
          <select className='w-full border border-gray-300 rounded-md px-3 py-2'>
            <option value=''>Any Rating</option>
            <option value='4'>4+ Stars</option>
            <option value='3'>3+ Stars</option>
            <option value='2'>2+ Stars</option>
          </select>
        </div>
      </div>
    </div>
  );
}
