import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrash, FaUpload, FaEye } from 'react-icons/fa';
import projectService from '../services/projects';
import ImportModal from '../components/Projects/ImportProjectData';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedProjectForImport, setSelectedProjectForImport] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const fetchCalled = useRef(false);

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchCalled.current = true;
      fetchProjects();
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAllProjects();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await projectService.createProject(projectData);
      setProjects([response.data.project, ...projects]);
      toast.success('Project created successfully');
      setIsModalOpen(false);
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment.');
      } else {
        toast.error('Failed to create project');
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await projectService.updateProjectStatus(id, status);
      setProjects(projects.map(p => p._id === id ? { ...p, status } : p));
      toast.success('Project status updated');
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait.');
      } else {
        toast.error('Failed to update status');
      }
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(id);
        setProjects(projects.filter(p => p._id !== id));
        toast.success('Project deleted');
      } catch (error) {
        if (error.response?.status === 429) {
          toast.error('Too many requests. Please wait.');
        } else {
          toast.error('Failed to delete project');
        }
      }
    }
  };

  const handleImportSuccess = () => {
    toast.success('Transactions imported successfully!');
    // Refresh projects or show updated data
    fetchProjects();
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-600',
      completed: 'bg-blue-100 text-blue-600',
      'on-hold': 'bg-yellow-100 text-yellow-600',
      cancelled: 'bg-red-100 text-red-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const filteredProjects = projects.filter(project =>
    statusFilter === 'all' ? true : project.status === statusFilter
  );

  const openImportModal = (project) => {
    setSelectedProjectForImport(project);
    setIsImportModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-12">Loading projects...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-600 mt-1">Manage and track your projects</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Status Filters */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'completed', 'on-hold', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                  {project.status === 'active' && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">Active</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">ID: {project._id}</p>
              </div>
              <select
                value={project.status}
                onChange={(e) => handleUpdateStatus(project._id, e.target.value)}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} border-0 focus:ring-2 focus:ring-blue-500`}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <p className="text-gray-600 text-sm mb-4">{project.description || 'No description'}</p>

            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-gray-500 text-xs">Budget</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(project.budget)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Created</p>
                <p className="text-sm text-gray-700">{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-4 border-t">
              <button
                onClick={() => openImportModal(project)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <FaUpload className="w-3 h-3" />
                Import Data
              </button>
              <button
                onClick={() => handleDeleteProject(project._id)}
                className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Delete project"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No projects found</p>
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <ProjectModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {/* Import Modal */}
      {isImportModalOpen && selectedProjectForImport && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false);
            setSelectedProjectForImport(null);
          }}
          project={selectedProjectForImport}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
};

// Project Modal Component
const ProjectModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    budget: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      budget: parseFloat(formData.budget),
    });
    setFormData({ name: '', budget: '', description: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Project</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default Projects;