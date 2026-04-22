// import React from 'react';
// import { formatCurrency } from '../../utils/formatters';

// const BudgetList = ({ budgets }) => {
//   if (budgets.length === 0) {
//     return (
//       <div className="text-center py-12 bg-white rounded-xl">
//         <p className="text-gray-500">No budgets set yet</p>
//         <p className="text-sm text-gray-400 mt-2">Click the button above to set your first budget</p>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {budgets.map((budget) => (
//         <div key={budget._id} className="card p-6">
//           <div className="flex justify-between items-start mb-4">
//             <h3 className="text-lg font-semibold text-gray-800">{budget.category}</h3>
//             <span className="text-2xl font-bold text-primary-600">
//               {formatCurrency(budget.amount)}
//             </span>
//           </div>
          
//           <div className="mt-4">
//             <div className="flex justify-between text-sm text-gray-600 mb-2">
//               <span>Usage</span>
//               <span>0%</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div
//                 className="bg-primary-600 h-2 rounded-full"
//                 style={{ width: '0%' }}
//               />
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default BudgetList;

import React from 'react'

const BudgetList = () => {
  return (
    <div>
      
    </div>
  )
}

export default BudgetList
