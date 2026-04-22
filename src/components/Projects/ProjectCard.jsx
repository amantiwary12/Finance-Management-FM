import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaEye } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';

const ProjectCard = ({ project, onStatusUpdate, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-600',
      completed: 'bg-blue-100 text-blue-600',
      'on-hold': 'bg-yellow-100 text-yellow-600',
      cancelled: 'bg-red-100 text-red-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <Link to={`/projects/${project._id}`} className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
            {project.name}
          </h3>
        </Link>
        <select
          value={project.status}
          onChange={(e) => onStatusUpdate(project._id, e.target.value)}
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} border-0 focus:ring-2 focus:ring-blue-500`}
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <Link to={`/projects/${project._id}`}>
        <p className="text-gray-600 text-sm mb-4">{project.description || 'No description'}</p>
      </Link>

      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-gray-500 text-xs">Budget</p>
          <p className="text-lg font-bold text-blue-600">{formatCurrency(project.budget)}</p>
        </div>
        <Link 
          to={`/projects/${project._id}`}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
        >
          <FaEye /> View Details
        </Link>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={() => onDelete(project._id)}
          className="text-red-600 hover:text-red-700 p-2"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;