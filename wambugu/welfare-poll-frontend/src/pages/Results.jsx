import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { voteAPI } from '../services/api';
import { initializeSocket, getSocket, disconnectSocket } from '../services/socket';
import Navbar from '../components/Navbar';

const COLORS = ['#4F46E5', '#10B981'];

const Results = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
    setupRealtimeUpdates();

    return () => {
      disconnectSocket();
    };
  }, []);

  const fetchResults = async () => {
    try {
      const response = await voteAPI.getResults();
      const apiData = response.data.data;

      // Transform API response to match frontend structure
      const transformedResults = {
        totalVotes: apiData.total_votes || 0,
        option1Count: apiData.results?.option1?.count || 0,
        option1Percentage: apiData.results?.option1?.percentage || 0,
        option2Count: apiData.results?.option2?.count || 0,
        option2Percentage: apiData.results?.option2?.percentage || 0,
      };

      setResults(transformedResults);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch results');
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    initializeSocket();
    const socket = getSocket();

    socket.on('voteResults', (apiData) => {
      // Transform Socket.io data to match frontend structure
      const transformedResults = {
        totalVotes: apiData.total_votes || 0,
        option1Count: apiData.results?.option1?.count || 0,
        option1Percentage: apiData.results?.option1?.percentage || 0,
        option2Count: apiData.results?.option2?.count || 0,
        option2Percentage: apiData.results?.option2?.percentage || 0,
      };
      setResults(transformedResults);
    });

    socket.on('connect', () => {
      console.log('Connected to real-time updates');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from real-time updates');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Micro-Insurance (Britam)', value: results.option1Count, percentage: results.option1Percentage },
    { name: 'Internal Welfare', value: results.option2Count, percentage: results.option2Percentage },
  ];

  const barData = [
    { name: 'Option 1', votes: results.option1Count, label: 'Micro-Insurance' },
    { name: 'Option 2', votes: results.option2Count, label: 'Internal Welfare' },
  ];

  const meetsMinimum = results.option2Count >= 150;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Live Poll Results
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Real-time voting statistics
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Live Updates Active
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Votes</h3>
            <p className="mt-2 text-4xl font-bold text-indigo-600">{results.totalVotes}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Leading Option</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {results.option1Count > results.option2Count ? 'Micro-Insurance' :
               results.option2Count > results.option1Count ? 'Internal Welfare' : 'Tied'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Option 2 Status</h3>
            {meetsMinimum ? (
              <div className="mt-2 flex items-center">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xl font-bold text-green-600">Qualified</span>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-xl font-bold text-amber-600">
                  {results.option2Count}/150 votes
                </p>
                <p className="text-sm text-gray-500">
                  {150 - results.option2Count} more needed
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Vote Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Vote Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="votes" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Option 1 Details */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-lg p-8 border-2 border-indigo-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-600 text-white text-xl font-bold">
                  1
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">Micro-Insurance Cover</h3>
                <p className="text-sm text-indigo-600 font-semibold">Britam</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Votes</span>
                  <span className="text-2xl font-bold text-indigo-600">{results.option1Count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${results.option1Percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">Percentage</span>
                  <span className="text-lg font-semibold text-indigo-600">{results.option1Percentage}%</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Annual Cost:</span> Kshs. 7,300
                </p>
              </div>
            </div>
          </div>

          {/* Option 2 Details */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg p-8 border-2 border-green-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-600 text-white text-xl font-bold">
                  2
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">Internal Welfare</h3>
                <p className="text-sm text-green-600 font-semibold">Contribution Scheme</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Votes</span>
                  <span className="text-2xl font-bold text-green-600">{results.option2Count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${results.option2Percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">Percentage</span>
                  <span className="text-lg font-semibold text-green-600">{results.option2Percentage}%</span>
                </div>
              </div>

              <div className={`rounded-lg p-4 ${meetsMinimum ? 'bg-green-100 border border-green-300' : 'bg-yellow-50 border border-yellow-300'}`}>
                {meetsMinimum ? (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-green-800">Minimum Requirement Met</p>
                      <p className="text-xs text-green-700">This option can be implemented</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-yellow-800">Minimum Not Met</p>
                      <p className="text-xs text-yellow-700">Needs {150 - results.option2Count} more votes to qualify</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Monthly Cost:</span> Kshs. 500
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
